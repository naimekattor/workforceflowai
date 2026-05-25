"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Customer, getCustomers } from "@/lib/api/customers";
import { getJob, Job, JobStatus, updateJob } from "@/lib/api/jobs";
import { showError } from "@/lib/ui/alerts";

type JobFormInput = {
  jobstatus: JobStatus;
  title: string;
  site_address: string;
  notes: string;
  customer: string;
};

function getErrorMessage(error: unknown): string {
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
      const detail = "detail" in data ? data.detail : null;
      if (typeof detail === "string") {
        return detail;
      }

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

  return error instanceof Error ? error.message : "Failed to update job.";
}

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormInput>({
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
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadJob() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [jobData, customersData] = await Promise.all([
          getJob(id),
          getCustomers(),
        ]);

        if (!isMounted) {
          return;
        }

        setJob(jobData);
        setCustomers(customersData.results);
        reset({
          jobstatus: jobData.jobstatus || "Open",
          title: jobData.title || "",
          site_address: jobData.site_address || "",
          notes: jobData.notes || "",
          customer: String(jobData.customer),
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

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id, reset, session?.accessToken, status]);

  const currentStatus = watch("jobstatus");
  const hasCurrentStatusOption = currentStatus === "Open";
  const hasSelectedCustomer = useMemo(() => {
    if (!job) {
      return true;
    }

    return customers.some((customer) => customer.id === job.customer);
  }, [customers, job]);

  const onSubmit: SubmitHandler<JobFormInput> = async (data) => {
    try {
      await updateJob(id, {
        jobstatus: data.jobstatus,
        title: data.title,
        site_address: data.site_address,
        notes: data.notes || "",
        customer: Number(data.customer),
      });

      router.push(`/dashboard/jobs/${id}`);
      router.refresh();
    } catch (error) {
      await showError(getErrorMessage(error));
    }
  };

  const inputClassName =
    "w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400";
  const selectClassName =
    "w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 appearance-none disabled:text-slate-400";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <Link href={`/dashboard/jobs/${id}`} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Edit Job</h1>
          <p className="text-slate-500 text-sm">Update job details</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-500">
            Loading job...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                  Customer *
                </label>
                <div className="relative">
                  <select
                    id="customer"
                    {...register("customer", { required: "Customer is required" })}
                    className={selectClassName}
                    disabled={!job}
                  >
                    {!hasSelectedCustomer && job && (
                      <option value={job.customer}>
                        {job.customer_name || `Customer ID: ${job.customer}`}
                      </option>
                    )}
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customer_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.customer && <p className="mt-1.5 text-xs text-red-500">{errors.customer.message}</p>}
              </div>

              <div>
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
                    {!hasCurrentStatusOption && currentStatus && (
                      <option value={currentStatus}>{currentStatus}</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.jobstatus && <p className="mt-1.5 text-xs text-red-500">{errors.jobstatus.message}</p>}
              </div>
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
              {errors.site_address && <p className="mt-1.5 text-xs text-red-500">{errors.site_address.message}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-[13px] font-bold text-slate-800 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Additional information about this job..."
                {...register("notes")}
                className={`${inputClassName} resize-none py-3`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href={`/dashboard/jobs/${id}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !job}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#42a5f5] hover:bg-blue-500 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
