"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Collaborator,
  deleteCollaborator,
  getCollaborator,
} from "@/lib/api/collaborators";

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { detail?: string };
    return data.detail || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function getInitial(name?: string) {
  return name?.trim()?.[0]?.toUpperCase() || "T";
}

function TaxStatus({
  label,
  registered,
}: {
  label: string;
  registered: boolean;
}) {
  return (
    <div className="bg-[#f8fafc] rounded-lg p-4 border border-slate-100">
      <p className="text-[12px] text-slate-500 mb-2">{label}</p>
      <div className={`flex items-center gap-2 ${registered ? "text-[#16a34a]" : "text-slate-600"}`}>
        {registered ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <span className="text-[14px] font-medium">
          {registered ? "Registered" : "Not Registered"}
        </span>
      </div>
    </div>
  );
}

export default function TeamMemberDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCollaborator = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getCollaborator(id);

        if (isMounted) {
          setCollaborator(data);
        }
      } catch (error) {
        console.error("Error loading collaborator:", error);
        if (isMounted) {
          setErrorMessage(getErrorMessage(error, "Failed to load collaborator."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCollaborator();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!collaborator || !window.confirm(`Delete collaborator "${collaborator.full_name || collaborator.email}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteCollaborator(id);
      router.push("/dashboard/account-settings/team");
      router.refresh();
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      alert(getErrorMessage(error, "Failed to delete collaborator."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading collaborator...
      </div>
    );
  }

  if (errorMessage || !collaborator) {
    return (
      <div className="max-w-5xl mx-auto pb-24">
        <Link
          href="/dashboard/account-settings/team"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage || "Collaborator not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <Link
        href="/dashboard/account-settings/team"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Team
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#22d3ee] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            {getInitial(collaborator.full_name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {collaborator.full_name || `Collaborator ${collaborator.id}`}
            </h1>
            <p className="text-slate-500 text-sm mb-2">
              {collaborator.position || "No position added"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold">
                {collaborator.work_type || "Work type not set"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                <BadgeCheck className="w-3 h-3" />
                {collaborator.role || "User"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/account-settings/team/${id}/edit`}
            className="flex items-center justify-center gap-2 bg-[#22d3ee] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#06b6d4] transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Details
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500 mb-0.5">Email</p>
                  <p className="text-[14px] text-slate-900">{collaborator.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500 mb-0.5">Mobile</p>
                  <p className="text-[14px] text-slate-900">{collaborator.phone_number || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-slate-500 mb-0.5">Address</p>
                  <p className="text-[14px] text-slate-900">{collaborator.full_address || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Tax & Registration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaxStatus label="VAT Status" registered={collaborator.vat_registered} />
              <TaxStatus label="CIS Status" registered={collaborator.cis_registered} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-3">Notes</h2>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              {collaborator.additional_notes || "No additional notes added."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Collaborator Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Record ID</p>
                <p className="text-[15px] font-bold text-slate-900">{collaborator.id}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Owner ID</p>
                <p className="text-[15px] font-bold text-slate-900">{collaborator.owner}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Collaborator User ID</p>
                <p className="text-[15px] font-bold text-slate-900">{collaborator.collaborator}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Access Role</p>
                <p className="text-[15px] font-bold text-slate-900">{collaborator.role || "User"}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 mb-0.5">Work Type</p>
                <p className="text-[15px] font-bold text-slate-900">{collaborator.work_type || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
