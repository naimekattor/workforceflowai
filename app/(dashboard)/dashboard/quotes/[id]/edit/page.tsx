"use client"
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '../../../../../../lib/invoices';
import { getQuote, updateQuote, Quote } from '@/lib/api/quotes';
import { getCustomers, Customer } from '@/lib/api/customers';
import { getJobs, Job } from '@/lib/api/jobs';
import { showSuccess, showError } from '@/lib/ui/alerts';

interface ExtendedLineItem {
  id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: string;
  vat_rate?: string;
  subtotal_price?: string;
  total_price?: string;
}

interface ExtendedQuote extends Quote {
  line_items?: ExtendedLineItem[];
  vat_rate?: string;
  payment_status?: string;
}

export default function EditQuote() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [quote, setQuote] = useState<ExtendedQuote | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lineItems, setLineItems] = useState<ExtendedLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentStyle, setPaymentStyle] = useState<'Advance' | 'Split' | 'On_Completion'>('On_Completion');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchQuoteData = async () => {
      try {
        setLoading(true);
        setError('');
        const [quoteData, customersData, jobsData] = await Promise.all([
          getQuote(id),
          getCustomers(1),
          getJobs(1)
        ]);

        if (isMounted) {
          const extendedQuote = quoteData as ExtendedQuote;
          setQuote(extendedQuote);
          setCustomers(customersData.results || []);
          setJobs(jobsData.results || []);
          const rawStyle = extendedQuote.payment_style;
          let normalizedStyle: 'Advance' | 'Split' | 'On_Completion' = 'On_Completion';
          if (rawStyle) {
            const lower = rawStyle.toLowerCase().trim();
            if (lower === 'advance') normalizedStyle = 'Advance';
            else if (lower === 'split') normalizedStyle = 'Split';
            else if (lower === 'on_completion' || lower === 'on complete' || lower === 'oncomplete') {
              normalizedStyle = 'On_Completion';
            }
          }
          setPaymentStyle(normalizedStyle);
          
          const quoteVat = extendedQuote.vat_rate || "15.00";
          const items = extendedQuote.line_items || [];
          setLineItems(items.map(item => ({
            ...item,
            unit: item.unit_price || "item",
            vat_rate: item.vat_rate !== undefined ? String(item.vat_rate) : (parseFloat(item.total_price || "0") > parseFloat(item.subtotal_price || "0") ? quoteVat : "0.00"),
          })));
        }
      } catch (err) {
        console.error('Error fetching quote edit data:', err);
        if (isMounted) {
          setError('Failed to load quote details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuoteData();

    return () => {
      isMounted = false;
    };
  }, [id, session?.accessToken, status]);

  const addLineItem = () => {
    const quoteVat = quote?.vat_rate || "15.00";
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unit: 'item',
        unit_price: '0.00',
        vat_rate: quoteVat,
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof ExtendedLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken || submitting) return;

    try {
      setSubmitting(true);
      
      const form = e.currentTarget;
      const customerVal = (form.elements.namedItem('customer') as HTMLSelectElement)?.value;
      const jobVal = (form.elements.namedItem('job') as HTMLSelectElement)?.value;
      const quoteDateVal = (form.elements.namedItem('quoteDate') as HTMLInputElement)?.value;
      const validUntilVal = (form.elements.namedItem('validUntil') as HTMLInputElement)?.value;
      const paymentStyleVal = (form.elements.namedItem('payment_style') as HTMLSelectElement)?.value;
      const splitPercentageVal = (form.elements.namedItem('split_percentage') as HTMLInputElement)?.value;
      const notesVal = (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value;

      if (!customerVal) {
        await showError("Customer is required.");
        setSubmitting(false);
        return;
      }

      // Prepare payload to send to updateQuote
      const payload: Partial<ExtendedQuote> = {
        customer: parseInt(customerVal),
        job_post: jobVal ? parseInt(jobVal) : null,
        quote_date: quoteDateVal,
        valid_until: validUntilVal,
        payment_style: paymentStyleVal as any,
        split_percentage: paymentStyleVal === 'Split' ? parseFloat(splitPercentageVal || '0') : null,
        notes: notesVal,
        line_items: lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
        }))
      };

      await updateQuote(Number(id), payload);
      await showSuccess("Quote updated successfully!");
      router.push("/dashboard/quotes");
    } catch (err) {
      console.error("Error updating quote:", err);
      await showError("Failed to update quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading quote details...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <Link href="/dashboard/quotes" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Quote not found.'}
        </div>
      </div>
    );
  }

  const quoteVatRate = parseFloat(quote.vat_rate || '15.00');

  const computedSubtotal = lineItems.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + (qty * price);
  }, 0);

  const computedVat = lineItems.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = parseFloat(item.unit_price) || 0;
    const isTaxed = parseFloat(item.vat_rate || '0') > 0;
    if (isTaxed) {
      const itemVat = parseFloat(item.vat_rate || '0') || quoteVatRate;
      return sum + (qty * price * (itemVat / 100));
    }
    return sum;
  }, 0);

  const computedTotal = computedSubtotal + computedVat;

  const selectedCustomerId = quote.customer ?? quote.customer_id ?? customers.find(c => c.customer_name === quote.customer_name)?.id;
  const selectedJobId = quote.job_details?.id ?? (typeof quote.job_details === 'number' ? quote.job_details : undefined) ?? jobs.find(j => j.title === quote.job_title || j.title === quote.job_type)?.id;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard/quotes" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Edit Quote</h1>
          <p className="text-slate-500 text-sm">Update quote details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                name="customer"
                defaultValue={selectedCustomerId || ""}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="" disabled>Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job */}
            <div>
              <label htmlFor="job" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Job (Optional)
              </label>
              <select
                id="job"
                name="job"
                defaultValue={selectedJobId || ""}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="">No job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Quote Date */}
            <div>
              <label htmlFor="quoteDate" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Quote Date *
              </label>
              <input
                type="date"
                id="quoteDate"
                name="quoteDate"
                defaultValue={quote.quote_date ? quote.quote_date.split('T')[0] : ""}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="validUntil" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Valid Until *
              </label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                defaultValue={quote.valid_until ? quote.valid_until.split('T')[0] : ""}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label htmlFor="payment_style" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Payment Terms (Optional)
              </label>
              <select
                id="payment_style"
                name="payment_style"
                value={paymentStyle}
                onChange={(e) => setPaymentStyle(e.target.value as any)}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  paddingRight: `2.5rem`
                }}
              >
                <option value="On_Completion">On Completion</option>
                <option value="Advance">Advance</option>
                <option value="Split">Split</option>
              </select>

              {paymentStyle === 'Split' && (
                <div className="mt-3">
                  <label htmlFor="split_percentage" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                    Split Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="split_percentage"
                    name="split_percentage"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={quote.split_percentage || ""}
                    required
                    placeholder="e.g. 30"
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes / Assumptions */}
          <div>
            <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Notes / Assumptions (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={quote.notes || ""}
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
              onClick={addLineItem}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Item Row list */}
          {lineItems.map((item, index) => {
            const qty = item.quantity || 0;
            const price = parseFloat(item.unit_price) || 0;
            const isTaxed = parseFloat(item.vat_rate || '0') > 0;
            const itemVat = isTaxed ? (parseFloat(item.vat_rate || '0') || quoteVatRate) : 0;
            const itemTotal = qty * price * (1 + itemVat / 100);

            return (
              <div key={index} className="border border-slate-100 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-bold text-slate-500">Item {index + 1}</p>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                  <div className="lg:col-span-8">
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Description *</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Quantity *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="1"
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                  </div>
                  {/* <div className="lg:col-span-2">
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Unit *</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                      placeholder="item"
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                  </div> */}
                  <div className="lg:col-span-2">
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Unit Price (£) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isTaxed}
                      onChange={(e) => updateLineItem(index, 'vat_rate', e.target.checked ? String(quoteVatRate) : '0.00')}
                      className="w-4 h-4 text-[#22d3ee] bg-[#f4f6f8] border-slate-300 rounded focus:ring-[#22d3ee]" 
                    />
                    <span className="text-[13px] font-bold text-slate-700">Taxable ({quoteVatRate}% VAT)</span>
                  </label>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-slate-900">{formatCurrency(itemTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(computedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">VAT ({quoteVatRate}%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(computedVat)}</span>
              </div>
              <div className="pt-3 mt-1 flex justify-between items-center">
                <span className="text-[15px] font-bold text-slate-900">Total:</span>
                <span className="text-lg font-bold text-[#22d3ee]">{formatCurrency(computedTotal)}</span>
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
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
