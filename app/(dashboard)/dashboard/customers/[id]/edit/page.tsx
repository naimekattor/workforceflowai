"use client"
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getCustomer, updateCustomer } from '@/lib/api/customers';

type CustomerFormInput = {
  customer_name: string;
  customer_email: string;
  phone_number: string;
  customer_type: 'Domestic' | 'Commercial' | 'International';
  billing_address: string;
  site_address: string;
  notes?: string;
};

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
    return data.detail || 'Failed to update customer.';
  }

  return error instanceof Error ? error.message : 'Failed to update customer.';
}

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput>();

  useEffect(() => {
    let isMounted = true;

    async function loadCustomer() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const customer = await getCustomer(id);

        if (!isMounted) return;

        reset({
          customer_name: customer.customer_name,
          customer_email: customer.customer_email,
          phone_number: customer.phone_number,
          customer_type: customer.customer_type as CustomerFormInput['customer_type'],
          billing_address: customer.billing_address || '',
          site_address: customer.site_address || '',
          notes: customer.notes || '',
        });
      } catch (error) {
        if (isMounted) {
          setLoadError(getErrorMessage(error));
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
  }, [id, reset]);

  const onSubmit: SubmitHandler<CustomerFormInput> = async (data) => {
    try {
      await updateCustomer(id, data);
      router.push(`/dashboard/customers/${id}`);
      router.refresh();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard/customers" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Edit Customer</h1>
          <p className="text-slate-500 text-sm">Update customer details</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-500">
            Loading customer...
          </div>
        ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('customer_name', { required: 'Customer name is required' })}
                placeholder="John Doe"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
              {errors.customer_name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Customer Type */}
            <div>
              <label htmlFor="type" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Customer Type *
              </label>
              <select
                id="type"
                {...register('customer_type', { required: 'Customer type is required' })}
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="Domestic">Domestic</option>
                <option value="Commercial">Commercial</option>
                <option value="International">International</option>
              </select>
              {errors.customer_type && (
                <p className="mt-1.5 text-xs text-red-500">{errors.customer_type.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('customer_email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                placeholder="john@example.com"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
              {errors.customer_email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.customer_email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone_number', { required: 'Phone is required' })}
                placeholder="+44 20 1234 5678"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
              {errors.phone_number && (
                <p className="mt-1.5 text-xs text-red-500">{errors.phone_number.message}</p>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <label htmlFor="billingAddress" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Billing Address *
            </label>
            <input
              type="text"
              id="billingAddress"
              {...register('billing_address', { required: 'Billing address is required' })}
              placeholder="123 Main Street, London, UK"
              className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
            />
            {errors.billing_address && (
              <p className="mt-1.5 text-xs text-red-500">{errors.billing_address.message}</p>
            )}
          </div>

          {/* Site Address */}
          <div>
            <label htmlFor="siteAddress" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Site Address *
            </label>
            <input
              type="text"
              id="siteAddress"
              {...register('site_address', { required: 'Site address is required' })}
              placeholder="456 Work Street, London, UK"
              className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
            />
            {errors.site_address && (
              <p className="mt-1.5 text-xs text-red-500">{errors.site_address.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              {...register('notes')}
              placeholder="Additional information about this customer..."
              className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link 
              href="/dashboard/customers"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#42a5f5] hover:bg-blue-500 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
