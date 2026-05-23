'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Pencil } from 'lucide-react';
import OnboardingLayout from '../context/OnboardingLayout';
import { OnboardingCard, CardBody, CardFooter } from '../components/OnboardingUI';
import {
  OnboardingData,
  useOnboarding,
  getStep2Route,
  getStep3Route,
} from '../context/OnboardingContext';
import { createBusinessDetails, OnboardingApiError } from '@/lib/api/onboarding';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  sole_trader: 'Sole Trader (Self-employed)',
  limited_company: 'Limited Company (Ltd)',
  partnership: 'Partnership',
  llp: 'Limited Liability Partnership (LLP)',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  rows: { label: string; value: string | number | boolean | undefined }[];
}

function ReviewSection({ title, onEdit, rows }: ReviewSectionProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-[#22d3ee] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      <div className="px-4 sm:px-6 py-4 space-y-2.5">
        {rows
          .filter(r => r.value !== '' && r.value !== undefined)
          .map(r => (
            <div key={r.label} className="flex gap-3 text-[13px]">
              <span className="text-slate-400 font-medium min-w-[130px] flex-shrink-0">{r.label}</span>
              <span className="text-slate-800 font-medium break-all">
                {typeof r.value === 'boolean' ? (r.value ? 'Yes' : 'No') : String(r.value)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function Step6Review() {
  const router = useRouter();
  const { data } = useOnboarding();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const bt = data.businessType;
  const isSessionLoading = status === 'loading';
  const hasAccessToken = Boolean(session?.accessToken);

  const handleCompleteSetup = async () => {
    if (isSessionLoading || isSubmitting) {
      return;
    }

    if (!session || !hasAccessToken) {
      router.push('/login');
      return;
    }

    const validationIssues = validateOnboardingData(data);
    if (validationIssues.length > 0) {
      setSubmissionError(validationMessage(validationIssues));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await createBusinessDetails(bt, buildBusinessDetailsFormData(data));
      router.push('/dashboard');
    } catch (error) {
      setSubmissionError(
        error instanceof OnboardingApiError
          ? error.message
          : 'Setup failed. Please check your details and try again.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build business details rows based on type
  const businessDetailRows = bt === 'sole_trader'
    ? [
        { label: 'Legal Name', value: data.st_legalName },
        { label: 'Trading Name', value: data.st_tradingName },
        { label: 'Address', value: data.st_address },
        { label: 'UTR', value: data.st_utr },
        { label: 'NI Number', value: data.st_niNumber },
        { label: 'Industry', value: data.st_industry },
      ]
    : bt === 'limited_company'
    ? [
        { label: 'Company Name', value: data.lc_companyName },
        { label: 'Reg. Number', value: data.lc_registrationNumber },
        { label: 'Address', value: data.lc_registeredAddress },
        { label: 'Directors', value: data.lc_directors.filter(Boolean).join(', ') },
        { label: 'Email', value: data.lc_email },
        { label: 'Phone', value: data.lc_phone },
        { label: 'Corp Tax UTR', value: data.lc_corpTaxUtr },
      ]
    : bt === 'partnership'
    ? [
        { label: 'Partnership Name', value: data.p_partnershipName },
        { label: 'Address', value: data.p_address },
        { label: 'Partners', value: data.p_partners.filter(p => p.name).map(p => p.utr ? `${p.name} (UTR: ${p.utr})` : p.name).join(', ') },
        { label: 'Email', value: data.p_email },
        { label: 'Phone', value: data.p_phone },
      ]
    : [
        { label: 'LLP Name', value: data.llp_name },
        { label: 'Reg. Number', value: data.llp_registrationNumber },
        { label: 'Address', value: data.llp_registeredAddress },
        { label: 'Members', value: data.llp_members.filter(Boolean).join(', ') },
        { label: 'Email', value: data.llp_email },
        { label: 'Phone', value: data.llp_phone },
        { label: 'Corp Tax UTR', value: data.llp_corpTaxUtr },
      ];

  return (
    <OnboardingLayout currentStep={6}>
      <OnboardingCard>
        <CardBody
          title="Review Your Information"
          description="Check everything looks right before completing setup."
        >
          <div className="space-y-3 sm:space-y-4">
            {submissionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submissionError}
              </div>
            )}

            <ReviewSection
              title="Business Type"
              onEdit={() => router.push('/onboarding/step-1')}
              rows={[{ label: 'Type', value: BUSINESS_TYPE_LABELS[bt] }]}
            />

            <ReviewSection
              title="Business Details"
              onEdit={() => router.push(getStep2Route(bt))}
              rows={businessDetailRows}
            />

            <ReviewSection
              title="Tax & Registration"
              onEdit={() => router.push(getStep3Route(bt))}
              rows={[
                { label: 'VAT Registered', value: data.vatRegistered },
                ...(data.vatRegistered ? [{ label: 'VAT Number', value: data.vatNumber }, { label: 'VAT Scheme', value: data.vatScheme === 'flat_rate' ? 'Flat Rate' : 'Standard' }] : []),
                { label: 'CIS Registered', value: data.cisRegistered },
                ...(data.cisRegistered ? [{ label: 'CIS Role', value: data.cisRole === 'both' ? 'Both' : data.cisRole === 'contractor' ? 'Contractor' : 'Subcontractor' }] : []),
                { label: 'PAYE Registered', value: data.payeRegistered },
                ...(data.payeRegistered ? [{ label: 'PAYE Acct. Basis', value: data.payeAccountingBasis === 'cash' ? 'Cash Basis' : 'Accrual Basis' }] : []),
                { label: 'Accounting Method', value: data.accountingMethod === 'cash' ? 'Cash Basis' : 'Accrual Basis' },
              ]}
            />

            <ReviewSection
              title="Contacts"
              onEdit={() => router.push('/onboarding/step-4')}
              rows={[
                { label: 'Primary Name', value: data.primaryName },
                { label: 'Primary Email', value: data.primaryEmail },
                { label: 'Primary Mobile', value: data.primaryMobile },
                ...(data.secondaryName ? [{ label: 'Secondary Name', value: data.secondaryName }] : []),
              ]}
            />

            <ReviewSection
              title="Preferences"
              onEdit={() => router.push('/onboarding/step-5')}
              rows={[
                { label: 'Currency', value: data.currency },
                { label: 'Invoice Prefix', value: data.invoicePrefix },
                { label: 'Payment Terms', value: `${data.paymentTermsDays} days` },
                { label: 'Tax Display', value: data.taxDisplay === 'exclusive' ? 'Tax Exclusive' : 'Tax Inclusive' },
              ]}
            />

            {/* Completion callout */}
            <div className="bg-[#f0fdfa] border border-[#a7f3d0] rounded-xl p-6 sm:p-8 flex flex-col items-center text-center mt-2">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-[#a7f3d0]">
                <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 mb-1">You&apos;re all set!</h3>
              <p className="text-[13px] text-slate-500">Click <strong>Complete Setup</strong> to activate your workforceflow AI account.</p>
            </div>
          </div>
        </CardBody>

        <CardFooter
          step={6}
          onPrev={() => router.push('/onboarding/step-5')}
          onNext={handleCompleteSetup}
          nextLabel={
            isSessionLoading
              ? "Checking Session..."
              : isSubmitting
                ? "Saving..."
                : hasAccessToken
                  ? "Complete Setup"
                  : "Sign in to continue"
          }
          nextClassName="bg-[#10b981] hover:bg-[#059669]"
          disableNext={isSessionLoading || isSubmitting}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}

interface ValidationIssue {
  label: string;
  route: string;
}

function clean(value: string | undefined): string {
  return value?.trim() ?? '';
}

function nonEmptyItems(items: string[]): string[] {
  return items.map(clean).filter(Boolean);
}

function firstNonEmpty(...values: (string | undefined)[]): string {
  return values.map(clean).find(Boolean) ?? '';
}

function partnerNames(data: OnboardingData): string[] {
  return data.p_partners.map((partner) => clean(partner.name)).filter(Boolean);
}

function partnerUtrs(data: OnboardingData): string[] {
  return data.p_partners.map((partner) => clean(partner.utr)).filter(Boolean);
}

function getBusinessContactEmail(data: OnboardingData): string {
  if (data.businessType === 'limited_company') return clean(data.lc_email);
  if (data.businessType === 'partnership') return clean(data.p_email);
  if (data.businessType === 'llp') return clean(data.llp_email);
  return '';
}

function getBusinessContactPhone(data: OnboardingData): string {
  if (data.businessType === 'limited_company') return clean(data.lc_phone);
  if (data.businessType === 'partnership') return clean(data.p_phone);
  if (data.businessType === 'llp') return clean(data.llp_phone);
  return '';
}

function getContactName(data: OnboardingData): string {
  if (clean(data.primaryName)) return clean(data.primaryName);
  if (data.businessType === 'sole_trader') return clean(data.st_legalName);
  if (data.businessType === 'limited_company') return nonEmptyItems(data.lc_directors)[0] ?? '';
  if (data.businessType === 'partnership') return partnerNames(data)[0] ?? '';
  return nonEmptyItems(data.llp_members)[0] ?? '';
}

function getContactEmail(data: OnboardingData): string {
  return firstNonEmpty(data.primaryEmail, getBusinessContactEmail(data));
}

function addIssue(
  issues: ValidationIssue[],
  condition: boolean,
  label: string,
  route: string
) {
  if (condition) issues.push({ label, route });
}

function validateOnboardingData(data: OnboardingData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const businessRoute = getStep2Route(data.businessType);

  if (data.businessType === 'sole_trader') {
    addIssue(issues, !clean(data.st_legalName), 'Sole trader legal name', businessRoute);
  } else if (data.businessType === 'limited_company') {
    addIssue(issues, !clean(data.lc_companyName), 'Company name', businessRoute);
    addIssue(issues, !clean(data.lc_registrationNumber), 'Company registration number', businessRoute);
    addIssue(issues, !getBusinessContactEmail(data), 'Company contact email', businessRoute);
  } else if (data.businessType === 'partnership') {
    addIssue(issues, !clean(data.p_partnershipName), 'Partnership name', businessRoute);
    addIssue(issues, partnerNames(data).length === 0, 'At least one partner name', businessRoute);
  } else if (data.businessType === 'llp') {
    addIssue(issues, !clean(data.llp_name), 'LLP name', businessRoute);
    addIssue(issues, !clean(data.llp_registrationNumber), 'LLP registration number', businessRoute);
    addIssue(issues, nonEmptyItems(data.llp_members).length === 0, 'At least one LLP member', businessRoute);
    addIssue(issues, !getBusinessContactEmail(data), 'LLP contact email', businessRoute);
  }

  const contactName = getContactName(data);
  const contactEmail = getContactEmail(data);

  addIssue(issues, !contactName, 'Primary contact name', '/onboarding/step-4');
  addIssue(issues, !contactEmail, 'Primary contact email', '/onboarding/step-4');
  addIssue(
    issues,
    Boolean(contactEmail) && !EMAIL_PATTERN.test(contactEmail),
    'Valid primary contact email',
    '/onboarding/step-4'
  );

  return issues;
}

function appendValue(formData: FormData, key: string, value: string | number | boolean | undefined) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    formData.append(key, String(value));
    return;
  }

  const cleaned = clean(value);
  if (cleaned) formData.append(key, cleaned);
}

function apiCisRole(role: OnboardingData['cisRole']): string {
  if (role === 'both') return 'Both';
  return role === 'contractor' ? 'Contractor' : 'Subcontractor';
}

function apiAccountingMethod(method: OnboardingData['accountingMethod']): string {
  return method === 'cash' ? 'Cash' : 'Accrual';
}

function apiVatScheme(scheme: OnboardingData['vatScheme']): string {
  return scheme === 'standard' ? 'Standard_VAT' : 'Flat_Rate_VAT';
}

function appendCommonFields(formData: FormData, data: OnboardingData) {
  const contactEmail = getContactEmail(data);
  const contactPhone = firstNonEmpty(data.primaryMobile, getBusinessContactPhone(data));

  appendValue(formData, 'full_name', getContactName(data));
  appendValue(formData, 'email', contactEmail);
  appendValue(formData, 'phone_number', contactPhone);
  appendValue(formData, 'full_address', data.primaryAddress);
  appendValue(formData, 'secondary_full_name', data.secondaryName);
  appendValue(formData, 'secondary_email', data.secondaryEmail);
  appendValue(formData, 'secondary_phone_number', data.secondaryMobile);
  appendValue(formData, 'is_vat_registered', data.vatRegistered);
  appendValue(formData, 'is_cis_registered', data.cisRegistered);
  if (data.cisRegistered) appendValue(formData, 'cis_role', apiCisRole(data.cisRole));
  appendValue(formData, 'accounting_method', apiAccountingMethod(data.accountingMethod));
  appendValue(formData, 'invoice_prefix', data.invoicePrefix);
  appendValue(formData, 'quote_number_format', data.quoteFormat);
  appendValue(formData, 'invoice_number_format', data.invoiceFormat);
  appendValue(formData, 'currency', data.currency);
  appendValue(formData, 'tax_display', data.taxDisplay === 'inclusive' ? 'Inclusive' : 'Exclusive');

  if (data.logoFile) {
    formData.append('company_logo', data.logoFile);
  }
}

function appendVatSchemeForUnincorporated(formData: FormData, data: OnboardingData) {
  if (data.vatRegistered) {
    appendValue(formData, 'vat_scheme', apiVatScheme(data.vatScheme));
  }
}

function appendCompanyTaxFields(formData: FormData, data: OnboardingData) {
  appendValue(formData, 'is_paye_registered', data.payeRegistered);
  appendValue(formData, 'primary_contact_email', firstNonEmpty(getBusinessContactEmail(data), data.primaryEmail));
  appendValue(formData, 'primary_phone_number', firstNonEmpty(getBusinessContactPhone(data), data.primaryMobile));
}

function buildBusinessDetailsFormData(data: OnboardingData): FormData {
  const formData = new FormData();
  appendCommonFields(formData, data);

  if (data.businessType === 'sole_trader') {
    appendVatSchemeForUnincorporated(formData, data);
    appendValue(formData, 'business_name', data.st_legalName);
    appendValue(formData, 'trading_name', data.st_tradingName);
    appendValue(formData, 'business_address', data.st_address);
    appendValue(formData, 'utr', data.st_utr);
    appendValue(formData, 'National_insurance_number', data.st_niNumber);
    appendValue(formData, 'industry', data.st_industry);
  } else if (data.businessType === 'limited_company') {
    appendCompanyTaxFields(formData, data);
    appendValue(formData, 'company_name', data.lc_companyName);
    appendValue(formData, 'registration_number', data.lc_registrationNumber);
    appendValue(formData, 'company_address', data.lc_registeredAddress);
    appendValue(formData, 'trading_address', data.lc_registeredAddress);
    appendValue(formData, 'directors', nonEmptyItems(data.lc_directors).join(', '));
    appendValue(formData, 'corporation_tax_utr', data.lc_corpTaxUtr);
  } else if (data.businessType === 'partnership') {
    appendVatSchemeForUnincorporated(formData, data);
    appendValue(formData, 'partnership_name', data.p_partnershipName);
    appendValue(formData, 'business_address', data.p_address);
    appendValue(formData, 'partnership_address', data.p_address);
    appendValue(formData, 'partner_name', partnerNames(data).join(', '));
    appendValue(formData, 'partner_utr', partnerUtrs(data).join(', '));
  } else {
    appendCompanyTaxFields(formData, data);
    appendValue(formData, 'llp_name', data.llp_name);
    appendValue(formData, 'registration_number', data.llp_registrationNumber);
    appendValue(formData, 'register_address', data.llp_registeredAddress);
    appendValue(formData, 'member_name', nonEmptyItems(data.llp_members).join(', '));
    appendValue(formData, 'trading_address', data.llp_registeredAddress);
    appendValue(formData, 'designated_members', nonEmptyItems(data.llp_members).join(', '));
    appendValue(formData, 'corporation_tax_utr', data.llp_corpTaxUtr);
  }

  return formData;
}

function validationMessage(issues: ValidationIssue[]): string {
  const labels = issues.map((issue) => issue.label).join(', ');
  return `Please complete these required fields before submitting: ${labels}.`;
}
