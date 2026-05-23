"use client"
import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '../../../../../../lib/invoices';

export default function EditQuote() {
  const { id } = useParams();

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

      <form>
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
                defaultValue="1"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="" disabled>Select a customer</option>
                <option value="1">Sarah Johnson</option>
                <option value="2">TechCorp Solutions Ltd</option>
              </select>
            </div>

            {/* Job */}
            <div>
              <label htmlFor="job" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Job (Optional)
              </label>
              <select
                id="job"
                defaultValue="1"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="">No job</option>
                <option value="1">Kitchen Renovation</option>
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
                defaultValue="2026-04-10"
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
                defaultValue="2026-05-10"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Deposit % */}
            <div>
              <label htmlFor="deposit" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Deposit % (Optional)
              </label>
              <input
                type="number"
                id="deposit"
                defaultValue="20"
                placeholder="0"
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>

            {/* Payment Note */}
            <div>
              <label htmlFor="paymentNote" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Payment Note (Optional)
              </label>
              <input
                type="text"
                id="paymentNote"
                defaultValue="Due on completion"
                placeholder="Payment terms..."
                className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Notes / Assumptions */}
          <div>
            <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Notes / Assumptions (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              defaultValue="Includes all materials and labor."
              placeholder="Additional notes or assumptions..."
              className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
            <button type="button" className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Item Row */}
          <div className="border border-slate-100 rounded-xl p-6 mb-6">
            <p className="text-[13px] font-bold text-slate-500 mb-4">Item 1</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-6">
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Description *</label>
                <input
                  type="text"
                  defaultValue="Custom Cabinets"
                  placeholder="Item description"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Quantity *</label>
                <input
                  type="number"
                  defaultValue="1"
                  placeholder="1"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Unit *</label>
                <input
                  type="text"
                  defaultValue="set"
                  placeholder="item"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Unit Price (£) *</label>
                <input
                  type="number"
                  defaultValue="1200"
                  placeholder="0"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-4 h-4 text-[#22d3ee] bg-[#f4f6f8] border-slate-300 rounded focus:ring-[#22d3ee]" 
                />
                <span className="text-[13px] font-bold text-slate-700">Taxable (20% VAT)</span>
              </label>
              <div className="text-right">
                <span className="text-[15px] font-bold text-slate-900">{formatCurrency(1200.00)}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(1200.00)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">VAT (20%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(240.00)}</span>
              </div>
              <div className="pt-3 mt-1 flex justify-between items-center">
                <span className="text-[15px] font-bold text-slate-900">Total:</span>
                <span className="text-lg font-bold text-[#22d3ee]">{formatCurrency(1440.00)}</span>
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
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
