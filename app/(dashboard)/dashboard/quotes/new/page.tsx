'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown, Plus, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { getBillingVatRate } from '@/lib/api/billing';
import { getCustomers, Customer, createCustomer, searchCustomersByName } from '@/lib/api/customers';
import { getJobs, Job } from '@/lib/api/jobs';
import { createQuote, createLineItem } from '@/lib/api/quotes';
import { formatCurrency } from '@/lib/invoices';
import { showError, showInfo, showSuccess } from '@/lib/ui/alerts';
import { getUserProfile, getBusinessDetails } from '@/lib/api/business';

type CustomerFormInput = {
  customer_name: string;
  customer_email: string;
  phone_number: string;
  customer_type: 'Domestic' | 'Commercial';
  billing_address: string;
  site_address: string;
  notes?: string;
};

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
  payment_style: 'Advance' | 'Split' | 'On_Completion';
  split_percentage?: string;
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

function getNextCustomerPage(nextUrl: string | null): number | null {
  if (!nextUrl) return null;

  try {
    const url = new URL(nextUrl, 'http://localhost');
    const page = Number(url.searchParams.get('page'));
    return Number.isInteger(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

function mergeCustomers(
  currentCustomers: Customer[],
  nextCustomers: Customer[]
): Customer[] {
  const customerIds = new Set(currentCustomers.map((customer) => customer.id));
  const newCustomers = nextCustomers.filter(
    (customer) => !customerIds.has(customer.id)
  );

  return [...currentCustomers, ...newCustomers];
}

export default function AddQuote() {
  const router = useRouter();
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const [nextCustomerPage, setNextCustomerPage] = useState<number | null>(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsHasMore, setJobsHasMore] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsLoadingMore, setJobsLoadingMore] = useState(false);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vatRate, setVatRate] = useState(20);
  const [vatRateLoading, setVatRateLoading] = useState(true);
  const [defaultValidityDays, setDefaultValidityDays] = useState(30);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const jobDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register: registerModalCustomer,
    handleSubmit: handleModalCustomerSubmit,
    reset: resetModalCustomer,
    setValue: setModalCustomerValue,
    formState: { errors: modalCustomerErrors, isSubmitting: isModalCustomerSubmitting },
  } = useForm<CustomerFormInput>({
    defaultValues: {
      customer_type: 'Domestic',
      billing_address: '',
      site_address: '',
      notes: '',
    }
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<QuoteInput>({
    defaultValues: {
      job_type: '',
      deposit: '0.00',
      payment_style: 'On_Completion',
      split_percentage: '',
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
  const selectedCustomerId = watch('customer');
  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(selectedCustomerId)
  );
  const selectedJobId = watch('job_type');
  const selectedJob = jobs.find((job) => job.id === Number(selectedJobId));
  const watchPaymentStyle = watch("payment_style");

  const watchQuoteDate = watch("quote_date");

  useEffect(() => {
    if (!watchQuoteDate) return;

    try {
      const baseDate = new Date(watchQuoteDate);
      if (!Number.isNaN(baseDate.getTime())) {
        const nextValidUntil = new Date(baseDate.getTime() + defaultValidityDays * 24 * 60 * 60 * 1000);
        setValue('valid_until', nextValidUntil.toISOString().split('T')[0], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (err) {
      console.error('Error calculating validity date:', err);
    }
  }, [watchQuoteDate, defaultValidityDays, setValue]);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(customers);
      setIsSearchingCustomers(false);
      return;
    }

    setIsSearchingCustomers(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchCustomersByName(customerSearch);
        setFilteredCustomers(results);
      } catch (err) {
        console.error('Error searching customers:', err);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [customerSearch, customers]);

  const onModalCustomerSubmit: SubmitHandler<CustomerFormInput> = async (data) => {
    if (!session?.accessToken) {
      await showInfo("You must be logged in to create a customer.");
      return;
    }

    try {
      const newCustomer = await createCustomer(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      setFilteredCustomers((prev) => [newCustomer, ...prev]);
      setValue('customer', String(newCustomer.id), {
        shouldValidate: true,
        shouldDirty: true,
      });

      resetModalCustomer();
      setIsCreateCustomerModalOpen(false);
      await showSuccess("Customer created successfully!");
    } catch (error) {
      console.error("Error creating customer:", error);
      const msg = error instanceof Error ? error.message : "Something went wrong!";
      await showError(msg);
    }
  };

  useEffect(() => {
    if (!isCustomerDropdownOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
        setCustomerSearch(''); // Clear search on click outside
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isCustomerDropdownOpen]);

  useEffect(() => {
    if (!isJobDropdownOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        jobDropdownRef.current &&
        !jobDropdownRef.current.contains(event.target as Node)
      ) {
        setIsJobDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isJobDropdownOpen]);

  useEffect(() => {
    const fetchQuoteFormData = async () => {
      const [customersResult, vatRateResult, jobsResult] = await Promise.allSettled([
        getCustomers(1),
        getBillingVatRate(),
        getJobs(1),
      ]);

      if (customersResult.status === 'fulfilled') {
        setCustomers(customersResult.value.results);
        setFilteredCustomers(customersResult.value.results);
        setNextCustomerPage(getNextCustomerPage(customersResult.value.next));
        setCustomerError('');
      } else {
        console.error('Error fetching customers:', customersResult.reason);
        setCustomers([]);
        setFilteredCustomers([]);
        setNextCustomerPage(null);
        setCustomerError(formatApiError(customersResult.reason));
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

      // Fetch default_payment_terms (validity days) dynamically
      let validityDays = 30; // fallback
      try {
        const userProfile = await getUserProfile();
        if (userProfile.usertype) {
          const businessData = await getBusinessDetails(userProfile.usertype);
          if (businessData?.default_payment_terms) {
            const parsed = Number(businessData.default_payment_terms);
            if (!Number.isNaN(parsed) && parsed > 0) {
              validityDays = parsed;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching business settings for quote validity:', err);
      }

      setDefaultValidityDays(validityDays);

      // Set initial valid_until based on quote_date + validityDays
      const today = new Date();
      const initialValidUntil = new Date(today.getTime() + validityDays * 24 * 60 * 60 * 1000);
      setValue('valid_until', initialValidUntil.toISOString().split('T')[0], {
        shouldValidate: true,
        shouldDirty: true,
      });

      setLoading(false);
      setVatRateLoading(false);
      setJobsLoading(false);
    };

    if (session?.accessToken) {
      fetchQuoteFormData();
    }
  }, [session]);

  const handleSelectCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      if (!prev.some((c) => c.id === customer.id)) {
        return [customer, ...prev];
      }
      return prev;
    });

    setValue('customer', String(customer.id), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setCustomerSearch('');
    setIsCustomerDropdownOpen(false);
  };

  const loadMoreCustomers = async () => {
    if (!nextCustomerPage || loadingMoreCustomers) {
      return;
    }

    try {
      setLoadingMoreCustomers(true);
      setCustomerError('');
      const data = await getCustomers(nextCustomerPage);
      setCustomers((currentCustomers) => {
        const next = mergeCustomers(currentCustomers, data.results);
        if (!customerSearch.trim()) {
          setFilteredCustomers(next);
        }
        return next;
      });
      setNextCustomerPage(getNextCustomerPage(data.next));
      setIsCustomerDropdownOpen(true);
    } catch (error) {
      console.error('Error loading more customers:', error);
      setCustomerError(formatApiError(error));
    } finally {
      setLoadingMoreCustomers(false);
    }
  };

  const handleSelectJob = (job: Job) => {
    setValue('job_type', String(job.id), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsJobDropdownOpen(false);
  };

  const loadMoreJobs = async () => {
    try {
      setJobsLoadingMore(true);
      const nextPage = jobsPage + 1;
      const data = await getJobs(nextPage);
      setJobs((previousJobs) => [...previousJobs, ...getOpenJobs(data.results)]);
      setJobsPage(nextPage);
      setJobsHasMore(Boolean(data.next));
      setIsJobDropdownOpen(true);
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
        payment_style: data.payment_style,
        split_percentage: data.payment_style === 'Split' ? parseFloat(data.split_percentage || '0') : null,
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
              <label htmlFor="customer_dropdown" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Customer *
              </label>
              <input
                type="hidden"
                id="customer"
                {...register("customer", { required: "Customer is required" })}
              />
              <div className="flex gap-2 items-center">
                <div ref={customerDropdownRef} className="relative flex-1">
                  <button
                    type="button"
                    id="customer_dropdown"
                    disabled={loading || customers.length === 0}
                    onClick={() =>
                      setIsCustomerDropdownOpen((isOpen) => !isOpen)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearch('');
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isCustomerDropdownOpen}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 pr-10 text-left text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 disabled:text-slate-400"
                  >
                    {loading
                      ? 'Loading customers...'
                      : customers.length === 0
                        ? 'No customers available'
                        : selectedCustomer?.customer_name || 'Select a customer'}
                  </button>
                  <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  
                  {isCustomerDropdownOpen && (
                    <div
                      role="listbox"
                      aria-labelledby="customer_dropdown"
                      className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg flex flex-col"
                    >
                      {/* Search Bar inside dropdown */}
                      <div className="p-2 border-b border-slate-100 bg-white z-10 sticky top-0">
                        <input
                          type="text"
                          placeholder="Search customer..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full bg-[#f4f6f8] border-0 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                          onClick={(e) => e.stopPropagation()} // Prevent close on click
                        />
                      </div>
                      
                      <div className="overflow-y-auto max-h-48">
                        {isSearchingCustomers ? (
                          <div className="py-6 px-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Searching...
                          </div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="py-6 px-4 text-center flex flex-col items-center justify-center">
                            <div className="relative mb-3 flex items-center justify-center">
                              <div className="absolute w-10 h-10 rounded-full bg-cyan-50 animate-ping opacity-75"></div>
                              <div className="relative p-2.5 rounded-full bg-cyan-100 text-cyan-600">
                                <Search className="w-5 h-5 animate-bounce" />
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">No customers found</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Try a different search term</p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomerDropdownOpen(false);
                                setIsCreateCustomerModalOpen(true);
                                setModalCustomerValue('customer_name', customerSearch, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#42a5f5] hover:bg-blue-500 rounded-md transition-colors shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              Add "{customerSearch}"
                            </button>
                          </div>
                        ) : (
                          filteredCustomers.map((customer) => {
                            const isSelected = selectedCustomerId === String(customer.id);

                            return (
                              <button
                                key={customer.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelectCustomer(customer)}
                                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-cyan-50 font-semibold text-cyan-700'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {customer.customer_name}
                              </button>
                            );
                          })
                        )}
                        {nextCustomerPage && !customerSearch.trim() && (
                          <button
                            type="button"
                            onClick={loadMoreCustomers}
                            disabled={loadingMoreCustomers}
                            className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 disabled:text-slate-400 disabled:hover:bg-white"
                          >
                            {loadingMoreCustomers ? 'Loading more customers...' : 'Load more customers'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                
              </div>
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
              {customerError && <p className="mt-1 text-xs text-red-500">{customerError}</p>}
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="job_type_dropdown" className="block text-[13px] font-bold text-slate-800 mb-1.5">
               Select Job *
              </label>
              <input
                type="hidden"
                id="job_type"
                {...register("job_type", { required: "Job type is required" })}
              />
              <div ref={jobDropdownRef} className="relative">
                <button
                  type="button"
                  id="job_type_dropdown"
                  disabled={jobsLoading || jobs.length === 0}
                  onClick={() =>
                    setIsJobDropdownOpen((isOpen) => !isOpen)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setIsJobDropdownOpen(false);
                    }
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isJobDropdownOpen}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 pr-10 text-left text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 disabled:text-slate-400"
                >
                  {jobsLoading
                    ? 'Loading jobs...'
                    : jobs.length === 0
                      ? 'No jobs available'
                      : selectedJob?.title || 'Select a job'}
                </button>
                <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {isJobDropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="job_type_dropdown"
                    className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {jobs.map((job) => {
                      const isSelected = selectedJobId === String(job.id);

                      return (
                        <button
                          key={job.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectJob(job)}
                          className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-cyan-50 font-semibold text-cyan-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {job.title}
                        </button>
                      );
                    })}
                    {jobsHasMore && (
                      <button
                        type="button"
                        onClick={loadMoreJobs}
                        disabled={jobsLoadingMore}
                        className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 disabled:text-slate-400 disabled:hover:bg-white"
                      >
                        {jobsLoadingMore ? 'Loading more...' : 'More'}
                      </button>
                    )}
                  </div>
                )}
              </div>
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
            {/* <div>
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
            </div> */}

            
          </div>
          {/* Payment Terms */}
            <div className="mb-6">
              <label htmlFor="payment_style" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Payment Terms (Optional)
              </label>
              <select
                id="payment_style"
                {...register("payment_style")}
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

              {watchPaymentStyle === 'Split' && (
                <div className="mt-3">
                  <label htmlFor="split_percentage" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                    Split Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="split_percentage"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register("split_percentage", {
                      required: watchPaymentStyle === 'Split' ? "Percentage is required" : false,
                      min: { value: 0, message: "Percentage cannot be less than 0" },
                      max: { value: 100, message: "Percentage cannot exceed 100" }
                    })}
                    placeholder="e.g. 30"
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  />
                  {errors.split_percentage && (
                    <p className="mt-1 text-xs text-red-500">{errors.split_percentage.message}</p>
                  )}
                </div>
              )}
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
      {/* Create Customer Modal */}
      {isCreateCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">New Customer</h3>
                <p className="text-xs text-slate-500">Add a new customer to your database</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalCustomerSubmit(onModalCustomerSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Customer Name *</label>
                  <input
                    type="text"
                    {...registerModalCustomer("customer_name", { required: "Name is required" })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 placeholder:text-slate-400"
                    placeholder="John Doe"
                  />
                  {modalCustomerErrors.customer_name && (
                    <p className="mt-1 text-xs text-red-500">{modalCustomerErrors.customer_name.message}</p>
                  )}
                </div>

                {/* Customer Type */}
                <div className="relative">
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Customer Type *</label>
                  <div className="relative">
                    <select
                      {...registerModalCustomer("customer_type", { required: true })}
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none pr-10"
                    >
                      <option value="Domestic">Domestic</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans font-sans">Email *</label>
                  <input
                    type="email"
                    {...registerModalCustomer("customer_email", { required: "Email is required" })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 placeholder:text-slate-400"
                    placeholder="john@example.com"
                  />
                  {modalCustomerErrors.customer_email && (
                    <p className="mt-1 text-xs text-red-500">{modalCustomerErrors.customer_email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Phone *</label>
                  <input
                    type="tel"
                    {...registerModalCustomer("phone_number", { required: "Phone is required" })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 placeholder:text-slate-400"
                    placeholder="+44 20 1234 5678"
                  />
                  {modalCustomerErrors.phone_number && (
                    <p className="mt-1 text-xs text-red-500">{modalCustomerErrors.phone_number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Billing Address */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Billing Address *</label>
                  <input
                    type="text"
                    {...registerModalCustomer("billing_address", { required: "Billing address is required" })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 placeholder:text-slate-400"
                    placeholder="123 Main Street, London, UK"
                  />
                  {modalCustomerErrors.billing_address && (
                    <p className="mt-1 text-xs text-red-500">{modalCustomerErrors.billing_address.message}</p>
                  )}
                </div>

                {/* Site Address */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Site Address *</label>
                  <input
                    type="text"
                    {...registerModalCustomer("site_address", { required: "Site address is required" })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 placeholder:text-slate-400"
                    placeholder="456 Work Street, London, UK"
                  />
                  {modalCustomerErrors.site_address && (
                    <p className="mt-1 text-xs text-red-500">{modalCustomerErrors.site_address.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-800 mb-1.5 font-sans">Notes (Optional)</label>
                  <textarea
                    rows={4}
                    {...registerModalCustomer("notes")}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 py-3 resize-none placeholder:text-slate-400"
                    placeholder="Additional information about this customer..."
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalCustomerSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#22d3ee] hover:bg-[#06b6d4] text-white text-sm font-medium transition-colors disabled:bg-slate-300 shadow-sm"
                >
                  {isModalCustomerSubmitting ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

