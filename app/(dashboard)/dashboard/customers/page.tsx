'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { getCustomers, deleteCustomer, Customer } from '@/lib/api/customers';
import { useSession } from 'next-auth/react';
import { confirmAction, showError } from '@/lib/ui/alerts';

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

export default function Customers() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCustomerPage, setNextCustomerPage] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting states
  const [sortKey, setSortKey] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = async (
    search = '',
    key = sortKey,
    order = sortOrder
  ) => {
    try {
      setLoading(true);
      const ordering = `${order === 'desc' ? '-' : ''}${key}`;
      const isPhone = /^[+\d\s\-()]+$/.test(search.trim()) && search.trim().replace(/[^\d]/g, '').length >= 3;
      const data = await getCustomers(
        1,
        isPhone ? "" : search,
        ordering,
        isPhone ? { phone_number: search } : undefined
      );
      setCustomers(data.results);
      setTotalCount(data.count);
      setNextCustomerPage(getNextCustomerPage(data.next));
    } catch (error) {
      console.error('Error fetching customers:', error);
      setNextCustomerPage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers(searchTerm, sortKey, sortOrder);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, sortKey, sortOrder, session]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Delete customer?',
      text: 'This customer will be permanently removed.',
      confirmButtonText: 'Delete',
    });

    if (!confirmed) return;

    try {
      await deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting customer:', error);
      await showError('Failed to delete customer');
    }
  };

  const handleLoadMoreCustomers = async () => {
    if (!nextCustomerPage || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortKey}`;
      const isPhone = /^[+\d\s\-()]+$/.test(searchTerm.trim()) && searchTerm.trim().replace(/[^\d]/g, '').length >= 3;
      const data = await getCustomers(
        nextCustomerPage,
        isPhone ? "" : searchTerm,
        ordering,
        isPhone ? { phone_number: searchTerm } : undefined
      );
      setCustomers((currentCustomers) =>
        mergeCustomers(currentCustomers, data.results)
      );
      setTotalCount(data.count);
      setNextCustomerPage(getNextCustomerPage(data.next));
    } catch (error) {
      console.error('Error fetching more customers:', error);
      await showError('Failed to load more customers');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const renderSortHeader = (label: string, key: string) => {
    const isSorted = sortKey === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className="px-6 py-4 text-sm font-bold text-slate-900 cursor-pointer hover:bg-slate-50/80 select-none group transition-colors"
      >
        <div className="flex items-center gap-1.5 font-bold">
          {label}
          <span className="flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
            {isSorted ? (
              sortOrder === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-[#22d3ee]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-[#22d3ee]" />
              )
            ) : (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUp className="w-3.5 h-3.5 text-slate-300" />
              </span>
            )}
          </span>
        </div>
      </th>
    );
  };

  const filteredCustomers = customers;

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#22d3ee] mb-1">Customers</h1>
          <p className="text-slate-500 text-sm">Manage your customer database</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers/new" className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 max-w-full">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-0 bg-slate-50 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 transition-all"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-all"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="w-full max-w-[calc(100vw-2rem)] lg:max-w-full overflow-x-auto">
          <table className="w-full min-w-[760px] whitespace-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {renderSortHeader('Customer Name', 'customer_name')}
                {renderSortHeader('Email', 'customer_email')}
                {renderSortHeader('Phone', 'phone_number')}
                {renderSortHeader('Type', 'customer_type')}
                {renderSortHeader('Date Created', 'created_at')}
                <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/customers/${customer.id}`} className="text-sm font-medium text-[#22d3ee] hover:text-[#06b6d4]">
                        {customer.customer_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.customer_email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.phone_number}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        customer.customer_type === 'Domestic' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {customer.customer_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`View customer ${customer.customer_name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/customers/${customer.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`Edit customer ${customer.customer_name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete customer ${customer.customer_name}`}
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
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing {filteredCustomers.length} of {totalCount} customers
            </p>
            {nextCustomerPage && (
              <button
                type="button"
                onClick={handleLoadMoreCustomers}
                disabled={loadingMore}
                className="inline-flex items-center justify-center self-start sm:self-auto px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors disabled:bg-slate-300"
              >
                {loadingMore ? 'Loading more...' : 'Load more customers'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

