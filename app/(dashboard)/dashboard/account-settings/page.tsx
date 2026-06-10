'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { 
  Building2, 
  Receipt, 
  CreditCard, 
  Bell, 
  Users, 
  Settings as SettingsIcon,
  Download,
  Crown,
  CheckCircle2,
  FileText,
  Save,
  Mail,
  Wallet,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  getUserProfile,
  getBusinessDetails,
  updateBusinessDetails,
  updateBusinessLogo,
  getBusinessTypeKey,
  getBusinessTypeLabel,
  BusinessDetails,
  BusinessTypeKey,
  UserProfile,
} from '@/lib/api/business';
import CollaboratorList from '@/components/dashboard/CollaboratorList';
import WalletTab from '@/components/dashboard/WalletTab';
import { BillingInfo, getBillingHistory } from '@/lib/api/billing';
import { NotificationSettings, getNotificationSettings, updateNotificationSettings } from '@/lib/api/notifications';
import { getPlans, Plan as ApiPlan } from '@/lib/api/plans';
import { showError, showSuccess } from '@/lib/ui/alerts';

type DisplayPlan = {
  name: string;
  subtitle: string;
  price: string;
  customers: string;
  quotes: string;
  teamMembers: string;
};

type BusinessToggleField =
  | 'is_vat_registered'
  | 'is_cis_registered'
  | 'is_paye_registered';

const notificationRows = [
  {
    key: 'quote_accept',
    title: 'Quote Accepted',
    description: 'Get notified when a customer accepts a quote',
  },
  {
    key: 'quote_reject',
    title: 'Quote Rejected',
    description: 'Get notified when a customer rejects a quote',
  },
  {
    key: 'new_customer',
    title: 'New Customer',
    description: 'Get notified when a new customer is added',
  },
] as const;

type NotificationSettingKey = typeof notificationRows[number]['key'];

type BusinessField = {
  name: keyof BusinessDetails;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

const inputClassName =
  'w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400';

const selectClassName = `${inputClassName} appearance-none`;

const businessDetailFields: Record<BusinessTypeKey, BusinessField[]> = {
  sole_trade: [
    { name: 'business_name', label: 'Business Name', required: true },
    { name: 'trading_name', label: 'Trading Name' },
    { name: 'date_business_started', label: 'Date Business Started', type: 'date' },
    { name: 'business_address', label: 'Business Address', type: 'textarea' },
    { name: 'utr', label: 'UTR' },
    { name: 'National_insurance_number', label: 'National Insurance Number' },
    { name: 'industry', label: 'Industry' },
  ],
  limited_company: [
    { name: 'company_name', label: 'Company Name', required: true },
    { name: 'registration_number', label: 'Registration Number', required: true },
    { name: 'date_of_incorporation', label: 'Date of Incorporation', type: 'date' },
    { name: 'company_address', label: 'Company Address', type: 'textarea' },
    { name: 'trading_address', label: 'Trading Address', type: 'textarea' },
    { name: 'directors', label: 'Directors', type: 'textarea' },
    { name: 'primary_contact_email', label: 'Primary Contact Email', type: 'email', required: true },
    { name: 'primary_phone_number', label: 'Primary Phone Number', type: 'tel' },
    { name: 'corporation_tax_utr', label: 'Corporation Tax UTR' },
  ],
  partnership: [
    { name: 'partnership_name', label: 'Partnership Name', required: true },
    { name: 'business_address', label: 'Business Address', type: 'textarea' },
    { name: 'date_started', label: 'Date Started', type: 'date' },
    { name: 'date_partnership_started', label: 'Date Partnership Started', type: 'date' },
    { name: 'partnership_address', label: 'Partnership Address', type: 'textarea' },
    { name: 'utr', label: 'UTR' },
    { name: 'National_insurance_number', label: 'National Insurance Number' },
    { name: 'industry', label: 'Industry' },
    { name: 'partner_name', label: 'Partner Name', required: true },
    { name: 'partner_utr', label: 'Partner UTR' },
    { name: 'partnership_utr', label: 'Partnership UTR' },
  ],
  llp: [
    { name: 'llp_name', label: 'LLP Name', required: true },
    { name: 'registration_number', label: 'Registration Number', required: true },
    { name: 'register_address', label: 'Registered Address', type: 'textarea' },
    { name: 'member_name', label: 'Member Name', required: true },
    { name: 'member_utr', label: 'Member UTR' },
    { name: 'trading_address', label: 'Trading Address', type: 'textarea' },
    { name: 'designated_members', label: 'Designated Members', type: 'textarea' },
    { name: 'primary_contact_email', label: 'Primary Contact Email', type: 'email', required: true },
    { name: 'primary_phone_number', label: 'Primary Phone Number', type: 'tel' },
    { name: 'corporation_tax_utr', label: 'Corporation Tax UTR' },
  ],
};

const contactFields: BusinessField[] = [
  { name: 'full_name', label: 'Full Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone_number', label: 'Phone Number', type: 'tel' },
  { name: 'full_address', label: 'Full Address', type: 'textarea' },
];

const secondaryContactFields: BusinessField[] = [
  { name: 'secondary_full_name', label: 'Full Name' },
  { name: 'secondary_email', label: 'Email', type: 'email' },
  { name: 'secondary_phone_number', label: 'Mobile', type: 'tel' },
];

const preferenceFields: BusinessField[] = [
  { name: 'invoice_prefix', label: 'Invoice Prefix' },
  { name: 'quote_number_format', label: 'Quote Number Format' },
  { name: 'invoice_number_format', label: 'Invoice Number Format' },
  {
    name: 'currency',
    label: 'Currency',
    type: 'select',
    options: [
      { value: 'GBP', label: 'GBP - British Pound' },
    ],
  },
  {
    name: 'tax_display',
    label: 'Tax Display',
    type: 'select',
    options: [
      { value: 'Exclusive', label: 'Exclusive' },
      { value: 'Inclusive', label: 'Inclusive' },
    ],
  },
  { name: 'default_payment_terms', label: 'Default Payment Terms', type: 'number' },
];

const vatSchemeOptions = [
  { value: 'Standard_VAT', label: 'Standard VAT' },
  { value: 'Flat_Rate_VAT', label: 'Flat Rate VAT' },
  { value: 'Flat_Rate_Scheme', label: 'Flat Rate Scheme' },
];

const cisRoleOptions = [
  { value: 'Contractor', label: 'Contractor' },
  { value: 'Subcontractor', label: 'Subcontractor' },
  { value: 'Both', label: 'Both' },
];

const accountingMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Accrual', label: 'Accrual' },
];

