'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Pencil } from 'lucide-react';
import OnboardingLayout from '../context/OnboardingLayout';
import { OnboardingCard, CardBody, CardFooter } from '../components/OnboardingUI';
import { useOnboarding, getStep2Route, getStep3Route } from '../context/OnboardingContext';
import { createBusinessDetails } from '@/lib/api/onboarding';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  sole_trader: 'Sole Trader (Self-employed)',
  limited_company: 'Limited Company (Ltd)',
  partnership: 'Partnership',
  llp: 'Limited Liability Partnership (LLP)',
};

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

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const bt = data.businessType;
      const today = new Date().toISOString().split('T')[0];

      // Base common fields
      formData.append('primary_contact_email', data.primaryEmail || 'user@example.com');
      formData.append('primary_phone_number', data.primaryMobile || '');
      formData.append('is_vat_registered', String(data.vatRegistered));
      formData.append('is_cis_registered', String(data.cisRegistered));
      formData.append('is_paye_registered', String(data.payeRegistered));
      formData.append('cis_role', data.cisRole ? data.cisRole.charAt(0).toUpperCase() + data.cisRole.slice(1) : 'Contractor');
      formData.append('accounting_method', data.accountingMethod ? data.accountingMethod.charAt(0).toUpperCase() + data.accountingMethod.slice(1) : 'Cash');
      formData.append('full_name', data.primaryName || '');
      formData.append('email', data.primaryEmail || 'user@example.com');
      formData.append('phone_number', data.primaryMobile || '');
      formData.append('full_address', data.primaryAddress || '');
      formData.append('secondary_full_name', data.secondaryName || '');
      formData.append('secondary_email', data.secondaryEmail || 'user@example.com');
      formData.append('secondary_phone_number', data.secondaryMobile || '');
      formData.append('invoice_prefix', data.invoicePrefix || 'INV');
      formData.append('quote_number_format', data.quoteFormat || 'QT-{YYYY}-{####}');
      formData.append('invoice_number_format', data.invoiceFormat || 'INV-{YYYY}-{####}');
      formData.append('currency', data.currency || 'GBP');
      formData.append('tax_display', data.taxDisplay === 'inclusive' ? 'Inclusive' : 'Exclusive');
      formData.append('default_payment_terms', String(data.paymentTermsDays || 30));
      formData.append('user', session.user?.id ? session.user.id : '9');

      // Add logo file if exists
      if (data.logoFile) {
        formData.append('company_logo', data.logoFile);
      }

      if (bt === 'limited_company') {
        formData.append('usertype', 'LTD');
        formData.append('company_name', data.lc_companyName || '');
        formData.append('registration_number', data.lc_registrationNumber || '');
        formData.append('date_of_incorporation', today);
        formData.append('company_address', data.lc_registeredAddress || '');
        formData.append('trading_address', data.lc_registeredAddress || '');
        formData.append('directors', data.lc_directors.filter(Boolean).join(', '));
        formData.append('corporation_tax_utr', data.lc_corpTaxUtr || '');
      } else if (bt === 'llp') {
        formData.append('llp_name', data.llp_name || '');
        formData.append('registration_number', data.llp_registrationNumber || '');
        formData.append('register_address', data.llp_registeredAddress || '');
        formData.append('member_name', data.llp_members.filter(Boolean).join(', '));
        formData.append('member_utr', '');
        formData.append('trading_address', data.llp_registeredAddress || '');
        formData.append('designated_members', data.llp_members.filter(Boolean).join(', '));
        formData.append('corporation_tax_utr', data.llp_corpTaxUtr || '');
      } else if (bt === 'partnership') {
        formData.append('partnership_name', data.p_partnershipName || '');
        formData.append('business_address', data.p_address || '');
        formData.append('date_started', today);
        formData.append('date_partnership_started', today);
        formData.append('partnership_address', data.p_address || '');
        formData.append('utr', ''); 
        formData.append('National_insurance_number', '');
        formData.append('industry', '');
        formData.append('partner_name', data.p_partners.filter(p => p?.name).map(p => p.name).join(', '));
        formData.append('partner_utr', data.p_partners.filter(p => p?.utr).map(p => p.utr).join(', '));
        formData.append('partnership_utr', '');
        formData.append('vat_scheme', data.vatScheme === 'standard' ? 'Standard_VAT' : 'Flat_Rate_VAT');
      } else if (bt === 'sole_trader') {
        formData.append('business_name', data.st_legalName || '');
        formData.append('trading_name', data.st_tradingName || '');
        formData.append('date_business_started', today);
        formData.append('business_address', data.st_address || '');
        formData.append('utr', data.st_utr || '');
        formData.append('National_insurance_number', data.st_niNumber || '');
        formData.append('industry', data.st_industry || '');
        formData.append('vat_scheme', data.vatScheme === 'standard' ? 'Standard_VAT' : 'Flat_Rate_VAT');
      }

      await createBusinessDetails(bt, formData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Setup failed. Please try again.');
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
