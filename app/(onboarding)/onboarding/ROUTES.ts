/**
 * ═══════════════════════════════════════════════════════════════════
 *  ONBOARDING — NEXT.JS APP ROUTER SETUP
 * ═══════════════════════════════════════════════════════════════════
 *
 * File structure to create under app/ (or pages/ — see both options):
 *
 * ── APP ROUTER (recommended) ──────────────────────────────────────
 *
 *  app/
 *  └── onboarding/
 *      ├── layout.tsx                  ← wraps provider around all steps
 *      ├── page.tsx                    → redirects to /onboarding/step-1
 *      ├── step-1/
 *      │   └── page.tsx
 *      ├── step-2/
 *      │   ├── sole-trader/page.tsx
 *      │   ├── limited-company/page.tsx
 *      │   ├── partnership/page.tsx
 *      │   └── llp/page.tsx
 *      ├── step-3/
 *      │   ├── sole-trader/page.tsx
 *      │   └── limited-company/page.tsx   (shared component — same page)
 *      ├── step-4/page.tsx
 *      ├── step-5/page.tsx
 *      └── step-6/page.tsx
 *
 * ──────────────────────────────────────────────────────────────────
 *
 * COPY THE ROUTE FILES BELOW INTO YOUR PROJECT.
 */

// ─── app/onboarding/layout.tsx ────────────────────────────────────────────────
export const onboardingLayoutContent = `
'use client';
import { OnboardingProvider } from '@/onboarding/context/OnboardingContext';
export default function OnboardingRootLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
`;

// ─── app/onboarding/page.tsx ──────────────────────────────────────────────────
export const onboardingIndexContent = `
import { redirect } from 'next/navigation';
export default function OnboardingIndex() {
  redirect('/onboarding/step-1');
}
`;

// ─── app/onboarding/step-1/page.tsx ──────────────────────────────────────────
export const step1PageContent = `
import OnboardingStep1 from '@/onboarding/steps/Step1BusinessType';
export default OnboardingStep1;
`;

// ─── app/onboarding/step-2/sole-trader/page.tsx ───────────────────────────────
export const step2SoleTraderContent = `
import { Step2SoleTrader } from '@/onboarding/steps/Step2BasicDetails';
export default Step2SoleTrader;
`;

// ─── app/onboarding/step-2/limited-company/page.tsx ──────────────────────────
export const step2LimitedCompanyContent = `
import { Step2LimitedCompany } from '@/onboarding/steps/Step2BasicDetails';
export default Step2LimitedCompany;
`;

// ─── app/onboarding/step-2/partnership/page.tsx ───────────────────────────────
export const step2PartnershipContent = `
import { Step2Partnership } from '@/onboarding/steps/Step2BasicDetails';
export default Step2Partnership;
`;

// ─── app/onboarding/step-2/llp/page.tsx ──────────────────────────────────────
export const step2LLPContent = `
import { Step2LLP } from '@/onboarding/steps/Step2BasicDetails';
export default Step2LLP;
`;

// ─── app/onboarding/step-3/sole-trader/page.tsx ───────────────────────────────
// ─── app/onboarding/step-3/limited-company/page.tsx ─── (same component) ──────
export const step3PageContent = `
import Step3TaxRegistration from '@/onboarding/steps/Step3TaxRegistration';
export default Step3TaxRegistration;
`;

// ─── app/onboarding/step-4/page.tsx ──────────────────────────────────────────
export const step4PageContent = `
import Step4Contacts from '@/onboarding/steps/Step4Contacts';
export default Step4Contacts;
`;

// ─── app/onboarding/step-5/page.tsx ──────────────────────────────────────────
export const step5PageContent = `
import Step5Preferences from '@/onboarding/steps/Step5Preferences';
export default Step5Preferences;
`;

// ─── app/onboarding/step-6/page.tsx ──────────────────────────────────────────
export const step6PageContent = `
import Step6Review from '@/onboarding/steps/Step6Review';
export default Step6Review;
`;

/*
 * ── PAGES ROUTER (if not using App Router) ───────────────────────
 *
 * pages/
 * └── onboarding/
 *     ├── index.tsx          → useRouter().replace('/onboarding/step-1')
 *     ├── step-1.tsx
 *     ├── step-2/
 *     │   ├── sole-trader.tsx
 *     │   ├── limited-company.tsx
 *     │   ├── partnership.tsx
 *     │   └── llp.tsx
 *     ├── step-3/
 *     │   ├── sole-trader.tsx
 *     │   └── limited-company.tsx
 *     ├── step-4.tsx
 *     ├── step-5.tsx
 *     └── step-6.tsx
 *
 * Wrap _app.tsx with <OnboardingProvider> or use the pattern:
 *   export default function Step1Page() {
 *     return (
 *       <OnboardingProvider>
 *         <OnboardingStep1 />
 *       </OnboardingProvider>
 *     );
 *   }
 *
 * NOTE: For Pages Router, replace `useRouter` from 'next/navigation'
 * with `useRouter` from 'next/router' and use router.push() the same way.
 */