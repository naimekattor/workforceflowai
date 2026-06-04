'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Users, Briefcase, FileText, TrendingUp, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/invoices';
import { getCustomer } from '@/lib/api/customers';
import { 
  getDashboardStats, 
  getRecentQuotes, 
  getRecentInvoices,
  DashboardStats,
  RecentQuote,
  RecentInvoice
} from '@/lib/api/dashboard';

type CustomerNameById = Record<number, string>;
type CustomerBackedItem = {
  customer: number;
  customer_name?: string;
};

async function loadCustomerNames(items: CustomerBackedItem[]) {
  const customerIds = Array.from(
    new Set(
      items
        .filter((item) => !item.customer_name)
        .map((item) => item.customer)
        .filter(Boolean)
    )
  );

  const customerResults = await Promise.allSettled(
    customerIds.map(async (customerId) => {
      const customer = await getCustomer(customerId);
      return [customerId, customer.customer_name] as const;
    })
  );

  return customerResults.reduce<CustomerNameById>((names, result) => {
    if (result.status === 'fulfilled') {
      const [customerId, customerName] = result.value;
      names[customerId] = customerName;
    }

    return names;
  }, {});
}

function getCustomerName(item: CustomerBackedItem, customerNameById: CustomerNameById) {
  return item.customer_name || customerNameById[item.customer] || '';
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [customerNameById, setCustomerNameById] = useState<CustomerNameById>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsResult, quotesResult, invoicesResult] = await Promise.allSettled([
          getDashboardStats(),
          getRecentQuotes(),
          getRecentInvoices()
        ]);

        if (!isMounted) {
          return;
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value);
        } else {
          console.warn('Dashboard stats unavailable.');
          setStats(null);
        }

        const quotes = quotesResult.status === 'fulfilled' ? quotesResult.value : [];
        const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];
        const loadedCustomerNames = await loadCustomerNames([...quotes, ...invoices]);

        if (!isMounted) {
          return;
        }

        if (quotesResult.status === 'fulfilled') {
          setRecentQuotes(quotes);
        } else {
          console.warn('Recent quotes unavailable.');
          setRecentQuotes([]);
        }

        if (invoicesResult.status === 'fulfilled') {
          setRecentInvoices(invoices);
        } else {
          console.warn('Recent invoices unavailable.');
          setRecentInvoices([]);
        }
        setCustomerNameById(loadedCustomerNames);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, status]);

  const userName = session?.user?.name || 'User';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#22d3ee] mb-1">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {userName}! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers/new" className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Customer
          </Link>
          <Link href="/dashboard/quotes/new" className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Quote
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.total_customers ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#22d3ee]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Active Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.active_jobs ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#22d3ee]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Quotes Awaiting Response</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.quote_awating_response ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Accepted Quotes</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.quote_accepted ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Invoices Created</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.invoice_created ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Quotes</h2>
            <Link href="/dashboard/quotes" className="text-xs font-medium text-[#22d3ee] hover:text-[#06b6d4]">View all</Link>
          </div>
          <div className="p-6 space-y-4">
            {recentQuotes.length > 0 ? (
              recentQuotes.map((quote) => {
                const customerName = getCustomerName(quote, customerNameById);

                return (
                <div key={quote.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Q-{quote.quote_uuid.slice(0, 4)}</p>
                    {customerName && <p className="text-xs text-slate-500 mt-0.5">{customerName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(Number(quote.total_price || 0))}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                      quote.quote_status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {quote.quote_status}
                    </span>
                  </div>
                </div>
              );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent quotes</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Invoices</h2>
            <Link href="/dashboard/invoices" className="text-xs font-medium text-[#22d3ee] hover:text-[#06b6d4]">View all</Link>
          </div>
          <div className="p-6 space-y-4">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => {
                const customerName = getCustomerName(invoice, customerNameById);

                return (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{invoice.invoice_number || `Invoice ${invoice.id}`}</p>
                    {customerName && <p className="text-xs text-slate-500 mt-0.5">{customerName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(Number(invoice.total_price || 0))}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Created {new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent invoices</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity (Placeholder for now, but using live logic structure) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          <Link href="/dashboard/activity" className="text-xs font-medium text-[#22d3ee] hover:text-[#06b6d4]">View all</Link>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentQuotes.length === 0 && recentInvoices.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              [...recentQuotes.map(q => ({ title: "Quote created", desc: `Quote Q-${q.quote_uuid.slice(0, 4)} created`, meta: `Created at ${new Date(q.created_at).toLocaleString()}` })),
               ...recentInvoices.map(i => ({ title: "Invoice generated", desc: `Invoice ${i.invoice_number} created`, meta: `Created at ${new Date(i.created_at).toLocaleString()}` }))]
                .sort((a, b) => b.meta.localeCompare(a.meta))
                .slice(0, 8)
                .map((activity, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-100">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#22d3ee]"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{activity.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{activity.meta}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

