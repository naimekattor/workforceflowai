"use client";

import React from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { createCustomer } from "@/lib/api/customers";
import { useSession } from "next-auth/react";

type Input = {
  customer_name: string;
  customer_email: string;
  phone_number: string;
  customer_type: "Domestic" | "Commercial";
  billing_address: string;
  site_address: string;
  notes?: string;
};

export default function AddCustomer() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input>();

  const onSubmit: SubmitHandler<Input> = async (data) => {
    if (!session?.accessToken) {
      alert("You must be logged in to create a customer.");
      return;
    }

    try {
      await createCustomer(data);
      reset();
      alert("Customer created successfully!");
      router.push("/dashboard/customers");
    } catch (error: any) {
      console.error("Error creating customer:", error);
      alert(error.response?.data?.detail || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/customers"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">
            New Customer
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new customer to your database
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* NAME */}
              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Customer Name *</label>
                <input
                  {...register("customer_name", { required: "Name is required" })}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  placeholder="John Doe"
                />
                {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name.message}</p>}
              </div>

              {/* TYPE */}
              <div className="relative">
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Customer Type *</label>
                <div className="relative">
                  <select
                    {...register("customer_type", { required: true })}
                    className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none pr-10"
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Email *</label>
                <input
                  type="email"
                  {...register("customer_email", { required: "Email is required" })}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  placeholder="john@example.com"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Phone *</label>
                <input
                  type="tel"
                  {...register("phone_number", { required: "Phone is required" })}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>

            {/* FULL WIDTH INPUTS */}
            <div className="space-y-6">
              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Billing Address *</label>
                <input
                  {...register("billing_address", { required: true })}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  placeholder="123 Main Street, London, UK"
                />
              </div>

              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Site Address *</label>
                <input
                  {...register("site_address", { required: true })}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                  placeholder="456 Work Street, London, UK"
                />
              </div>

              <div>
                <label className="label block text-[12px] font-bold text-slate-800 mb-1.5">Notes (Optional)</label>
                <textarea
                  rows={5}
                  {...register("notes")}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 py-4"
                  placeholder="Additional information about this customer..."
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-6">
              <Link href="/dashboard/customers" className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#22d3ee] hover:bg-[#06b6d4] text-white text-sm font-bold transition-colors disabled:bg-slate-300 shadow-sm"
              >
                {isSubmitting ? "Creating..." : "Create Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}