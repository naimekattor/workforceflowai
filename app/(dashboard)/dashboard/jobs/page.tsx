"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCustomer } from "@/lib/api/customers";
import { deleteJob, getJobs, Job } from "@/lib/api/jobs";

type CustomerNameById = Record<number, string>;

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function getCustomerLabel(job: Job, customerNameById: CustomerNameById) {
  return job.customer_name || customerNameById[job.customer] || `Customer ID: ${job.customer}`;
}

function getStatusClassName(status: string) {
  return status === "Open"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-700";
}

export default function Jobs() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customerNameById, setCustomerNameById] = useState<CustomerNameById>({});
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getJobs();
        const customerIds = Array.from(
          new Set(
            data.results
              .filter((job) => !job.customer_name)
              .map((job) => job.customer)
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
            if (result.status === "fulfilled") {
              const [customerId, customerName] = result.value;
              names[customerId] = customerName;
            }

            return names;
          },
          {}
        );

        if (isMounted) {
          setJobs(data.results);
          setTotalCount(data.count);
          setCustomerNameById(loadedCustomerNames);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        if (isMounted) {
          setErrorMessage("Failed to load jobs");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, status]);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return jobs;
    }

    return jobs.filter((job) => {
      const values = [
        job.title,
        job.site_address,
        job.jobstatus,
        getCustomerLabel(job, customerNameById),
      ];

      return values.some((value) =>
        String(value).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [customerNameById, jobs, searchTerm]);

  const handleDelete = async (job: Job) => {
    if (!window.confirm(`Delete job "${job.title}"?`)) {
      return;
    }

    try {
      await deleteJob(job.id);
      setJobs((currentJobs) => currentJobs.filter((item) => item.id !== job.id));
      setTotalCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Jobs</h1>
          <p className="text-slate-500 text-sm">Manage your job records</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 bg-[#42a5f5] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Job
          </Link>
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
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
          <table className="w-full min-w-[760px] whitespace-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Job Title</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Site Address</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Date Created</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/jobs/${job.id}`} className="text-[13px] font-medium text-[#42a5f5] hover:text-blue-500">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{getCustomerLabel(job, customerNameById)}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{job.site_address || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getStatusClassName(job.jobstatus)}`}>
                        {job.jobstatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{formatDate(job.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`View job ${job.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label={`Edit job ${job.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete job ${job.title}`}
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

        {!loading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-[13px] text-slate-500">
              Showing {filteredJobs.length} of {totalCount} jobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
