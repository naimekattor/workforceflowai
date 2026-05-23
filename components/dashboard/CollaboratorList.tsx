"use client";

import React, { useEffect, useState } from "react";
import { BadgeCheck, Eye, ReceiptText, Search, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Collaborator,
  CollaboratorStats,
  deleteCollaborator,
  getCollaboratorStats,
  getCollaborators,
} from "@/lib/api/collaborators";

const PAGE_SIZE = 10;

function getStatusLabel(collaborator: Collaborator) {
  if (collaborator.vat_registered && collaborator.cis_registered) {
    return "VAT + CIS";
  }

  if (collaborator.vat_registered) {
    return "VAT";
  }

  if (collaborator.cis_registered) {
    return "CIS";
  }

  return "No tax flags";
}

function getRoleClassName(role: string) {
  return role === "Admin"
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-700";
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#0284c7]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

type CollaboratorListProps = {
  showAddButton?: boolean;
};

export default function CollaboratorList({
  showAddButton = true,
}: CollaboratorListProps) {
  const { data: session, status } = useSession();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [stats, setStats] = useState<CollaboratorStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.accessToken) {
      setStatsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getCollaboratorStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching collaborator stats:", error);
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCollaborators = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getCollaborators({
          page,
          page_size: PAGE_SIZE,
          search: search.trim() || undefined,
        });

        if (!isMounted) {
          return;
        }

        setCollaborators(data.results);
        setTotalCount(data.count);
        setHasNext(Boolean(data.next));
        setHasPrevious(Boolean(data.previous));
      } catch (error) {
        console.error("Error fetching collaborators:", error);
        if (isMounted) {
          setErrorMessage("Failed to load collaborators");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCollaborators();

    return () => {
      isMounted = false;
    };
  }, [page, search, session?.accessToken, status]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleDelete = async (collaborator: Collaborator) => {
    if (!window.confirm(`Delete collaborator "${collaborator.full_name || collaborator.email}"?`)) {
      return;
    }

    try {
      await deleteCollaborator(collaborator.id);
      setCollaborators((currentCollaborators) =>
        currentCollaborators.filter((item) => item.id !== collaborator.id)
      );
      setTotalCount((count) => Math.max(0, count - 1));
      setStats((currentStats) => {
        if (!currentStats) {
          return currentStats;
        }

        return {
          total_collaborators: Math.max(0, currentStats.total_collaborators - 1),
          tax_registered: Math.max(
            0,
            currentStats.tax_registered - (collaborator.vat_registered ? 1 : 0)
          ),
          cis_registered: Math.max(
            0,
            currentStats.cis_registered - (collaborator.cis_registered ? 1 : 0)
          ),
        };
      });
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      alert("Failed to delete collaborator");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Collaborators"
          value={statsLoading ? "..." : stats?.total_collaborators ?? totalCount}
        />
        <StatCard
          icon={ReceiptText}
          label="Tax Registered"
          value={statsLoading ? "..." : stats?.tax_registered ?? "-"}
        />
        <StatCard
          icon={BadgeCheck}
          label="CIS Registered"
          value={statsLoading ? "..." : stats?.cis_registered ?? "-"}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search collaborators..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#f4f6f8] border-0 rounded-lg text-sm focus:ring-2 focus:ring-inset focus:ring-cyan-400"
          />
        </div>
        {showAddButton && (
          <Link
            href="/dashboard/account-settings/team/new"
            className="inline-flex w-fit items-center gap-2 bg-[#22d3ee] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#06b6d4] transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 max-w-full">
        {errorMessage && (
          <div className="px-6 py-3 border-b border-red-100 bg-red-50 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="w-full max-w-[calc(100vw-2rem)] lg:max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] whitespace-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Name</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Email</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Work Type</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Role</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Position</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900">Tax</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading collaborators...
                  </td>
                </tr>
              ) : collaborators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No collaborators found
                  </td>
                </tr>
              ) : (
                collaborators.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/account-settings/team/${collaborator.id}`}
                        className="text-[13px] font-medium text-[#22d3ee] hover:text-[#06b6d4]"
                      >
                        {collaborator.full_name || `Collaborator ${collaborator.id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{collaborator.email}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{collaborator.work_type || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getRoleClassName(collaborator.role)}`}>
                        {collaborator.role || "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{collaborator.position || "-"}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700">{getStatusLabel(collaborator)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/account-settings/team/${collaborator.id}`}
                          className="inline-flex p-1.5 text-slate-500 hover:text-slate-700 transition-colors"
                          aria-label={`View collaborator ${collaborator.full_name || collaborator.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(collaborator)}
                          className="inline-flex p-1.5 text-red-500 hover:text-red-600 transition-colors"
                          aria-label={`Delete collaborator ${collaborator.full_name || collaborator.id}`}
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
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[13px] text-slate-500">
              Showing {collaborators.length} of {totalCount} collaborators
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-500">Page {page}</span>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