const readOnlyBusinessFields = new Set([
  'id',
  'user',
  'owner',
  'usertype',
  'company_logo',
  'created_at',
  'updated_at',
]);

function getFieldValue(business: BusinessDetails | null, field: keyof BusinessDetails) {
  if (field === 'currency') return 'GBP';

  const value = business?.[field];
  return value === null || value === undefined ? '' : String(value);
}

function buildBusinessPayload(business: BusinessDetails): Partial<BusinessDetails> {
  const payload: Record<string, string | number | boolean | null | undefined> = {};

  Object.entries(business).forEach(([key, value]) => {
    if (!readOnlyBusinessFields.has(key)) {
      payload[key] = value as string | number | boolean | null | undefined;
    }
  });

  payload.currency = 'GBP';

  return payload as Partial<BusinessDetails>;
}

function getBusinessDisplayName(
  business: BusinessDetails | null,
  profile: UserProfile | null
) {
  return (
    business?.business_name ||
    business?.trading_name ||
    business?.company_name ||
    business?.partnership_name ||
    business?.llp_name ||
    business?.full_name ||
    profile?.full_name ||
    profile?.name ||
    profile?.email ||
    'Business'
  );
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'B';
}

function BusinessFieldInput({
  field,
  business,
  onChange,
}: {
  field: BusinessField;
  business: BusinessDetails | null;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}) {
  const id = String(field.name);
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const value = getFieldValue(business, field.name);

  return (
    <div className={field.type === 'textarea' ? 'md:col-span-2' : undefined}>
      <label
        htmlFor={id}
        className="block text-[12px] font-bold text-slate-800 mb-1.5"
      >
        {label}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className={`${inputClassName} resize-none`}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className={selectClassName}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={field.type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className={inputClassName}
        />
      )}
    </div>
  );
}

