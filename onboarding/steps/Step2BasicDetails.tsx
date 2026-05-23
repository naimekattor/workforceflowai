'use client';

/**
 * Step 2 – Basic Details
 * Four variants in one file, each exported for their respective route.
 * All read/write via OnboardingContext — no localStorage.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '../context/OnboardingLayout';
import {
  OnboardingCard, CardBody, CardFooter,
  Field, SectionBox, DynamicStringList, PartnerList,
} from '../components/OnboardingUI';
import { useOnboarding, getStep3Route } from '../context/OnboardingContext';

// ─── Sole Trader ──────────────────────────────────────────────────────────────

export function Step2SoleTrader() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={2}>
      <OnboardingCard>
        <CardBody title="Business Details" description="Tell us about yourself as a sole trader.">
          <div className="space-y-4 sm:space-y-5">
            <Field
              label="Full Legal Name" required
              placeholder="As registered with HMRC"
              value={data.st_legalName}
              onChange={e => update('st_legalName', e.target.value)}
            />
            <Field
              label="Trading Name"
              placeholder="If different from legal name"
              value={data.st_tradingName}
              onChange={e => update('st_tradingName', e.target.value)}
            />
            <Field
              label="Business Address" required
              placeholder="Full business address"
              value={data.st_address}
              onChange={e => update('st_address', e.target.value)}
            />
            <Field
              label="UTR (Unique Taxpayer Reference)"
              placeholder="10-digit number"
              value={data.st_utr}
              onChange={e => update('st_utr', e.target.value)}
            />
            <Field
              label="National Insurance Number"
              placeholder="QQ 12 34 56 C"
              value={data.st_niNumber}
              onChange={e => update('st_niNumber', e.target.value)}
            />
            <Field
              label="Industry / Trade Type"
              placeholder="e.g. Painting, Plumbing, Construction"
              value={data.st_industry}
              onChange={e => update('st_industry', e.target.value)}
            />
          </div>
        </CardBody>

        <CardFooter
          step={2}
          onPrev={() => router.push('/onboarding/step-1')}
          onNext={() => router.push(getStep3Route(data.businessType))}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}

// ─── Limited Company ──────────────────────────────────────────────────────────

export function Step2LimitedCompany() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={2}>
      <OnboardingCard>
        <CardBody title="Business Details" description="Tell us about your limited company.">
          <div className="space-y-4 sm:space-y-5">
            <Field
              label="Registered Company Name" required
              placeholder="As registered with Companies House"
              value={data.lc_companyName}
              onChange={e => update('lc_companyName', e.target.value)}
            />
            <Field
              label="Company Registration Number" required
              placeholder="8-digit number (e.g. 12345678)"
              value={data.lc_registrationNumber}
              onChange={e => update('lc_registrationNumber', e.target.value)}
            />
            <Field
              label="Registered Address" required
              placeholder="Company registered address"
              value={data.lc_registeredAddress}
              onChange={e => update('lc_registeredAddress', e.target.value)}
            />

            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
                Directors <span className="text-red-400">*</span>
              </label>
              <DynamicStringList
                items={data.lc_directors}
                onChange={v => update('lc_directors', v)}
                placeholder="Director full name"
                addLabel="Add another director"
              />
            </div>

            <Field
              label="Primary Contact Email" required type="email"
              placeholder="contact@company.com"
              value={data.lc_email}
              onChange={e => update('lc_email', e.target.value)}
            />
            <Field
              label="Phone Number" required type="tel"
              placeholder="+44 1234 567890"
              value={data.lc_phone}
              onChange={e => update('lc_phone', e.target.value)}
            />
            <Field
              label="Corporation Tax UTR"
              placeholder="10-digit number"
              value={data.lc_corpTaxUtr}
              onChange={e => update('lc_corpTaxUtr', e.target.value)}
            />
          </div>
        </CardBody>

        <CardFooter
          step={2}
          onPrev={() => router.push('/onboarding/step-1')}
          onNext={() => router.push(getStep3Route(data.businessType))}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}

// ─── Partnership ──────────────────────────────────────────────────────────────

export function Step2Partnership() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={2}>
      <OnboardingCard>
        <CardBody title="Business Details" description="Tell us about your partnership.">
          <div className="space-y-4 sm:space-y-5">
            <Field
              label="Partnership Name" required
              placeholder="As registered (or trading name)"
              value={data.p_partnershipName}
              onChange={e => update('p_partnershipName', e.target.value)}
            />
            <Field
              label="Partnership Address" required
              placeholder="Business address"
              value={data.p_address}
              onChange={e => update('p_address', e.target.value)}
            />

            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
                Partners <span className="text-red-400">*</span>
              </label>
              <PartnerList
                partners={data.p_partners}
                onChange={v => update('p_partners', v)}
              />
            </div>

            <Field
              label="Primary Contact Email" required type="email"
              placeholder="contact@partnership.com"
              value={data.p_email}
              onChange={e => update('p_email', e.target.value)}
            />
            <Field
              label="Phone Number" required type="tel"
              placeholder="+44 1234 567890"
              value={data.p_phone}
              onChange={e => update('p_phone', e.target.value)}
            />
          </div>
        </CardBody>

        <CardFooter
          step={2}
          onPrev={() => router.push('/onboarding/step-1')}
          onNext={() => router.push(getStep3Route(data.businessType))}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}

// ─── LLP ─────────────────────────────────────────────────────────────────────

export function Step2LLP() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={2}>
      <OnboardingCard>
        <CardBody title="Business Details" description="Tell us about your Limited Liability Partnership.">
          <div className="space-y-4 sm:space-y-5">
            <Field
              label="LLP Name" required
              placeholder="As registered with Companies House"
              value={data.llp_name}
              onChange={e => update('llp_name', e.target.value)}
            />
            <Field
              label="Company Registration Number" required
              placeholder="OC123456"
              value={data.llp_registrationNumber}
              onChange={e => update('llp_registrationNumber', e.target.value)}
            />
            <Field
              label="Registered Address" required
              placeholder="LLP registered address"
              value={data.llp_registeredAddress}
              onChange={e => update('llp_registeredAddress', e.target.value)}
            />

            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-slate-800 mb-1.5">
                Designated Members <span className="text-red-400">*</span>
              </label>
              <DynamicStringList
                items={data.llp_members}
                onChange={v => update('llp_members', v)}
                placeholder="Member full name"
                addLabel="Add another member"
              />
            </div>

            <Field
              label="Primary Contact Email" required type="email"
              placeholder="contact@llp.com"
              value={data.llp_email}
              onChange={e => update('llp_email', e.target.value)}
            />
            <Field
              label="Phone Number" required type="tel"
              placeholder="+44 1234 567890"
              value={data.llp_phone}
              onChange={e => update('llp_phone', e.target.value)}
            />
            <Field
              label="Corporation Tax UTR"
              placeholder="10-digit number"
              value={data.llp_corpTaxUtr}
              onChange={e => update('llp_corpTaxUtr', e.target.value)}
            />
          </div>
        </CardBody>

        <CardFooter
          step={2}
          onPrev={() => router.push('/onboarding/step-1')}
          onNext={() => router.push(getStep3Route(data.businessType))}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}