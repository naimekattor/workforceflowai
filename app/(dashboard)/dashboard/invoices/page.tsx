'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getRecentInvoices, RecentInvoice } from '@/lib/api/dashboard';
import { getCustomer } from '@/lib/api/customers';
import { formatCurrency } from '@/lib/invoices';
import { sendInvoiceEmail } from '@/lib/api/invoices';
import { showError, showSuccess } from '@/lib/ui/alerts';

type CustomerNameById = Record<number, string>;

function formatDateTime(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function formatAmount(value?: string | number) {
  const amount = Number(value || 0);
  return formatCurrency(Number.isNaN(amount) ? 0 : amount);
}

function getCustomerLabel(invoice: RecentInvoice, customerNameById: CustomerNameById) {
  return invoice.customer_name || customerNameById[invoice.customer] || `Customer ID: ${invoice.customer}`;
}

function getStatusClassName(status: string) {
  if (status === 'Accepted') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Sent') return 'bg-blue-100 text-blue-700';
  if (status === 'Rejected') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export default function Invoices() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [customerNameById, setCustomerNameById] = useState<CustomerNameById>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const data = await getRecentInvoices();
        const invoiceRows = Array.isArray(data) ? data : [];
        const customerIds = Array.from(
          new Set(
            invoiceRows
              .filter((invoice) => !invoice.customer_name)
              .map((invoice) => invoice.customer)
              .filter(Boolean)
          )
        );
        const customerResults = await Promise.allSettled(
          customerIds.map(async (customerId) => {
            const customer = await getCustomer(customerId);
            return [customerId, customer.customer_name] as const;
          })
        );
        const loadedCustomerNames = customerResults.reduce<CustomerNameById>(
          (names, result) => {
            if (result.status === 'fulfilled') {
              const [customerId, customerName] = result.value;
              names[customerId] = customerName;
            }

            return names;
          },
          {}
        );

        if (isMounted) {
          setInvoices(invoiceRows);
          setCustomerNameById(loadedCustomerNames);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        if (isMounted) {
          setErrorMessage('Failed to load invoices');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, status]);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      const searchableValues = [
        invoice.invoice_number,
        invoice.quote_uuid,
        invoice.quote_status,
        getCustomerLabel(invoice, customerNameById),
        invoice.total_price,
      ];

      return searchableValues.some((value) =>
        String(value).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [customerNameById, invoices, query]);

  const handleSendInvoice = async (invoiceId: number) => {
    try {
      await sendInvoiceEmail(invoiceId);
      await showSuccess("Invoice email sent successfully!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      await showError("Failed to send invoice email.");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Invoices</h1>
          <p className="text-slate-500 text-sm">Manage your recent invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 max-w-full">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoices..."
              className="block w-full pl-10 pr-3 py-2 border-0 bg-[#f4f6f8] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 transition-all"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="px-6 py-3 border-b border-red-100 bg-red-50 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="w-full max-w-[calc(100vw-2rem)] lg:max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] whitespace-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Invoice Number</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Quote UUID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Total</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Created</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="text-[13px] font-medium text-[#22d3ee] hover:text-[#06b6d4]">
                        {invoice.invoice_number || `Invoice ${invoice.id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">
                      {getCustomerLabel(invoice, customerNameById)}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">
                      <span className="inline-block max-w-[220px] truncate align-bottom" title={invoice.quote_uuid}>
                        {invoice.quote_uuid}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getStatusClassName(invoice.quote_status)}`}>
                        {invoice.quote_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-900">
                      {formatAmount(invoice.total_price)}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">
                      {formatDateTime(invoice.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="inline-flex p-1.5 text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label={`View invoice ${invoice.invoice_number || invoice.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleSendInvoice(invoice.id)}
                        className="inline-flex p-1.5 text-cyan-600 hover:text-cyan-700 transition-colors"
                        aria-label={`Send invoice ${invoice.invoice_number || invoice.id}`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-[13px] text-slate-500">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
