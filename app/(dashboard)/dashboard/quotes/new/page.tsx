'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { getBillingVatRate } from '@/lib/api/billing';
import { getCustomers, Customer } from '@/lib/api/customers';
import { getJobs, Job } from '@/lib/api/jobs';
import { createQuote, createLineItem } from '@/lib/api/quotes';
import { formatCurrency } from '@/lib/invoices';
import { showError, showInfo, showSuccess } from '@/lib/ui/alerts';

type LineItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
  is_taxable: boolean;
};

type QuoteInput = {
  customer: string;
  job_type: string;
  quote_date: string;
  valid_until: string;
  deposit: string;
  payment_note: string;
  notes: string;
  items: LineItemInput[];
};

function createQuoteNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const stamp = date.getTime().toString().slice(-6);
  return `QT-${year}-${stamp}`;
}

function getOpenJobs(jobs: Job[]) {
  return jobs.filter((job) => job.jobstatus?.toLowerCase() === 'open');
}

function formatApiError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data;

    if (typeof data === 'object' && data !== null) {
      const messages = Object.entries(data)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) {
            return value.map((message) => `${field}: ${message}`);
          }

          return typeof value === 'string' ? [`${field}: ${value}`] : [];
        });

      if (messages.length > 0) {
        return messages.join('\n');
      }
    }
  }

  return error instanceof Error ? error.message : 'Something went wrong!';
}

