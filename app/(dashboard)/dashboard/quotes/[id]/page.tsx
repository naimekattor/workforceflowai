'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CreditCard,
  Loader2,
  ReceiptText,
  StickyNote,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getQuote, getStripeCheckoutUrl, Quote } from '@/lib/api/quotes';
import { Customer, getCustomer } from '@/lib/api/customers';
import { formatCurrency } from '@/lib/invoices';
import { showError } from '@/lib/ui/alerts';

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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
        const quoteData = await getQuote(id);

        if (!isMounted) return;

        setQuote(quoteData);

        try {
          const customerData = await getCustomer(quoteData.customer);
          if (isMounted) {
            setCustomer(customerData);
          }
        } catch (customerError) {
          console.error('Error fetching quote customer:', customerError);
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

  const handleCheckout = async () => {
    if (!quote) return;

    try {
      setCheckoutLoading(true);
      const { checkout_url } = await getStripeCheckoutUrl(quote.id);
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      await showError(getErrorMessage(error, 'Failed to initiate checkout. Please try again.'));
    } finally {
      setCheckoutLoading(false);
    }
  };

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

  const customerLabel = customer?.customer_name || quote.customer_name || `Customer ID: ${quote.customer}`;
  const deposit = Number.parseFloat(quote.deposit || '0');

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

        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="inline-flex w-fit items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:bg-slate-300"
        >
          {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Pay Deposit / Checkout
        </button>
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
          <DetailRow label="Job Type" value={quote.job_type || 'No job'} />
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
            <DetailRow label="Job Type" value={quote.job_type || 'No job'} />
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
            <DetailRow label="Customer ID" value={quote.customer} />
            <DetailRow label="Owner ID" value={quote.owner} />
            <DetailRow
              label="Customer Email"
              value={customer?.customer_email || 'Not included in quote response'}
              muted={!customer?.customer_email}
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
          <DetailRow label="Payment Note" value={quote.payment_note || 'No payment note added.'} muted={!quote.payment_note} />
          <DetailRow label="Notes" value={quote.notes || 'No notes added.'} muted={!quote.notes} />
        </div>
      </div>
    </div>
  );
}
