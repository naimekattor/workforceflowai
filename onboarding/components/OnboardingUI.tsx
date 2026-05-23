import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Card ─────────────────────────────────────────────────────────────────────

export function OnboardingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-cyan-900/5 overflow-hidden">
      {children}
    </div>
  );
}

// ─── Card Body ────────────────────────────────────────────────────────────────

interface CardBodyProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function CardBody({ title, description, children }: CardBodyProps) {
  return (
    <div className="p-6 sm:p-10">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">{description}</p>
      {children}
    </div>
  );
}

// ─── Card Footer ──────────────────────────────────────────────────────────────

interface CardFooterProps {
  step: number;
  totalSteps?: number;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextClassName?: string;
  disablePrev?: boolean;
  disableNext?: boolean;
}

export function CardFooter({
  step,
  totalSteps = 6,
  onPrev,
  onNext,
  nextLabel = 'Next',
  nextClassName = 'bg-[#22d3ee] hover:bg-[#06b6d4]',
  disablePrev = false,
  disableNext = false,
}: CardFooterProps) {
  return (
    <div className="px-4 sm:px-10 py-4 sm:py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={disablePrev}
        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 border rounded-lg text-sm font-bold transition-colors shadow-sm
          ${disablePrev
            ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
          }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <span className="text-xs sm:text-sm font-medium text-slate-500">
        Step {step} of {totalSteps}
      </span>

      <button
        onClick={onNext}
        disabled={disableNext}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-white rounded-lg text-sm font-bold transition-colors shadow-sm ${
          disableNext ? 'bg-slate-300 cursor-not-allowed' : nextClassName
        }`}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  hint?: string;
}

export function Field({ label, required, hint, className, ...inputProps }: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        {...inputProps}
        className={`w-full bg-[#f4f6f8] border-0 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 outline-none transition ${className ?? ''}`}
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────

import { ChevronDown } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export function SelectField({ label, required, options, className, ...rest }: SelectFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          {...rest}
          className={`w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 outline-none appearance-none cursor-pointer ${className ?? ''}`}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Section Box ─────────────────────────────────────────────────────────────

export function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
      <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-[#22d3ee] focus:ring-[#22d3ee]"
      />
      <span className="text-[13px] font-semibold text-slate-800">{label}</span>
    </label>
  );
}

// ─── Info Banner ─────────────────────────────────────────────────────────────

export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4">
      <p className="text-[13px] font-medium text-[#1e40af]">{children}</p>
    </div>
  );
}

// ─── Dynamic List (directors / members) ──────────────────────────────────────

import { Plus, X } from 'lucide-react';
import { Partner } from '../context/OnboardingContext';

interface DynamicListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export function DynamicStringList({ items, onChange, placeholder = 'Name', addLabel = 'Add another' }: DynamicListProps) {
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <input
            type="text"
            value={item}
            
            placeholder={placeholder}
            onChange={e => update(i, e.target.value)}
            className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 outline-none"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  );
}

// ─── Partner List (name + utr) ────────────────────────────────────────────────


interface PartnerListProps {
  partners: Partner[];
  onChange: (partners: Partner[]) => void;
}

export function PartnerList({ partners, onChange }: PartnerListProps) {
  const update = (i: number, field: keyof Partner, v: string) => {
    const next = [...partners];
    next[i] = { ...next[i], [field]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(partners.filter((_, idx) => idx !== i));
  const add = () => onChange([...partners, { name: '', utr: '' }]);

  return (
    <div className="space-y-3">
      {partners.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={p.name}
            placeholder="Partner name"
            onChange={e => update(i, 'name', e.target.value)}
            className="flex-1 bg-[#f4f6f8] border-0 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 outline-none"
          />
          <input
            type="text"
            value={p.utr}
            placeholder="UTR"
            onChange={e => update(i, 'utr', e.target.value)}
            className="w-24 sm:w-32 bg-[#f4f6f8] border-0 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400 outline-none"
          />
          {partners.length > 1 && (
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another partner
      </button>
    </div>
  );
}
