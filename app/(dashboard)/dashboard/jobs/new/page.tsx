"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Customer, getCustomers } from "@/lib/api/customers";
import { createJob, JobStatus } from "@/lib/api/jobs";
import { showError, showInfo, showSuccess } from "@/lib/ui/alerts";

type JobInput = {
  jobstatus: JobStatus;
  title: string;
  site_address: string;
  notes: string;
  customer: string;
};

function formatApiError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data;

    if (typeof data === "object" && data !== null) {
      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`);
        }

        return typeof value === "string" ? [`${field}: ${value}`] : [];
      });

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (typeof data === "string") {
      return data;
    }
  }

  return error instanceof Error ? error.message : "Something went wrong!";
}

export default function AddJob() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    defaultValues: {
      jobstatus: "Open",
      notes: "",
    },
  });

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.accessToken) {
      setLoadingCustomers(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        setCustomerError("");
        const data = await getCustomers();
        setCustomers(data.results);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomerError(formatApiError(error));
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [session?.accessToken, status]);

  const onSubmit: SubmitHandler<JobInput> = async (data) => {
    if (!session?.accessToken) {
      await showInfo("You must be logged in to create a job.");
      return;
    }

    try {
      await createJob({
        jobstatus: data.jobstatus,
        title: data.title,
        site_address: data.site_address,
        notes: data.notes || "",
        customer: Number(data.customer),
      });

      reset();
      await showSuccess("Job created successfully!");
      router.push("/dashboard/jobs");
      router.refresh();
    } catch (error) {
      console.error("Error creating job:", error);
      await showError(formatApiError(error));
    }
  };

  const selectClassName =
    "w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none disabled:text-slate-400";
  const inputClassName =
    "w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400";
  const canSubmit =
    !isSubmitting &&
    status !== "loading" &&
    !loadingCustomers &&
    customers.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">New Job</h1>
          <p className="text-slate-500 text-sm">Create a new job record</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              placeholder="Kitchen Renovation"
              {...register("title", { required: "Job title is required" })}
              className={inputClassName}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="">
            <div>
              <label htmlFor="customer" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Customer *
              </label>
              <div className="relative">
                <select
                  id="customer"
                  {...register("customer", { required: "Customer is required" })}
                  disabled={loadingCustomers || customers.length === 0}
                  className={selectClassName}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {loadingCustomers
                      ? "Loading customers..."
                      : customers.length === 0
                        ? "No customers available"
                        : "Select a customer"}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
              {customerError && <p className="mt-1 text-xs text-red-500">{customerError}</p>}
            </div>

            {/* <div>
              <label htmlFor="jobstatus" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Status *
              </label>
              <div className="relative">
                <select
                  id="jobstatus"
                  {...register("jobstatus", { required: "Status is required" })}
                  className={selectClassName}
                >
                  <option value="Open">Open</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {errors.jobstatus && <p className="mt-1 text-xs text-red-500">{errors.jobstatus.message}</p>}
            </div> */}
          </div>

          <div>
            <label htmlFor="site_address" className="block text-[13px] font-bold text-slate-800 mb-1.5">
              Site Address *
            </label>
            <input
              type="text"
              id="site_address"
              placeholder="123 Work Street, London, UK"
              {...register("site_address", { required: "Site address is required" })}
              className={inputClassName}
            />
            {errors.site_address && <p className="mt-1 text-xs text-red-500">{errors.site_address.message}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
             Job Description
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Information about this job..."
              {...register("notes")}
              className={`${inputClassName} resize-none py-3`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/jobs"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#42a5f5] hover:bg-blue-500 transition-colors disabled:bg-slate-300"
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
