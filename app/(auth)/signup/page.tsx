// app/signup/page.tsx  (or wherever your SignUp lives)
"use client";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ApiRequestError, registerUser } from "@/lib/api/auth";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// The backend advertises only a minimum length requirement for registration.
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function firstApiMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
}

function getStringFormValue(formData: globalThis.FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  // Client-side validation before hitting the API
  function validate(data: FormData): boolean {
    const newErrors: FormErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) newErrors.password = passwordError;

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedData = new FormData(e.currentTarget);
    const nextFormData = {
      name: getStringFormValue(submittedData, "name"),
      email: getStringFormValue(submittedData, "email"),
      password: getStringFormValue(submittedData, "password"),
      confirmPassword: getStringFormValue(submittedData, "confirmPassword"),
    };

    setFormData(nextFormData);
    if (!validate(nextFormData)) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Register on Django backend
      await registerUser({
        full_name: nextFormData.name,
        email: nextFormData.email,
        password: nextFormData.password,
      });

      // 2. Auto sign-in via NextAuth after successful registration
      const result = await signIn("credentials", {
        email: nextFormData.email,
        password: nextFormData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Account created but sign-in failed. Please sign in manually." });
        router.push("/login");
        return;
      }

      // 3. Go to onboarding
      router.push("/onboarding");
      router.refresh();

    } catch (err: unknown) {
      if (err instanceof ApiRequestError && err.data) {
        const data = err.data;
        setErrors({
          email: firstApiMessage(data.email),
          password: firstApiMessage(data.password),
          name: firstApiMessage(data.full_name),
          general:
            firstApiMessage(data.detail) ||
            firstApiMessage(data.non_field_errors) ||
            err.message,
        });
      } else {
        setErrors({
          general:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/40 sm:rounded-xl sm:px-10 border border-slate-100">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/#hero">
              <Image src="/images/workforceflowailogo1.png" alt="Revboostai logo" height={80} width={180} />
            </Link>
          </div>

          <h2 className="text-center text-[28px] font-bold tracking-tight text-[#22d3ee] mb-2">
            Create your account
          </h2>
          <p className="text-center text-[15px] text-slate-500 mb-8 font-medium">
            Get started with Workforceflow ai
          </p>

          {/* General API error */}
          {errors.general && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form
            action="/api/auth/fallback-signup"
            className="space-y-5"
            method="post"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full appearance-none rounded-lg border-0 bg-[#f4f6f8] px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                  errors.name
                    ? "ring-2 ring-red-400 focus:ring-red-400"
                    : "focus:ring-cyan-400"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full appearance-none rounded-lg border-0 bg-[#f4f6f8] px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                  errors.email
                    ? "ring-2 ring-red-400 focus:ring-red-400"
                    : "focus:ring-cyan-400"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full appearance-none rounded-lg border-0 bg-[#f4f6f8] px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                  errors.password
                    ? "ring-2 ring-red-400 focus:ring-red-400"
                    : "focus:ring-cyan-400"
                }`}
              />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full appearance-none rounded-lg border-0 bg-[#f4f6f8] px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                  errors.confirmPassword
                    ? "ring-2 ring-red-400 focus:ring-red-400"
                    : "focus:ring-cyan-400"
                }`}
              />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#22d3ee] hover:text-[#06b6d4] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