export default function AddQuote() {
  const router = useRouter();
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsHasMore, setJobsHasMore] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsLoadingMore, setJobsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vatRate, setVatRate] = useState(20);
  const [vatRateLoading, setVatRateLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<QuoteInput>({
    defaultValues: {
      job_type: '',
      deposit: '0.00',
      payment_note: '',
      notes: '',
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unit_price: 0, is_taxable: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");

  useEffect(() => {
    const fetchQuoteFormData = async () => {
      const [customersResult, vatRateResult, jobsResult] = await Promise.allSettled([
        getCustomers(),
        getBillingVatRate(),
        getJobs(1),
      ]);

      if (customersResult.status === 'fulfilled') {
        setCustomers(customersResult.value.results);
      } else {
        console.error('Error fetching customers:', customersResult.reason);
      }

      if (vatRateResult.status === 'fulfilled') {
        const nextVatRate = vatRateResult.value.vat_rate;
        setVatRate(Number.isFinite(nextVatRate) ? nextVatRate : 20);
      } else {
        console.error('Error fetching VAT rate:', vatRateResult.reason);
      }

      if (jobsResult.status === 'fulfilled') {
        setJobs(getOpenJobs(jobsResult.value.results));
        setJobsPage(1);
        setJobsHasMore(Boolean(jobsResult.value.next));
      } else {
        console.error('Error fetching jobs:', jobsResult.reason);
        setJobs([]);
        setJobsHasMore(false);
      }

      setLoading(false);
      setVatRateLoading(false);
      setJobsLoading(false);
    };

    if (session?.accessToken) {
      fetchQuoteFormData();
    }
  }, [session]);

  const loadMoreJobs = async () => {
    try {
      setJobsLoadingMore(true);
      const nextPage = jobsPage + 1;
      const data = await getJobs(nextPage);
      setJobs((previousJobs) => [...previousJobs, ...getOpenJobs(data.results)]);
      setJobsPage(nextPage);
      setJobsHasMore(Boolean(data.next));
    } catch (error) {
      console.error('Error loading more jobs:', error);
      await showError('Failed to load more jobs.');
    } finally {
      setJobsLoadingMore(false);
    }
  };

  const onSubmit: SubmitHandler<QuoteInput> = async (data) => {
    if (!session?.accessToken) {
      await showInfo("You must be logged in to create a quote.");
      return;
    }

    try {
      // 1. Create the quote
      const quoteData = {
        customer: parseInt(data.customer),
        job_post: Number(data.job_type),
        quote_date: data.quote_date,
        valid_until: data.valid_until,
        deposit: data.deposit || '0.00',
        payment_note: data.payment_note,
        notes: data.notes,
        invoice_number: createQuoteNumber(),
      };
      
      const newQuote = await createQuote(quoteData);
      
      // 2. Create line items
      const itemPromises = data.items.map(item => 
        createLineItem({
          quote: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          vat_rate:vatRate,
        })
      );
      
      await Promise.all(itemPromises);
      
      await showSuccess("Quote created successfully!");
      router.push("/dashboard/quotes");
    } catch (error: unknown) {
      console.error("Error creating quote:", error);
      await showError(formatApiError(error));
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let vat = 0;
    
    watchItems.forEach(item => {
      const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
      subtotal += lineTotal;
      if (item.is_taxable) {
        vat += lineTotal * (vatRate / 100);
      }
    });
    
    return { subtotal, vat, total: subtotal + vat };
  };

  const { subtotal, vat, total } = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard/quotes" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">New Quote</h1>
          <p className="text-slate-500 text-sm">Create a new quote for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Quote Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quote Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer */}
            <div>
              <label htmlFor="customer" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Customer *
              </label>
              <select
                id="customer"
                {...register("customer", { required: "Customer is required" })}
                disabled={loading || customers.length === 0}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="" disabled>
                  {loading
                    ? 'Loading customers...'
                    : customers.length === 0
                      ? 'No customers available'
                      : 'Select a customer'}
                </option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.customer_name}</option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="job_type" className="block text-[13px] font-bold text-slate-800 mb-1.5">
               Select Job *
              </label>
              <select
                id="job_type"
                {...register("job_type", { required: "Job type is required" })}
                disabled={jobsLoading || jobs.length === 0}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="" disabled>
                  {jobsLoading
                    ? 'Loading jobs...'
                    : jobs.length === 0
                      ? 'No jobs available'
                      : 'Select a job'}
                </option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              {jobsHasMore && (
                <button
                  type="button"
                  onClick={loadMoreJobs}
                  disabled={jobsLoadingMore}
                  className="mt-2 text-xs font-bold text-[#22d3ee] transition-colors hover:text-[#06b6d4] disabled:text-slate-400"
                >
                  {jobsLoadingMore ? 'Loading more...' : 'More'}
                </button>
              )}
              {errors.job_type && <p className="mt-1 text-xs text-red-500">{errors.job_type.message}</p>}
            </div>

            {/* Quote Date */}
            <div>
              <label htmlFor="quote_date" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Quote Date *
              </label>
              <input
                type="date"
                id="quote_date"
                {...register("quote_date", { required: "Quote date is required" })}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="valid_until" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Valid Until *
              </label>
              <input
                type="date"
                id="valid_until"
                {...register("valid_until", { required: "Validity date is required" })}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Deposit % */}
            <div>
              <label htmlFor="deposit" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Deposit % (Optional)
              </label>
              <input
                type="number"
                id="deposit"
                {...register("deposit")}
                placeholder="0"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Payment Note */}
            <div>
              <label htmlFor="payment_note" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Payment Note (Optional)
              </label>
              <input
                type="text"
                id="payment_note"
                {...register("payment_note")}
                placeholder="Payment terms..."
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Notes / Assumptions */}
          <div>
            <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Notes / Assumptions (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              placeholder="Additional notes or assumptions..."
              className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
            <button 
              type="button" 
              onClick={() => append({ description: '', quantity: 1, unit_price: 0, is_taxable: true })}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Item Rows */}
          {fields.map((field, index) => (
            <div key={field.id} className="border border-slate-100 rounded-xl p-6 mb-6 relative group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-bold text-slate-500">Item {index + 1}</p>
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                <div className="lg:col-span-6">
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Description *</label>
                  <input
                    type="text"
                    {...register(`items.${index}.description` as const, { required: true })}
                    placeholder="Item description"
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    {...register(`items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
                    placeholder="1"
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Unit Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_price` as const, { required: true, valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...register(`items.${index}.is_taxable` as const)}
                    className="w-4 h-4 text-[#22d3ee] bg-[#f4f6f8] border-slate-300 rounded focus:ring-[#22d3ee]" 
                  />
                  <span className="text-[13px] font-bold text-slate-700">
                    Taxable ({vatRateLoading ? '...' : vatRate}% VAT)
                  </span>
                </label>
                <div className="text-right">
                  <span className="text-[15px] font-bold text-slate-900">
                    {formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.unit_price || 0))}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">VAT ({vatRateLoading ? '...' : vatRate}%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(vat)}</span>
              </div>
              <div className="pt-3 mt-1 flex justify-between items-center">
                <span className="text-[15px] font-bold text-slate-900">Total:</span>
                <span className="text-lg font-bold text-[#22d3ee]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link 
            href="/dashboard/quotes"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors disabled:bg-slate-300"
          >
            {isSubmitting ? "Creating..." : "Create Quote"}
          </button>
        </div>
      </form>
    </div>
  );
}

