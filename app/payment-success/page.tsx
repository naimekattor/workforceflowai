"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Payment successful
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Your payment has been completed. Redirecting to your dashboard.
        </p>

        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Opening dashboard...
        </div>

        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#22d3ee] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#06b6d4]"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
