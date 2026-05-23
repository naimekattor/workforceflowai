"use client"

import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Calendar, Edit, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCustomer, type Customer } from '@/lib/api/customers';

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data as { detail?: string };
    return data.detail || 'Failed to load customer.';
  }

  return error instanceof Error ? error.message : 'Failed to load customer.';
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomer() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCustomer(id);

        if (isMounted) {
          setCustomer(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading customer...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard/customers"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Customer not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 mb-8">
        <Link
          href="/dashboard/customers"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {customer.customer_name}
          </h1>
          <p className="text-slate-500 text-sm">Customer profile details</p>
        </div>
        <Link
          href={`/dashboard/customers/${id}/edit`}
          className="md:ml-auto inline-flex w-fit items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2 text-sm font-medium text-white hover:bg-[#06b6d4] transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Contact Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Email</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {customer.customer_email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Phone</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {customer.phone_number}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Billing Address</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {customer.billing_address || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Site Address</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {customer.site_address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Account Details
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Customer Type</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {customer.customer_type}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Date Created</p>
                <p className="text-[14px] font-medium text-slate-900">
                  {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[13px] text-slate-500 mb-1">Notes</p>
              <p className="text-[14px] font-medium text-slate-900">
                {customer.notes || 'No notes added.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
