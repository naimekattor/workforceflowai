'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '../context/OnboardingLayout';
import { OnboardingCard, CardBody, CardFooter } from '../components/OnboardingUI';
import { useOnboarding, getStep2Route, type BusinessType } from '../context/OnboardingContext';

const BUSINESS_TYPES: { id: BusinessType; title: string; desc: string; badge?: string }[] = [
  {
    id: 'sole_trader',
    title: 'Sole Trader (Self-employed)',
    desc: 'You work for yourself as an individual and are personally responsible for your business.',
    // badge: 'Most common',
  },
  {
    id: 'limited_company',
    title: 'Limited Company (Ltd)',
    desc: 'A private limited company registered with Companies House — separate legal entity.',
  },
  {
    id: 'partnership',
    title: 'Partnership',
    desc: 'A business owned and run by two or more people who share profits and liability.',
  },
  {
    id: 'llp',
    title: 'Limited Liability Partnership (LLP)',
    desc: 'A partnership with limited liability protection, registered at Companies House.',
  },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const handleNext = () => {
    router.push(getStep2Route(data.businessType));
  };

  return (
    <OnboardingLayout currentStep={1}>
      <OnboardingCard>
        <CardBody
          title="Select Your Business Type"
          description="This customises the setup process and the forms you'll need to complete."
        >
          <div className="space-y-3">
            {BUSINESS_TYPES.map(type => {
              const selected = data.businessType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => update('businessType', type.id)}
                  className={`w-full flex items-start gap-4 p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-150
                    ${selected
                      ? 'border-[#22d3ee] bg-[#f0fdfa] shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/70'
                    }`}
                >
                  {/* Radio dot */}
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${selected ? 'border-[#22d3ee]' : 'border-slate-300'}`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-slate-900">{type.title}</span>
                      {type.badge && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#ccfbf1] text-[#059669]">
                          {type.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-slate-500 mt-0.5 block">{type.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>

        <CardFooter
          step={1}
          disablePrev
          onNext={handleNext}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}