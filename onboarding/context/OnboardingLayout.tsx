'use client';

import React from 'react';
import { STEPS } from './OnboardingContext';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OnboardingLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

export default function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] via-[#f0fdfa] to-[#ecfdf5] flex flex-col">
      {/* Header / Stepper Container */}
      <div className="w-full pt-8 sm:pt-14 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <Link href={"/#hero"}>
            <Image width={180} height={80} src="/images/workforceflowailogo2.png" alt="workforceflowai Logo" className="h-[28px] sm:h-[34px] mb-6 object-contain" />
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f172a] mb-2 tracking-tight">Set Up Your Account</h1>
            <p className="text-[14px] sm:text-[15px] font-medium text-slate-500">Complete these steps to start using workforceflow AI</p>
          </div>

          {/* Desktop Stepper */}
<div className="hidden sm:flex flex-col px-4">
  {/* Top row: circles + lines */}
  <div className="flex items-center">
    {STEPS.map((step, index) => {
      const active = step.num === currentStep;
      const completed = step.num < currentStep;
      const isLast = index === STEPS.length - 1;

      return (
        <div key={step.num} className="flex items-center flex-1">
          {/* Circle */}
          <div
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
              ${
                completed
                  ? "bg-[#22d3ee] border-[#22d3ee] text-white"
                  : active
                  ? "bg-white border-[#22d3ee] text-[#22d3ee] ring-4 ring-cyan-50"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
          >
            {completed ? <Check className="w-5 h-5" /> : step.num}
          </div>

          {/* Line */}
          {!isLast && (
            <div className="flex-1 h-0.5 mx-2 bg-slate-200">
              <div
                className="h-0.5 bg-[#22d3ee]"
                style={{
                  width: completed ? "100%" : active ? "50%" : "0%",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>

  {/* Bottom row: labels aligned under each circle */}
  <div className="flex mt-3">
    {STEPS.map((step, index) => {
      const active = step.num === currentStep;
      const completed = step.num < currentStep;
      const isLast = index === STEPS.length - 1;

      return (
        <div key={step.num} className="flex items-start flex-1">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider w-10 text-center flex-shrink-0
              ${
                active
                  ? "text-[#22d3ee]"
                  : completed
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
          >
            {step.label}
          </span>
          {/* Spacer to match line width */}
          {!isLast && <div className="flex-1 mx-2" />}
        </div>
      );
    })}
  </div>
</div>

          {/* Mobile Progress Bar */}
          <div className="sm:hidden flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#22d3ee]">Step {currentStep} of {STEPS.length}</p>
                <h1 className="text-lg font-bold text-slate-900">{STEPS[currentStep - 1].label}</h1>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#22d3ee] transition-all duration-500 ease-in-out rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-[640px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          &copy; 2026 Workforceflow AI. Safe & Secure Setup.
        </p>
      </main>
    </div>
  );
}
