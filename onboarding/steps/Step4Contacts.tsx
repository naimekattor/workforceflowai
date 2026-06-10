'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '../context/OnboardingLayout';
import {
  OnboardingCard, CardBody, CardFooter,
  SectionBox, Field,
} from '../components/OnboardingUI';
import { useOnboarding, getStep3Route } from '../context/OnboardingContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string | undefined): string {
  return value?.trim() ?? '';
}

export default function Step4Contacts() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!clean(data.primaryName)) {
      setError('Primary contact full name is required.');
      return;
    }

    if (!clean(data.primaryEmail)) {
      setError('Primary contact email is required.');
      return;
    }

    if (!EMAIL_PATTERN.test(clean(data.primaryEmail))) {
      setError('Enter a valid primary contact email.');
      return;
    }

    if (!clean(data.primaryMobile)) {
      setError('Primary contact mobile is required.');
      return;
    }

    if (!clean(data.primaryAddress)) {
      setError('Primary contact full address is required.');
      return;
    }

    if (clean(data.secondaryEmail) && !EMAIL_PATTERN.test(clean(data.secondaryEmail))) {
      setError('Enter a valid secondary contact email, or leave it blank.');
      return;
    }

    router.push('/onboarding/step-5');
  }

  return (
    <OnboardingLayout currentStep={4}>
      <OnboardingCard>
        <CardBody
          title="Contact Information"
          description="Who should we contact about your account?"
        >
          <div className="space-y-4 sm:space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Primary ───────────────────────────────────────────────────── */}
            <SectionBox title="Primary Contact">
              <Field
                label="Full Name" required
                placeholder="John Smith"
                value={data.primaryName}
                onChange={e => update('primaryName', e.target.value)}
              />
              <Field
                label="Email" required type="email"
                placeholder="john@company.com"
                value={data.primaryEmail}
                onChange={e => update('primaryEmail', e.target.value)}
              />
              <Field
                label="Mobile" required type="tel"
                placeholder="+44 7700 900000"
                value={data.primaryMobile}
                onChange={e => update('primaryMobile', e.target.value)}
              />
              <Field
                label="Full Address" required
                placeholder="123 High Street, London, SW1A 1AA"
                value={data.primaryAddress}
                onChange={e => update('primaryAddress', e.target.value)}
              />
            </SectionBox>

            {/* Secondary ─────────────────────────────────────────────────── */}
            <SectionBox title="Secondary Contact (Optional)">
              <Field
                label="Full Name"
                placeholder="Jane Doe"
                value={data.secondaryName}
                onChange={e => update('secondaryName', e.target.value)}
              />
              <Field
                label="Email" type="email"
                placeholder="jane@company.com"
                value={data.secondaryEmail}
                onChange={e => update('secondaryEmail', e.target.value)}
              />
              <Field
                label="Mobile" type="tel"
                placeholder="+44 7700 900001"
                value={data.secondaryMobile}
                onChange={e => update('secondaryMobile', e.target.value)}
              />
            </SectionBox>
          </div>
        </CardBody>

        <CardFooter
          step={4}
          onPrev={() => router.push(getStep3Route(data.businessType))}
          onNext={handleNext}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}
