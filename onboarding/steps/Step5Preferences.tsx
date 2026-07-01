'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Upload } from 'lucide-react';
import OnboardingLayout from '../context/OnboardingLayout';
import { OnboardingCard, CardBody, CardFooter, Field, SelectField } from '../components/OnboardingUI';
import { useOnboarding } from '../context/OnboardingContext';

const CURRENCIES = [
  { id: 'GBP', label: 'GBP - British Pound' },
] as const;

const TAX_DISPLAY_OPTIONS = [
  { id: 'exclusive', label: 'Tax Exclusive', sublabel: 'Tax shown separately on documents' },
  { id: 'inclusive', label: 'Tax Inclusive', sublabel: 'Tax included in item prices' },
] as const;

// Inline dropdown – avoids native <select> styling inconsistencies
function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string; sublabel?: string }>;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find(o => o.id === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 flex items-center justify-between hover:border-slate-300 transition-colors"
      >
        <span>{current?.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-start gap-3
                ${value === opt.id ? 'bg-[#f0fdfa] text-slate-900' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                ${value === opt.id ? 'border-[#22d3ee]' : 'border-slate-300'}`}>
                {value === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />}
              </div>
              <div>
                <p className="font-semibold">{opt.label}</p>
                {opt.sublabel && <p className="text-[12px] text-slate-400 mt-0.5">{opt.sublabel}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step5Preferences() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={5}>
      <OnboardingCard>
        <CardBody
          title="Preferences & Branding"
          description="Customise how your invoices and quotes look."
        >
          <div className="space-y-4 sm:space-y-5">

            {/* Logo upload */}
            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
                Company Logo <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 relative group overflow-hidden">
                  {data.logoUrl ? (
                    <>
                      <img src={data.logoUrl} alt="logo" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <Upload className="w-6 h-6 text-slate-300" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        update('logoFile', file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          update('logoUrl', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">Upload your logo</p>
                  <p className="text-[12px] text-slate-500 mb-3">Recommended size 400x400px. PNG, JPG or SVG.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      input?.click();
                    }}
                    className="text-[12px] font-bold text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
                  >
                    Select Image
                  </button>
                </div>
              </div>
            </div>

            {/* Numbering */}
              <Field
                label="Invoice Prefix"
                value={data.invoicePrefix}
                onChange={e => update('invoicePrefix', e.target.value)}
              />
              
            

            <Field
              label="Quote Number Format"
              hint="Use {YYYY} for year, {####} for sequential number"
              value={data.quoteFormat}
              onChange={e => update('quoteFormat', e.target.value)}
            />
            <Field
              label="Invoice Number Format"
              value={data.invoiceFormat}
              onChange={e => update('invoiceFormat', e.target.value)}
            />

            <Dropdown
              label="Currency"
              value={data.currency}
              options={CURRENCIES}
              onChange={v => update('currency', v)}
            />

            <Dropdown
              label="Tax Display on Documents"
              value={data.taxDisplay}
              options={TAX_DISPLAY_OPTIONS}
              onChange={v => update('taxDisplay', v)}
            />
            <SelectField
  label="Default Quotation Validity (days)"
  value={String(data.paymentTermsDays ?? 1)}
  onChange={e => update('paymentTermsDays', Number(e.target.value))}
  options={[
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '20', label: '20 days' },
    { value: '30', label: '30 days' },
    { value: '45', label: '45 days' },
  ]}
/>
          </div>
          
        </CardBody>

        <CardFooter
          step={5}
          onPrev={() => router.push('/onboarding/step-4')}
          onNext={() => router.push('/onboarding/step-6')}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}