'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CreditCard,
  ReceiptText,
  StickyNote,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getQuote, Quote } from '@/lib/api/quotes';
import { Customer, getCustomer } from '@/lib/api/customers';
import { getJob, Job } from '@/lib/api/jobs';
import { formatCurrency } from '@/lib/invoices';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data as { detail?: string };
    return data.detail || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function getStatusClassName(status: string) {
  if (status === 'Accepted') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Sent') return 'bg-blue-100 text-blue-700';
  if (status === 'Rejected') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

function getQuoteCustomerId(quote: Quote) {
  return quote.customer ?? quote.customer_id;
}

function getQuoteJobId(quote: Quote) {
  if (typeof quote.job_details === 'number') return quote.job_details;
  return quote.job_details?.id;
}

function getQuoteJobTitle(quote: Quote, job: Job | null) {
  const embeddedJobTitle =
    typeof quote.job_details === 'object' && quote.job_details !== null ? quote.job_details.title : undefined;

  return job?.title || embeddedJobTitle || quote.job_title || quote.job_type || 'No job';
}

function DetailRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] text-slate-500 mb-1">{label}</p>
      <p className={`text-[14px] font-medium ${muted ? 'text-slate-500' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        setCustomer(null);
        setJob(null);
        const quoteData = await getQuote(id);

        if (!isMounted) return;

        setQuote(quoteData);

        const customerId = getQuoteCustomerId(quoteData);
        if (customerId !== undefined && customerId !== null) {
          try {
            const customerData = await getCustomer(customerId);
            if (isMounted) {
              setCustomer(customerData);
            }
          } catch (customerError) {
            console.error('Error fetching quote customer:', customerError);
          }
        }

        const jobId = getQuoteJobId(quoteData);
        if (jobId !== undefined && jobId !== null) {
          try {
            const jobData = await getJob(jobId);
            if (isMounted) {
              setJob(jobData);
            }
          } catch (jobError) {
            console.error('Error fetching quote job:', jobError);
          }
        }
      } catch (error) {
        console.error('Error fetching quote details:', error);
        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Failed to load quote.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      isMounted = false;
    };
  }, [id, session?.accessToken, status]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading quote details...
      </div>
    );
  }

  if (errorMessage || !quote) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/quotes" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage || 'Quote not found.'}
        </div>
      </div>
    );
  }

  const customerId = getQuoteCustomerId(quote);
  const customerLabel =
    customer?.customer_name ||
    quote.customer_name ||
    (customerId !== undefined && customerId !== null
      ? `Customer ID: ${customerId}`
      : 'Customer');
  const deposit = Number.parseFloat(quote.deposit || '0');
  const jobTitle = getQuoteJobTitle(quote, job);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-start gap-6">
          <Link href="/dashboard/quotes" className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{quote.invoice_number}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusClassName(quote.quote_status)}`}>
                {quote.quote_status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Quote #{quote.id} for {customerLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <CalendarDays className="w-4 h-4 text-slate-400 mb-3" />
          <DetailRow label="Quote Date" value={formatDate(quote.quote_date)} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <CalendarDays className="w-4 h-4 text-slate-400 mb-3" />
          <DetailRow label="Valid Until" value={formatDate(quote.valid_until)} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <CreditCard className="w-4 h-4 text-slate-400 mb-3" />
          <DetailRow label="Deposit" value={formatCurrency(Number.isNaN(deposit) ? 0 : deposit)} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <Briefcase className="w-4 h-4 text-slate-400 mb-3" />
          <DetailRow label="Job Title" value={jobTitle} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Quote Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow label="Invoice Number" value={quote.invoice_number} />
            <DetailRow label="Internal ID" value={quote.id} />
            <DetailRow label="Status" value={quote.quote_status} />
            <DetailRow label="Job Title" value={jobTitle} />
            <DetailRow label="Created" value={formatDateTime(quote.created_at)} />
            <DetailRow label="Updated" value={formatDateTime(quote.updated_at)} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Customer & Ownership</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow label="Customer" value={customerLabel} />
            {/* <DetailRow label="Customer ID" value={customerId ?? '-'} /> */}
            <DetailRow label="Owner Name" value={quote.owner_name} />
            <DetailRow
              label="Customer Email"
              value={customer?.customer_email || quote.customer_email || 'Not included in quote response'}
              muted={!customer?.customer_email && !quote.customer_email}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Notes & Payment</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DetailRow 
            label="Payment Terms" 
            value={(() => {
              if (!quote.payment_style) {
                return quote.payment_note || 'No payment terms added.';
              }
              if (quote.payment_style === 'Split') {
                const percentage = quote.split_percentage ? `${parseFloat(quote.split_percentage.toString())}%` : '';
                return `Split ${percentage ? `(${percentage})` : ''}`.trim();
              }
              if (quote.payment_style === 'On_Completion') {
                return 'On Completion';
              }
              return quote.payment_style; // e.g. Advance
            })()} 
            muted={!quote.payment_style && !quote.payment_note} 
          />
          <DetailRow label="Notes" value={quote.notes || 'No notes added.'} muted={!quote.notes} />
        </div>
      </div>
    </div>
  );
}