function BusinessFieldSection({
  title,
  fields,
  business,
  onChange,
}: {
  title: string;
  fields: BusinessField[];
  business: BusinessDetails | null;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-[15px] font-bold text-slate-900 mb-5">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <BusinessFieldInput
            key={String(field.name)}
            field={field}
            business={business}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-[#22d3ee]' : 'bg-slate-200'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full border border-slate-300 bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function formatBillingDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatBillingAmount(value?: string) {
  if (!value) return '-';

  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return value;

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
}

function getBillingStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (['paid', 'success', 'completed', 'active'].includes(normalized)) {
    return 'text-emerald-500';
  }

  if (['failed', 'cancelled', 'canceled', 'expired'].includes(normalized)) {
    return 'text-red-500';
  }

  if (['pending', 'processing'].includes(normalized)) {
    return 'text-amber-500';
  }

  return 'text-slate-500';
}

const loadingPlan: DisplayPlan = {
  name: 'Loading',
  subtitle: 'Fetching subscription details',
  price: '-',
  customers: '-',
  quotes: '-',
  teamMembers: '-',
};

const fallbackPlan: DisplayPlan = {
  name: 'No Active',
  subtitle: 'No active subscription found',
  price: '-',
  customers: '-',
  quotes: '-',
  teamMembers: '-',
};

function formatPlanPrice(price: string) {
  const amount = Number.parseFloat(price);

  if (Number.isNaN(amount)) {
    return price || '-';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPlanLimit(value: number | null | undefined) {
  if (value === undefined) return '-';
  if (value === null) return 'Unlimited';
  if (value === 0) return '0';

  return `Up to ${value.toLocaleString()}`;
}

function toDisplayPlan(plan: ApiPlan | undefined): DisplayPlan {
  if (!plan) {
    return fallbackPlan;
  }

  return {
    name: plan.name,
    subtitle: plan.description || plan.plan_type,
    price: formatPlanPrice(plan.price),
    customers: formatPlanLimit(plan.limits?.customers),
    quotes: formatPlanLimit(plan.limits?.quotes),
    teamMembers: formatPlanLimit(plan.limits?.team),
  };
}

function getCurrentPlan(plans: ApiPlan[]) {
  return toDisplayPlan(plans.find((plan) => plan.is_current_plan) || plans[0]);
}

function cleanAccountSettingsWalletUrl() {
  window.history.replaceState(
    null,
    '',
    '/dashboard/account-settings?tab=wallet'
  );
}

export default function AccountSettings() {
  const { data: session } = useSession();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoSaving, setIsLogoSaving] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [billingHistory, setBillingHistory] = useState<BillingInfo[]>([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const [billingHistoryError, setBillingHistoryError] = useState('');
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [notificationSettingsLoading, setNotificationSettingsLoading] =
    useState(true);
  const [notificationSettingsError, setNotificationSettingsError] =
    useState('');
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');

  const currentPlan = plansLoading ? loadingPlan : getCurrentPlan(plans);
  const [timezone, setTimezone] = useState('Europe/London');
  const [dateFormat, setDateFormat] = useState('');
  const [currency, setCurrency] = useState('GBP');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (typeof window === 'undefined') return;

    window.history.replaceState(
      null,
      '',
      tab === 'wallet'
        ? '/dashboard/account-settings?tab=wallet'
        : '/dashboard/account-settings'
    );
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      if (userProfile.usertype) {
        const businessData = await getBusinessDetails(userProfile.usertype);
        setBusiness({ ...businessData, currency: 'GBP' });
      }
    } catch (error) {
      console.error('Error fetching account settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const stripeStatus = params.get('stripe_status');

    if (tab === 'wallet' || stripeStatus) {
      setActiveTab('wallet');
    }

    if (stripeStatus === 'success') {
      cleanAccountSettingsWalletUrl();
      void showSuccess('Stripe account onboarding completed.');
    } else if (stripeStatus === 'failed') {
      cleanAccountSettingsWalletUrl();
      void showError('Stripe account onboarding was not completed.');
    } else if (tab === 'wallet') {
      cleanAccountSettingsWalletUrl();
    }
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session?.accessToken, fetchData]);

  useEffect(() => {
    if (!session?.accessToken) {
      setPlansLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError('');
        const data = await getPlans();

        if (isMounted) {
          setPlans(Array.isArray(data.results) ? data.results : []);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        if (isMounted) {
          setPlans([]);
          setPlansError('Failed to load plan details');
        }
      } finally {
        if (isMounted) {
          setPlansLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      setBillingHistoryLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBillingHistory = async () => {
      try {
        setBillingHistoryLoading(true);
        setBillingHistoryError('');
        const data = await getBillingHistory();

        if (isMounted) {
          setBillingHistory(Array.isArray(data.results) ? data.results : []);
        }
      } catch (error) {
        console.error('Error fetching billing history:', error);
        if (isMounted) {
          setBillingHistoryError('Failed to load billing history');
          setBillingHistory([]);
        }
      } finally {
        if (isMounted) {
          setBillingHistoryLoading(false);
        }
      }
    };

    fetchBillingHistory();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      setNotificationSettingsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchNotificationSettings = async () => {
      try {
        setNotificationSettingsLoading(true);
        setNotificationSettingsError('');
        const data = await getNotificationSettings();

        if (isMounted) {
          setNotificationSettings(data);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        if (isMounted) {
          setNotificationSettingsError('Failed to load notification settings');
          setNotificationSettings(null);
        }
      } finally {
        if (isMounted) {
          setNotificationSettingsLoading(false);
        }
      }
    };

    fetchNotificationSettings();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  const handleSaveNotificationSettings = async () => {
    if (!notificationSettings) return;

    try {
      setIsSaving(true);
      setNotificationSettingsError('');
      const updatedSettings = await updateNotificationSettings({
        quote_accept: notificationSettings.quote_accept,
        quote_reject: notificationSettings.quote_reject,
        new_customer: notificationSettings.new_customer,
      });
      setNotificationSettings(updatedSettings ?? notificationSettings);
      await showSuccess('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setNotificationSettingsError('Failed to save notification settings');
      await showError('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'notifications') {
      await handleSaveNotificationSettings();
      return;
    }

    if (!profile || !business) return;

    try {
      setIsSaving(true);
      const updatedBusiness = await updateBusinessDetails(
        profile.usertype,
        buildBusinessPayload(business)
      );
      setBusiness({ ...updatedBusiness, currency: 'GBP' });
      await showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      await showError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetLogoSelection = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl('');

    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleLogoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetLogoSelection();
      return;
    }

    if (!file.type.startsWith('image/')) {
      resetLogoSelection();
      await showError('Please choose an image file.');
      return;
    }

    setSelectedLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreviewUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpdate = async () => {
    if (!profile || !selectedLogoFile) return;

    try {
      setIsLogoSaving(true);
      const updatedBusiness = await updateBusinessLogo(
        profile.usertype,
        selectedLogoFile
      );
      setBusiness({ ...updatedBusiness, currency: 'GBP' });
      resetLogoSelection();
      await showSuccess('Company logo updated successfully!');
    } catch (error) {
      console.error('Error updating company logo:', error);
      await showError('Failed to update company logo');
    } finally {
      setIsLogoSaving(false);
    }
  };

  const handleNotificationToggle = (
    key: NotificationSettingKey,
    checked: boolean
  ) => {
    setNotificationSettings((prev) =>
      prev ? { ...prev, [key]: checked } : prev
    );
  };

  const handleBusinessToggle = (field: BusinessToggleField, checked: boolean) => {
    setBusiness((prev) => (prev ? { ...prev, [field]: checked } : prev));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBusiness(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
    });
  };

  const businessTypeKey = getBusinessTypeKey(profile?.usertype || business?.usertype);
  const businessTypeLabel = getBusinessTypeLabel(profile?.usertype || business?.usertype);
  const businessDisplayName = getBusinessDisplayName(business, profile);
  const businessInitial = getInitial(businessDisplayName);
  const logoSrc = logoPreviewUrl || business?.company_logo || '';
  const supportsVatScheme =
    businessTypeKey === 'sole_trade' || businessTypeKey === 'partnership';
  const supportsPaye =
    businessTypeKey === 'limited_company' || businessTypeKey === 'llp';
  const showLegacyBusinessSettings = false;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {activeTab === 'team' ? (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Team Management</h1>
            <p className="text-slate-500 text-sm">Manage your team members and contractors</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#22d3ee] rounded-xl flex items-center justify-center text-white shadow-sm">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Account Settings</h1>
              <p className="text-slate-500 text-sm">Manage your business account and preferences</p>
            </div>
          </div>
        )}
        
       
        
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#f4f6f8] rounded-lg p-1.5 mb-8 w-fit">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Business Profile
        </button>
        <button
          onClick={() => handleTabChange('tax')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'tax'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Tax
        </button>
        <button
          onClick={() => handleTabChange('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'billing'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing
        </button>
        <button
          onClick={() => handleTabChange('wallet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'wallet'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Wallet
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
        <button
          onClick={() => handleTabChange('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors ${
            activeTab === 'team'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Management
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6" aria-label="Loading business profile">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 h-4 w-36 rounded bg-slate-200" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }, (_, fieldIndex) => (
                      <div key={fieldIndex}>
                        <div className="mb-2 h-3 w-24 rounded bg-slate-100" />
                        <div className="h-10 rounded-lg bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : !business ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-sm text-slate-500">
              No business details found for {businessTypeLabel}.
            </div>
          ) : (
            <>
              <BusinessFieldSection
                title={`${businessTypeLabel} Details`}
                fields={businessDetailFields[businessTypeKey]}
                business={business}
                onChange={handleInputChange}
              />

              <BusinessFieldSection
                title="Primary Contact"
                fields={contactFields}
                business={business}
                onChange={handleInputChange}
              />

              <BusinessFieldSection
                title="Secondary Contact"
                fields={secondaryContactFields}
                business={business}
                onChange={handleInputChange}
              />

              <BusinessFieldSection
                title="Preferences & Branding"
                fields={preferenceFields}
                business={business}
                onChange={handleInputChange}
              />

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={`${businessDisplayName} logo`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-[#22d3ee]">
                          {businessInitial}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-[15px] font-bold text-slate-900">
                        Company Logo
                      </h2>
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {businessDisplayName}
                      </p>
                      <p className="text-xs text-slate-500">{businessTypeLabel}</p>
                      {business.company_logo && (
                        <a
                          href={business.company_logo}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-bold text-[#22d3ee] hover:text-[#06b6d4]"
                        >
                          View current logo
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isLogoSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-cyan-200 hover:text-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Logo
                    </button>
                    <button
                      type="button"
                      onClick={handleLogoUpdate}
                      disabled={!selectedLogoFile || isLogoSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isLogoSaving ? 'Updating...' : 'Update Logo'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showLegacyBusinessSettings && activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Business Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Business Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Trading Name *</label>
                <input
                  type="text"
                  name="trading_name"
                  value={business?.trading_name || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Trading Address *</label>
                <input
                  type="text"
                  name="trading_address"
                  value={business?.trading_address || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Contact Information</h2>
            
            <div className="mb-6">
              <h3 className="text-[13px] font-bold text-slate-800 mb-3">Primary Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="contact_name"
                  value={business?.contact_name || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
                <input
                  type="email"
                  name="contact_email"
                  value={business?.contact_email || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
                <input
                  type="tel"
                  name="contact_phone"
                  value={business?.contact_phone || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-bold text-slate-800 mb-3">Secondary Contact (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="secondary_contact_name"
                  value={business?.secondary_contact_name || ''}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
                <input
                  type="email"
                  name="secondary_contact_email"
                  value={business?.secondary_contact_email || ''}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
                <input
                  type="tel"
                  name="secondary_contact_phone"
                  value={business?.secondary_contact_phone || ''}
                  onChange={handleInputChange}
                  placeholder="Mobile"
                  className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Account Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <SettingsIcon className="w-5 h-5 text-[#22d3ee]" />
              <h2 className="text-[15px] font-bold text-slate-900">Account Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 cursor-pointer"
                >
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                  <option value="Europe/Madrid">Europe/Madrid (CET/CEST)</option>
                  <option value="Europe/Amsterdam">Europe/Amsterdam (CET/CEST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                  <option value="America/Denver">America/Denver (MST/MDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Date Format</label>
                <input
                  type="date"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400 cursor-pointer"
                >
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5">Data Management</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                <Download className="w-4 h-4 text-slate-400" />
                Export All Data (CSV)
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                <Download className="w-4 h-4 text-slate-400" />
                Export All Data (JSON)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="space-y-6">
          {!business ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-sm text-slate-500">
              No tax details found for {businessTypeLabel}.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-[15px] font-bold text-slate-900">VAT Registration</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">VAT Registered</p>
                      <p className="text-[12px] text-slate-500">Is this business registered for VAT?</p>
                    </div>
                    <ToggleSwitch
                      checked={Boolean(business.is_vat_registered)}
                      disabled={isSaving}
                      label="VAT registered"
                      onChange={(checked) =>
                        handleBusinessToggle('is_vat_registered', checked)
                      }
                    />
                  </div>

                  {business.is_vat_registered && supportsVatScheme && (
                    <BusinessFieldInput
                      field={{
                        name: 'vat_scheme',
                        label: 'VAT Scheme',
                        type: 'select',
                        options: vatSchemeOptions,
                      }}
                      business={business}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-[15px] font-bold text-slate-900">CIS Registration</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">CIS Registered</p>
                      <p className="text-[12px] text-slate-500">Registered under the Construction Industry Scheme</p>
                    </div>
                    <ToggleSwitch
                      checked={Boolean(business.is_cis_registered)}
                      disabled={isSaving}
                      label="CIS registered"
                      onChange={(checked) =>
                        handleBusinessToggle('is_cis_registered', checked)
                      }
                    />
                  </div>

                  {business.is_cis_registered && (
                    <BusinessFieldInput
                      field={{
                        name: 'cis_role',
                        label: 'CIS Role',
                        type: 'select',
                        options: cisRoleOptions,
                      }}
                      business={business}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              {supportsPaye && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-purple-500" />
                    <h2 className="text-[15px] font-bold text-slate-900">PAYE Registration</h2>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">PAYE Registered</p>
                      <p className="text-[12px] text-slate-500">Does this business operate PAYE for employees?</p>
                    </div>
                    <ToggleSwitch
                      checked={Boolean(business.is_paye_registered)}
                      disabled={isSaving}
                      label="PAYE registered"
                      onChange={(checked) =>
                        handleBusinessToggle('is_paye_registered', checked)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-[15px] font-bold text-slate-900 mb-5">Accounting</h2>
                <BusinessFieldInput
                  field={{
                    name: 'accounting_method',
                    label: 'Accounting Method',
                    type: 'select',
                    options: accountingMethodOptions,
                  }}
                  business={business}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
        </div>
      )}

      {showLegacyBusinessSettings && activeTab === 'tax' && (
        <div className="space-y-6">
          {/* VAT Registration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-[15px] font-bold text-slate-900">VAT Registration</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
                <div>
                  <p className="text-[13px] font-bold text-slate-900">VAT Registered</p>
                  <p className="text-[12px] text-slate-500">Is your business registered for VAT?</p>
                </div>
                <ToggleSwitch
                  checked={Boolean(business?.is_vat_registered)}
                  disabled={!business || isSaving}
                  label="VAT registered"
                  onChange={(checked) =>
                    handleBusinessToggle('is_vat_registered', checked)
                  }
                />
              </div>

              {business?.is_vat_registered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label htmlFor="vat_number" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                      VAT Number *
                    </label>
                    <input
                      type="text"
                      id="vat_number"
                      name="vat_number"
                      value={business?.vat_number || ''}
                      onChange={handleInputChange}
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500">UK VAT format: GB followed by 9 digits</p>
                  </div>
                  <div>
                    <label htmlFor="vat_rate" className="block text-[12px] font-bold text-slate-800 mb-1.5">
                      Default VAT Rate (%) *
                    </label>
                    <input
                      type="text"
                      id="vat_rate"
                      name="vat_rate"
                      value={business?.vat_rate || ''}
                      onChange={handleInputChange}
                      className="w-full bg-[#f4f6f8] border-0 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500">Standard UK VAT rate is 20%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CIS Registration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-[15px] font-bold text-slate-900">CIS Registration</h2>
            </div>
            
            <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
              <div>
                <p className="text-[13px] font-bold text-slate-900">CIS Registered</p>
                <p className="text-[12px] text-slate-500">Registered under the Construction Industry Scheme</p>
              </div>
              <ToggleSwitch
                checked={Boolean(business?.is_cis_registered)}
                disabled={!business || isSaving}
                label="CIS registered"
                onChange={(checked) =>
                  handleBusinessToggle('is_cis_registered', checked)
                }
              />
            </div>
          </div>

          {/* PAYE Registration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-[15px] font-bold text-slate-900">PAYE Registration</h2>
            </div>
            
            <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
              <div>
                <p className="text-[13px] font-bold text-slate-900">PAYE Registered</p>
                <p className="text-[12px] text-slate-500">Do you operate PAYE for employees?</p>
              </div>
              <ToggleSwitch
                checked={Boolean(business?.is_paye_registered)}
                disabled={!business || isSaving}
                label="PAYE registered"
                onChange={(checked) =>
                  handleBusinessToggle('is_paye_registered', checked)
                }
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Subscription */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <h2 className="text-[15px] font-bold text-slate-900">Current Subscription</h2>
            </div>

            {plansError && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
                {plansError}
              </div>
            )}
            
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-[#0284c7]" />
                    <h3 className="text-xl font-bold text-slate-900">{currentPlan.name} Plan</h3>
                  </div>
                  <p className="text-sm text-slate-500">{currentPlan.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{currentPlan.price}</div>
                  <p className="text-xs text-slate-500">per month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                  <p className="text-[12px] text-slate-500 mb-1">Team Members</p>
                  <p className="text-[15px] font-bold text-slate-900">{currentPlan.teamMembers}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                  <p className="text-[12px] text-slate-500 mb-1">Customers</p>
                  <p className="text-[15px] font-bold text-slate-900">{currentPlan.customers}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                  <p className="text-[12px] text-slate-500 mb-1">Quotes/Month</p>
                  <p className="text-[15px] font-bold text-slate-900">{currentPlan.quotes}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/account-settings/plans"
                className="px-5 py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Upgrade Plan
              </Link>
              <Link
                href="/dashboard/account-settings/plans"
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                View All Plans
              </Link>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-slate-900 mb-6">Billing History</h2>
            
            <div className="space-y-3">
              {billingHistoryError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
                  {billingHistoryError}
                </div>
              )}

              {billingHistoryLoading ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                  Loading billing history...
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                  No billing history found
                </div>
              ) : (
                billingHistory.map((invoice) => (
                  <div key={invoice.invoice_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-[14px] font-bold text-slate-900 mb-0.5">{invoice.invoice_id}</p>
                      <p className="text-[12px] text-slate-500">
                        {invoice.plan_name} - {formatBillingDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-slate-900 mb-0.5">{formatBillingAmount(invoice.amount)}</p>
                        <p className={`text-[12px] font-medium ${getBillingStatusClassName(invoice.status)}`}>{invoice.status}</p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="p-2 text-slate-300 cursor-not-allowed"
                        aria-label={`Download invoice ${invoice.invoice_id}`}
                        title="Download endpoint is not available yet"
                      >
                        {/* <Download className="w-4 h-4" /> */}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && <WalletTab />}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-cyan-500" />
              <h2 className="text-[15px] font-bold text-slate-900">Email Notifications</h2>
            </div>
            
            <div className="space-y-3">
              {notificationSettingsError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
                  {notificationSettingsError}
                </div>
              )}

              {notificationSettingsLoading ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                  Loading notification settings...
                </div>
              ) : !notificationSettings ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                  No notification settings found
                </div>
              ) : (
                notificationRows.map((item) => (
                  <div key={item.key} className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg">
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                      <p className="text-[12px] text-slate-500">{item.description}</p>
                    </div>
                    <ToggleSwitch
                      checked={Boolean(notificationSettings?.[item.key])}
                      disabled={isSaving}
                      label={item.title}
                      onChange={(checked) =>
                        handleNotificationToggle(item.key, checked)
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <CollaboratorList />
      )}

      {/* Fixed Footer Action */}
      {(activeTab === 'profile' ||
  activeTab === 'tax' ||
  activeTab === 'notifications') && (
  <div
    className="
      fixed bottom-0
      left-0 md:left-64
      right-0
      p-4 sm:p-6
      bg-white/80
      backdrop-blur-md
      border-t border-slate-200
      flex justify-center sm:justify-end
      z-10
    "
  >
    <button
      onClick={handleSave}
      disabled={
        isSaving ||
        loading ||
        ((activeTab === 'profile' || activeTab === 'tax') && !business) ||
        (activeTab === 'notifications' && !notificationSettings)
      }
      className="
        flex items-center justify-center gap-2
        w-full sm:w-auto
        max-w-full
        px-4 sm:px-6
        py-2.5
        bg-[#22d3ee] hover:bg-[#06b6d4]
        text-white
        rounded-lg
        text-xs sm:text-sm
        font-bold
        transition-colors
        shadow-sm
        disabled:bg-slate-300
        disabled:cursor-not-allowed
        whitespace-normal
        text-center
      "
    >
      {isSaving ? (
        "Saving..."
      ) : (
        <>
          <Save className="w-4 h-4 flex-shrink-0" />
          <span>
            {activeTab === "tax"
              ? "Save Tax Settings"
              : activeTab === "notifications"
              ? "Save Notification Preferences"
              : "Save Business Profile"}
          </span>
        </>
      )}
    </button>
  </div>
)}

    </div>
  );
}

