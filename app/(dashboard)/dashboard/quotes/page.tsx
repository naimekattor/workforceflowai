'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Send, X } from 'lucide-react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { formatCurrency } from '@/lib/invoices';
import { getQuotes, deleteQuote, sendQuoteEmail, sendFullPaymentLink, Quote } from '@/lib/api/quotes';
import { getCustomers, Customer } from '@/lib/api/customers';
import { useSession } from 'next-auth/react';
import { confirmAction, showError, showSuccess } from '@/lib/ui/alerts';

function getNextQuotePage(nextUrl: string | null): number | null {
  if (!nextUrl) return null;

  try {
    const url = new URL(nextUrl, 'http://localhost');
    const page = Number(url.searchParams.get('page'));
    return Number.isInteger(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

function mergeQuotes(currentQuotes: Quote[], nextQuotes: Quote[]): Quote[] {
  const quoteIds = new Set(currentQuotes.map((quote) => quote.id));
  const newQuotes = nextQuotes.filter((quote) => !quoteIds.has(quote.id));

  return [...currentQuotes, ...newQuotes];
}

export default function Quotes() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [nextQuotePage, setNextQuotePage] = useState<number | null>(null);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const getQuoteCustomerName = (quote: Quote) =>
    quote.customer_name ||
    customers.find((customer) => customer.id === quote.customer)?.customer_name ||
    `Customer ID: ${quote.customer}`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotesData, customersData] = await Promise.all([
        getQuotes(1),
        getCustomers(1)
      ]);
      setQuotes(quotesData.results);
      setTotalCount(quotesData.count);
      setNextQuotePage(getNextQuotePage(quotesData.next));
      setCustomers(customersData.results);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNextQuotePage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Delete quote?',
      text: 'This quote will be permanently removed.',
      confirmButtonText: 'Delete',
    });

    if (!confirmed) return;

    try {
      await deleteQuote(id);
      setQuotes(quotes.filter(q => q.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting quote:', error);
      await showError('Failed to delete quote');
    }
  };

  const openSendModal = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedQuoteId(null);
  };

  const handleSendEmail = async () => {
    if (!selectedQuoteId) return;

    try {
      setIsSending(true);
      const selectedQuote = quotes.find(q => q.id === selectedQuoteId);
      const isPartialPaid = selectedQuote?.quote_status?.toLowerCase() === 'partial paid';

      if (isPartialPaid) {
        await sendFullPaymentLink(selectedQuoteId);
        await showSuccess('Full payment link sent successfully to customer!');
      } else {
        await sendQuoteEmail(selectedQuoteId);
        await showSuccess('Quote sent successfully to customer!');
        
        // Update status in local state
        setQuotes(quotes.map(q => 
          q.id === selectedQuoteId ? { ...q, quote_status: 'Sent' } : q
        ));
      }
      
      closeSendModal();
    } catch (error) {
      const errorMessage = isAxiosError<{ message?: string; detail?: string }>(error)
        ? error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message
        : error instanceof Error
        ? error.message
        : "Something went wrong!";
      console.error('Error sending quote email:', error);
      await showError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadMoreQuotes = async () => {
    if (!nextQuotePage || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      const data = await getQuotes(nextQuotePage);
      setQuotes((currentQuotes) => mergeQuotes(currentQuotes, data.results));
      setTotalCount(data.count);
      setNextQuotePage(getNextQuotePage(data.next));
    } catch (error) {
      console.error('Error loading more quotes:', error);
      await showError('Failed to load more quotes');
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredQuotes = quotes.filter(q => 
    String(q.id).includes(searchTerm) || 
    getQuoteCustomerName(q).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);
  const isPartialPaid = selectedQuote?.quote_status?.toLowerCase() === 'partial paid';

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Quotes</h1>
          <p className="text-slate-500 text-sm">Create and manage quotes</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quotes/new" className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Quote
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 max-w-full">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-0 bg-[#f4f6f8] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full max-w-[calc(100vw-2rem)] lg:max-w-full overflow-x-auto">
          <table className="w-full min-w-[760px] whitespace-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Quote ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Customer Name</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Total</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading quotes...</td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No quotes found</td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/quotes/${quote.id}`} className="text-[13px] font-medium text-[#22d3ee] hover:text-[#06b6d4]">
                        Q-{quote.quote_uuid.slice(0, 4)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{getQuoteCustomerName(quote)}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{new Date(quote.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{formatCurrency(parseFloat(quote.price || '0'))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        quote.quote_status?.toLowerCase() === 'accepted' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : quote.quote_status?.toLowerCase() === 'sent'
                          ? 'bg-blue-100 text-blue-700'
                          : quote.quote_status?.toLowerCase() === 'partial paid'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {quote.quote_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/quotes/${quote.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`View quote ${quote.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/quotes/${quote.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`Edit quote ${quote.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openSendModal(quote.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                          aria-label={`Send quote ${quote.id}`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(quote.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete quote ${quote.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[13px] text-slate-500">
              Showing {filteredQuotes.length} of {totalCount} quotes
            </p>
            {nextQuotePage && (
              <button
                type="button"
                onClick={handleLoadMoreQuotes}
                disabled={loadingMore}
                className="inline-flex items-center justify-center self-start sm:self-auto px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors disabled:bg-slate-300"
              >
                {loadingMore ? 'Loading more...' : 'Load more quotes'}
              </button>
            )}
          </div>
        )}
      </div>

      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isPartialPaid ? 'Send Full Payment Link' : 'Send Quote'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isPartialPaid 
                    ? 'Send the remaining balance payment link to the customer'
                    : 'Send this quote to the customer\'s email'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSendModal}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close send quote modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
               <p className="text-sm text-slate-600">
                 {isPartialPaid 
                   ? 'Are you sure you want to send the rest amount payment link to the customer?' 
                   : 'Are you sure you want to send this quote via email to the customer?'}
               </p>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeSendModal}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSending}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-sm font-semibold text-white flex items-center gap-2"
              >
                {isSending ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4" />
                    {isPartialPaid ? 'Send Link' : 'Send Quote'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

