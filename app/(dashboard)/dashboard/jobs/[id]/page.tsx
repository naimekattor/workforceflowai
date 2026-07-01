"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Calendar, Edit, FileText, MapPin, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/api/customers";
import { deleteJob, getJob, Job } from "@/lib/api/jobs";
import { confirmAction, showError } from "@/lib/ui/alerts";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { detail?: string };
    return data.detail || "Failed to load job.";
  }

  return error instanceof Error ? error.message : "Failed to load job.";
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}



async function getJobWithCustomerName(id: string) {
  const job = await getJob(id);

  if (job.customer_name || !job.customer) {
    return job;
  }

  try {
    const customer = await getCustomer(job.customer);
    return {
      ...job,
      customer_name: customer.customer_name,
    };
  } catch (error) {
    console.error("Error fetching job customer:", error);
    return job;
  }
}

function getStatusClassName(status: string) {
  return status === "Open"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-700";
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getJobWithCustomerName(id);

        if (isMounted) {
          setJob(data);
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

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!job) return;

    const confirmed = await confirmAction({
      title: "Delete job?",
      text: `Delete job "${job.title}"?`,
      confirmButtonText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteJob(id);
      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err) {
      await showError(getErrorMessage(err).replace("load", "delete"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading job...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/jobs" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Job not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 mb-8">
        <Link href="/dashboard/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{job.title}</h1>
          <p className="text-slate-500 text-sm">Job details</p>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Link
            href={`/dashboard/jobs/${id}/edit`}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#42a5f5] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Job Information</h2>
          <div className="space-y-5">
            
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Site Address</p>
                <p className="text-[14px] font-medium text-slate-900">{job.site_address || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Date Created</p>
                <p className="text-[14px] font-medium text-slate-900">{formatDate(job.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="w-4 h-4 mt-0.5 text-slate-400" />
              <div>
                <p className="text-[13px] text-slate-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getStatusClassName(job.jobstatus)}`}>
                  {job.jobstatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Job Description</h2>
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 mt-0.5 text-slate-400" />
            <div>
              <p className="text-[13px] text-slate-500 mb-1">Description</p>
              <p className="text-[14px] font-medium text-slate-900">{job.notes || "No description provided."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
