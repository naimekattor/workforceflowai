"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Collaborator,
  CollaboratorRole,
  CollaboratorWorkType,
  getCollaborator,
  updateCollaborator,
} from "@/lib/api/collaborators";
import { showError } from "@/lib/ui/alerts";

type CollaboratorFormInput = {
  work_type: string;
  full_name: string;
  email: string;
  role: CollaboratorRole;
  phone_number: string;
  full_address: string;
  position: string;
  vat_registered: boolean;
  cis_registered: boolean;
  additional_notes: string;
};

const WORK_TYPE_OPTIONS: Array<{
  value: CollaboratorWorkType;
  title: string;
  desc: string;
}> = [
  { value: "Employee", title: "Employee", desc: "Full-time or part-time employee" },
  { value: "Sole_Trader", title: "Sole Trader", desc: "Self-employed individual" },
  { value: "Limited_Company", title: "Limited Company", desc: "Registered limited company" },
  { value: "Partnership", title: "Partnership", desc: "Business partnership" },
];

function getErrorMessage(error: unknown, fallback: string) {
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
  }

  return error instanceof Error ? error.message : fallback;
}

export default function EditTeamMember() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<string>("Employee");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CollaboratorFormInput>({
    defaultValues: {
      work_type: "Employee",
      role: "User",
      vat_registered: false,
      cis_registered: false,
      additional_notes: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadCollaborator = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await getCollaborator(id);

        if (!isMounted) {
          return;
        }

        setCollaborator(data);
        setSelectedWorkType(data.work_type || "Employee");
        reset({
          work_type: data.work_type || "Employee",
          full_name: data.full_name || "",
          email: data.email || "",
          role: data.role === "Admin" ? "Admin" : "User",
          phone_number: data.phone_number || "",
          full_address: data.full_address || "",
          position: data.position || "",
          vat_registered: data.vat_registered,
          cis_registered: data.cis_registered,
          additional_notes: data.additional_notes || "",
        });
      } catch (error) {
        console.error("Error loading collaborator:", error);
        if (isMounted) {
          setLoadError(getErrorMessage(error, "Failed to load collaborator."));
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
  }, [id, reset]);

  const onSubmit: SubmitHandler<CollaboratorFormInput> = async (data) => {
    if (!collaborator) {
      return;
    }

    try {
      await updateCollaborator(id, {
        owner: collaborator.owner,
        collaborator: collaborator.collaborator,
        work_type: data.work_type as CollaboratorWorkType,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        phone_number: data.phone_number || "",
        full_address: data.full_address || "",
        position: data.position || "",
        vat_registered: data.vat_registered,
        cis_registered: data.cis_registered,
        additional_notes: data.additional_notes || "",
      });

      router.push(`/dashboard/account-settings/team/${id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating collaborator:", error);
      await showError(getErrorMessage(error, "Failed to update collaborator."));
    }
  };

  const inputClassName =
    "w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 disabled:text-slate-500";
  const hasKnownWorkType = WORK_TYPE_OPTIONS.some((type) => type.value === selectedWorkType);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <Link
          href={`/dashboard/account-settings/team/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team Member
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Team Member</h1>
        <p className="text-slate-500 text-sm">Update team member information</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-500">
            Loading collaborator...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-5">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="John Smith"
                    {...register("full_name", { required: "Full name is required" })}
                    className={inputClassName}
                  />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={inputClassName}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">
                      Owner ID
                    </label>
                    <input value={collaborator?.owner ?? ""} disabled className={inputClassName} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-800 mb-1.5">
                      Collaborator User ID
                    </label>
                    <input value={collaborator?.collaborator ?? ""} disabled className={inputClassName} />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Access Role
                  </label>
                  <select
                    id="role"
                    {...register("role")}
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    placeholder="+44 7700 900000"
                    {...register("phone_number")}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="full_address" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Full Address
                  </label>
                  <input
                    id="full_address"
                    type="text"
                    placeholder="123 High Street, London, SW1A 1AA"
                    {...register("full_address")}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    placeholder="e.g., Project Manager, Electrician, Plumber"
                    {...register("position")}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-[15px] font-bold text-slate-900 mb-5">Worker Type</h2>
              <input type="hidden" {...register("work_type")} />
              <div className="space-y-3">
                {!hasKnownWorkType && selectedWorkType && (
                  <button
                    type="button"
                    className="w-full flex flex-col items-start p-4 rounded-lg border border-[#22d3ee] bg-[#f0fdfa] text-left transition-colors"
                  >
                    <span className="text-[13px] font-bold text-slate-900 mb-0.5">{selectedWorkType}</span>
                    <span className="text-[12px] text-slate-500">Current backend value</span>
                  </button>
                )}
                {WORK_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedWorkType(type.value);
                      setValue("work_type", type.value, { shouldDirty: true });
                    }}
                    className={`w-full flex flex-col items-start p-4 rounded-lg border text-left transition-colors ${
                      selectedWorkType === type.value
                        ? "border-[#22d3ee] bg-[#f0fdfa]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[13px] font-bold text-slate-900 mb-0.5">{type.title}</span>
                    <span className="text-[12px] text-slate-500">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-[15px] font-bold text-slate-900 mb-5">Tax & Registration</h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register("vat_registered")}
                      className="w-4 h-4 rounded border-slate-300 text-[#22d3ee] focus:ring-[#22d3ee]"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 mb-0.5">VAT Registered</p>
                    <p className="text-[12px] text-slate-500">This person/company is registered for VAT</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register("cis_registered")}
                      className="w-4 h-4 rounded border-slate-300 text-[#22d3ee] focus:ring-[#22d3ee]"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 mb-0.5">CIS Registered</p>
                    <p className="text-[12px] text-slate-500">Registered under the Construction Industry Scheme</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-[15px] font-bold text-slate-900 mb-5">Additional Notes</h2>
              <label htmlFor="additional_notes" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                id="additional_notes"
                rows={4}
                placeholder="Any additional information about this team member..."
                {...register("additional_notes")}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href={`/dashboard/account-settings/team/${id}`}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !collaborator}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:bg-slate-300"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
