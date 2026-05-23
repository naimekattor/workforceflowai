"use client";

import { useState } from "react";
import { ArrowLeft, Check, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CollaboratorRole,
  CollaboratorWorkType,
  inviteCollaborator,
} from "@/lib/api/collaborators";

type TeamMemberInput = {
  work_type: CollaboratorWorkType;
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
  description: string;
}> = [
  {
    value: "ST",
    title: "Sole Trader",
    description: "Self-employed team member or subcontractor",
  },
  {
    value: "EMP",
    title: "Employee",
    description: "Direct employee or internal staff member",
  },
  {
    value: "LC",
    title: "Limited Company",
    description: "Registered company or contractor business",
  },
  {
    value: "PT",
    title: "Partnership",
    description: "Partnership or multi-person trade team",
  },
];

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

  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function AddTeamMember() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedWorkType, setSelectedWorkType] =
    useState<CollaboratorWorkType>("ST");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberInput>({
    defaultValues: {
      work_type: "ST",
      role: "Admin",
      phone_number: "",
      full_address: "",
      position: "",
      vat_registered: false,
      cis_registered: false,
      additional_notes: "",
    },
  });

  const onSubmit: SubmitHandler<TeamMemberInput> = async (data) => {
    if (!session?.accessToken) {
      setSubmitError("You must be logged in to add a team member.");
      return;
    }

    try {
      setSubmitError("");
      await inviteCollaborator({
        work_type: data.work_type,
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        role: data.role,
        phone_number: data.phone_number.trim(),
        full_address: data.full_address.trim(),
        position: data.position.trim(),
        vat_registered: data.vat_registered,
        cis_registered: data.cis_registered,
        additional_notes: data.additional_notes.trim(),
      });

      router.push("/dashboard/account-settings/team");
      router.refresh();
    } catch (error) {
      console.error("Error adding team member:", error);
      setSubmitError(formatApiError(error));
    }
  };

  const inputClassName =
    "w-full rounded-lg border-0 bg-[#f4f6f8] px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400";

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="mb-8">
        <Link
          href="/dashboard/account-settings/team"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900">
              Add Team Member
            </h1>
            <p className="text-sm text-slate-500">
              Create a team profile with access and registration details
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-[15px] font-bold text-slate-900">
                Basic Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="full_name"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
                    Full Name *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="Md Arafat"
                    {...register("full_name", {
                      required: "Full name is required",
                    })}
                    className={inputClassName}
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={inputClassName}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
                    Phone Number
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
                  <label
                    htmlFor="position"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    placeholder="Admin, Electrician, Project Manager"
                    {...register("position")}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
                    Role *
                  </label>
                  <select
                    id="role"
                    {...register("role", { required: "Role is required" })}
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="full_address"
                    className="mb-1.5 block text-[12px] font-bold text-slate-800"
                  >
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
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-[15px] font-bold text-slate-900">
                Notes
              </h2>
              <label
                htmlFor="additional_notes"
                className="mb-1.5 block text-[12px] font-bold text-slate-800"
              >
                Additional Notes
              </label>
              <textarea
                id="additional_notes"
                rows={5}
                placeholder="Add relevant team notes..."
                {...register("additional_notes")}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-[15px] font-bold text-slate-900">
                Work Type
              </h2>
              <input type="hidden" {...register("work_type")} />
              <div className="space-y-3">
                {WORK_TYPE_OPTIONS.map((type) => {
                  const selected = selectedWorkType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedWorkType(type.value);
                        setValue("work_type", type.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors ${
                        selected
                          ? "border-[#22d3ee] bg-[#f0fdfa]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span>
                        <span className="mb-0.5 block text-[13px] font-bold text-slate-900">
                          {type.title}
                        </span>
                        <span className="block text-[12px] text-slate-500">
                          {type.description}
                        </span>
                      </span>
                      {selected && (
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22d3ee] text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-[15px] font-bold text-slate-900">
                Tax Registration
              </h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                  <input
                    type="checkbox"
                    {...register("vat_registered")}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#22d3ee] focus:ring-[#22d3ee]"
                  />
                  <span>
                    <span className="mb-0.5 block text-[13px] font-bold text-slate-900">
                      VAT Registered
                    </span>
                    <span className="block text-[12px] text-slate-500">
                      Registered for VAT
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                  <input
                    type="checkbox"
                    {...register("cis_registered")}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#22d3ee] focus:ring-[#22d3ee]"
                  />
                  <span>
                    <span className="mb-0.5 block text-[13px] font-bold text-slate-900">
                      CIS Registered
                    </span>
                    <span className="block text-[12px] text-slate-500">
                      Registered for CIS
                    </span>
                  </span>
                </label>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard/account-settings/team")}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22d3ee] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add Team Member"}
          </button>
        </div>
      </form>
    </div>
  );
}
