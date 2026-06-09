import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, Shield } from "lucide-react";
import { landingFaqs } from "@/lib/landing/faqs";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50">
            <HelpCircle className="h-6 w-6 text-cyan-600" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-7 text-slate-600">
            Quick answers to common questions about plans, billing, and workflow automation.
          </p>
        </div>

        <div className="space-y-5">
          {landingFaqs.map((faq, index) => (
            <section
              key={faq.q}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-2 text-lg font-bold text-slate-900">
                {index + 1}. {faq.q}
              </h2>
              <p className="leading-7 text-slate-600">{faq.a}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Shield className="h-4 w-4" />
            30-day money-back guarantee on all plans
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
