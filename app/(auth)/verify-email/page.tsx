"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  sendEmailVerificationOtp,
  verifyEmail,
} from "@/lib/api/auth";

function firstApiMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
}

function getEmailFromLocation(): string {
  if (typeof window === "undefined") return "";

  const queryEmail = new URLSearchParams(window.location.search).get("email");
  if (queryEmail) return queryEmail;

  return window.sessionStorage.getItem("pendingVerificationEmail") || "";
}

async function signInAfterVerification(email: string) {
  const password = window.sessionStorage.getItem("pendingVerificationPassword");
  if (!password) return true;

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  window.sessionStorage.removeItem("pendingVerificationPassword");
  return !result?.error;
}

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setEmail(getEmailFromLocation());
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    setMessage("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .slice(0, 4)
      .replace(/\D/g, "")
      .split("");
    const newCode = [...code];

    pasted.forEach((digit, index) => {
      if (index < 4) newCode[index] = digit;
    });

    setCode(newCode);
    setError("");
    setMessage("");
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const getApiErrorMessage = (
    error: unknown,
    fallback: string
  ): string => {
    if (error instanceof ApiRequestError && error.data) {
      return (
        firstApiMessage(error.data.otp) ||
        firstApiMessage(error.data.email) ||
        firstApiMessage(error.data.detail) ||
        firstApiMessage(error.data.message) ||
        error.message
      );
    }

    return error instanceof Error ? error.message : fallback;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const otp = code.join("");

    if (!email) {
      setError("Email address is missing. Please sign up again.");
      return;
    }

    if (otp.length < 4) {
      setError("Please enter the complete 4 digit code.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setMessage("");

    try {
      await verifyEmail({ email, otp });
      const signedIn = await signInAfterVerification(email);

      window.sessionStorage.removeItem("pendingVerificationEmail");

      if (!signedIn) {
        router.push("/login?callbackUrl=/onboarding");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Invalid code. Please try again."));
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing. Please sign up again.");
      return;
    }

    setIsResending(true);
    setError("");
    setMessage("");

    try {
      await sendEmailVerificationOtp({ email });
      setMessage("Code has been sent. Check your email.");
    } catch (error: unknown) {
      setError(
        getApiErrorMessage(
          error,
          "Unable to send verification code. Please try again."
        )
      );
    } finally {
      setIsResending(false);
    }
  };

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
            Verify your email
          </h2>
          <p className="text-center text-[15px] text-slate-500 mb-8 font-medium">
            Enter the 4 digit code sent to {email || "your email"}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-16 w-14 rounded-lg border-2 border-slate-200 bg-[#f4f6f8] text-center text-2xl font-bold text-slate-900 outline-none transition-all focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/20"
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            {message && (
              <p className="text-center text-sm text-emerald-600">
                {message}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-[14px] text-slate-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isVerifying}
              className="font-medium text-[#22d3ee] transition-colors hover:text-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>

          {/* <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-[14px] text-slate-500 hover:text-slate-700 transition-colors"
            >
              Use a different email
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
