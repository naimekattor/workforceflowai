"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import {
  ApiRequestError,
  forgotPassword,
  forgotPasswordConfirm,
  resetPassword,
} from "@/lib/api/auth";

interface FormErrors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

type ForgotPasswordStep = "email" | "otp" | "password" | "complete";

function getStringFormValue(formData: globalThis.FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function firstApiMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(nextEmail: string): boolean {
    const nextErrors: FormErrors = {};

    if (!nextEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateOtp(nextOtp: string): boolean {
    const nextErrors: FormErrors = {};

    if (!/^\d{4}$/.test(nextOtp)) {
      nextErrors.otp = "Enter the 4 digit OTP.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validatePasswords(
    nextPassword: string,
    nextConfirmPassword: string
  ): boolean {
    const nextErrors: FormErrors = {};

    if (nextPassword.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!nextConfirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (nextPassword !== nextConfirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submittedData = new FormData(event.currentTarget);
    const nextEmail = getStringFormValue(submittedData, "email");

    setEmail(nextEmail);
    if (!validateEmail(nextEmail)) return;

    setIsLoading(true);
    setErrors({});

    try {
      await forgotPassword({ email: nextEmail });
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setStep("otp");
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.data) {
        setErrors({
          email: firstApiMessage(error.data.email),
          general:
            firstApiMessage(error.data.detail) ||
            firstApiMessage(error.data.message) ||
            firstApiMessage(error.data.non_field_errors) ||
            error.message,
        });
      } else {
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submittedData = new FormData(event.currentTarget);
    const nextOtp = getStringFormValue(submittedData, "verify_otp");

    setOtp(nextOtp);
    if (!validateOtp(nextOtp)) return;

    setIsLoading(true);
    setErrors({});

    try {
      await forgotPasswordConfirm({ email, verify_otp: nextOtp });
      setPassword("");
      setConfirmPassword("");
      setStep("password");
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.data) {
        setErrors({
          email: firstApiMessage(error.data.email),
          otp: firstApiMessage(error.data.verify_otp),
          general:
            firstApiMessage(error.data.detail) ||
            firstApiMessage(error.data.message) ||
            firstApiMessage(error.data.non_field_errors) ||
            error.message,
        });
      } else {
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !validateEmail(email)) return;

    setIsLoading(true);
    setErrors({});

    try {
      await forgotPassword({ email });
    } catch (error: unknown) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const submittedData = new FormData(event.currentTarget);
    const nextPassword = getStringFormValue(submittedData, "new_password");
    const nextConfirmPassword = getStringFormValue(
      submittedData,
      "confirmPassword"
    );

    setPassword(nextPassword);
    setConfirmPassword(nextConfirmPassword);
    if (!validatePasswords(nextPassword, nextConfirmPassword)) return;

    setIsLoading(true);
    setErrors({});

    try {
      await resetPassword({ email, new_password: nextPassword });
      setStep("complete");
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.data) {
        setErrors({
          email: firstApiMessage(error.data.email),
          password:
            firstApiMessage(error.data.new_password) ||
            firstApiMessage(error.data.password),
          general:
            firstApiMessage(error.data.detail) ||
            firstApiMessage(error.data.message) ||
            firstApiMessage(error.data.non_field_errors) ||
            error.message,
        });
      } else {
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  function getHeading() {
    if (step === "email") return "Reset your password";
    if (step === "otp") return "Verify your OTP";
    if (step === "password") return "Create new password";
    return "Password reset";
  }

  function getDescription() {
    if (step === "email") return "Enter your email and we'll send an OTP";
    if (step === "otp") return `Enter the 4 digit OTP sent to ${email}`;
    if (step === "password") return "Enter and confirm your new password";
    return "Your password has been updated successfully";
  }

  return (
    <div className="min-h-screen bg-[#f4f8fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/40 sm:rounded-xl sm:px-10 border border-slate-100">
          <div className="flex justify-center mb-6">
            <Link href="/#hero">
              <Image
                src="/images/workforceflowailogo1.png"
                alt="Workforceflow ai logo"
                height={80}
                width={180}
              />
            </Link>
          </div>

          <h2 className="text-center text-[28px] font-bold tracking-tight text-[#22d3ee] mb-2">
            {getHeading()}
          </h2>
          <p className="text-center text-[15px] text-slate-500 mb-8 font-medium">
            {getDescription()}
          </p>

          {errors.general && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {step === "complete" && (
            <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              You can now sign in with your new password.
            </div>
          )}

          {step === "email" && (
            <form className="space-y-5" onSubmit={handleSendOtp} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      email: undefined,
                      general: undefined,
                    }));
                  }}
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
              <div>
                <label
                  htmlFor="verify_otp"
                  className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                >
                  OTP
                </label>
                <input
                  id="verify_otp"
                  name="verify_otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={4}
                  placeholder="0000"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 4));
                    setErrors((current) => ({
                      ...current,
                      otp: undefined,
                      general: undefined,
                    }));
                  }}
                  className={`block w-full appearance-none rounded-lg border-0 bg-[#f4f6f8] px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:leading-6 transition-all ${
                    errors.otp
                      ? "ring-2 ring-red-400 focus:ring-red-400"
                      : "focus:ring-cyan-400"
                  }`}
                />
                {errors.otp && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.otp}</p>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleResendOtp}
                  className="flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === "password" && (
            <form
              className="space-y-5"
              onSubmit={handleResetPassword}
              noValidate
            >
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                >
                  New password
                </label>
                <div className="relative">
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      password: undefined,
                      general: undefined,
                    }));
                  }}
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
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: undefined,
                      general: undefined,
                    }));
                  }}
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
                    title={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
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
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="font-medium text-[#22d3ee] hover:text-[#06b6d4] transition-colors text-[14px]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
