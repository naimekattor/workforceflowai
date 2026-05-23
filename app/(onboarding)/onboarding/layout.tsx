'use client';
import { OnboardingProvider } from '@/onboarding/context/OnboardingContext';

export default function OnboardingRootLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}