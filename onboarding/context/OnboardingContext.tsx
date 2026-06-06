import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BusinessType = 'sole_trader' | 'limited_company' | 'partnership' | 'llp';

export interface Partner {
  name: string;
  utr: string;
}

export interface OnboardingData {
  // Step 1
  businessType: BusinessType;

  // Step 2 – Sole Trader
  st_legalName: string;
  st_tradingName: string;
  st_address: string;
  st_utr: string;
  st_niNumber: string;
  st_industry: string;

  // Step 2 – Limited Company
  lc_companyName: string;
  lc_registrationNumber: string;
  lc_registeredAddress: string;
  lc_directors: string[];
  lc_email: string;
  lc_phone: string;
  lc_corpTaxUtr: string;

  // Step 2 – Partnership
  p_partnershipName: string;
  p_address: string;
  p_partners: Partner[];
  p_email: string;
  p_phone: string;

  // Step 2 – LLP
  llp_name: string;
  llp_registrationNumber: string;
  llp_registeredAddress: string;
  llp_members: string[];
  llp_email: string;
  llp_phone: string;
  llp_corpTaxUtr: string;

  // Step 3 – Tax
  vatRegistered: boolean;
  vatNumber: string;
  vatScheme: 'standard' | 'flat_rate';
  cisRegistered: boolean;
  cisRole: 'contractor' | 'subcontractor' | 'both';
  payeRegistered: boolean;
  payeAccountingBasis: 'cash' | 'accrual';
  accountingMethod: 'cash' | 'accrual';

  // Step 4 – Contacts
  primaryName: string;
  primaryEmail: string;
  primaryMobile: string;
  primaryAddress: string;
  secondaryName: string;
  secondaryEmail: string;
  secondaryMobile: string;

  // Step 5 – Preferences
  logoFile: File | null;
  logoUrl: string;
  invoicePrefix: string;
  quoteFormat: string;
  invoiceFormat: string;
  currency: 'GBP';
  taxDisplay: 'exclusive' | 'inclusive';
  paymentTermsDays: number;
}

const defaultData: OnboardingData = {
  businessType: 'sole_trader',
  st_legalName: '', st_tradingName: '', st_address: '', st_utr: '', st_niNumber: '', st_industry: '',
  lc_companyName: '', lc_registrationNumber: '', lc_registeredAddress: '', lc_directors: [''], lc_email: '', lc_phone: '', lc_corpTaxUtr: '',
  p_partnershipName: '', p_address: '', p_partners: [{ name: '', utr: '' }], p_email: '', p_phone: '',
  llp_name: '', llp_registrationNumber: '', llp_registeredAddress: '', llp_members: [''], llp_email: '', llp_phone: '', llp_corpTaxUtr: '',
  vatRegistered: false, vatNumber: '', vatScheme: 'standard', cisRegistered: false, cisRole: 'subcontractor', payeRegistered: false, payeAccountingBasis: 'cash', accountingMethod: 'cash',
  primaryName: '', primaryEmail: '', primaryMobile: '', primaryAddress: '', secondaryName: '', secondaryEmail: '', secondaryMobile: '',
  logoFile: null, logoUrl: '', invoicePrefix: 'INV', quoteFormat: 'QT-{YYYY}-{####}', invoiceFormat: 'INV-{YYYY}-{####}', currency: 'GBP', taxDisplay: 'exclusive', paymentTermsDays: 1,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface OnboardingContextValue {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  updateMany: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const update = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateMany = useCallback((partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => setData(defaultData), []);

  return (
    <OnboardingContext.Provider value={{ data, update, updateMany, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}

// ─── Route Helpers ────────────────────────────────────────────────────────────

export function getStep2Route(businessType: BusinessType) {
  const map: Record<BusinessType, string> = {
    sole_trader: '/onboarding/step-2/sole-trader',
    limited_company: '/onboarding/step-2/limited-company',
    partnership: '/onboarding/step-2/partnership',
    llp: '/onboarding/step-2/llp',
  };
  return map[businessType];
}

export function getStep3Route(businessType: BusinessType) {
  return businessType === 'sole_trader'
    ? '/onboarding/step-3/sole-trader'
    : '/onboarding/step-3/limited-company';
}

export const STEPS = [
  { num: 1, label: 'Business Type' },
  { num: 2, label: 'Basic Details' },
  { num: 3, label: 'Tax & Registration' },
  { num: 4, label: 'Contacts' },
  { num: 5, label: 'Preferences' },
  { num: 6, label: 'Review' },
] as const;
