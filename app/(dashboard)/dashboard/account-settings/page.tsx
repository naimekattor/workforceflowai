'use client';

import React, { useEffect, useState } from 'react';
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
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  getUserProfile,
  getBusinessDetails,
  updateBusinessDetails,
  getBusinessTypeKey,
  getBusinessTypeLabel,
  BusinessDetails,
  BusinessTypeKey,
  UserProfile,
} from '@/lib/api/business';
import CollaboratorList from '@/components/dashboard/CollaboratorList';
import { BillingInfo, getBillingHistory } from '@/lib/api/billing';
import { NotificationSettings, getNotificationSettings, updateNotificationSettings } from '@/lib/api/notifications';

type Plan = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  customers: string;
  quotes: string;
  teamMembers: string;
  features: string[];
  popular?: boolean;
};

type BusinessToggleField =
  | 'is_vat_registered'
  | 'is_cis_registered'
  | 'is_paye_registered';

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For growing trade teams',
    price: '£29',
    customers: 'Up to 500',
    quotes: 'Unlimited',
    teamMembers: 'Up to 5',
    features: [],
  },
];

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
      { value: 'USD', label: 'USD - US Dollar' },
      { value: 'EUR', label: 'EUR - Euro' },
      { value: 'CAD', label: 'CAD - Canadian Dollar' },
      { value: 'AUD', label: 'AUD - Australian Dollar' },
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

  return payload as Partial<BusinessDetails>;
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

export default function AccountSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingInfo[]>([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(true);
  const [billingHistoryError, setBillingHistoryError] = useState('');
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [notificationSettingsLoading, setNotificationSettingsLoading] =
    useState(true);
  const [notificationSettingsError, setNotificationSettingsError] =
    useState('');

  const [currentPlanId] = useState('starter');
  const currentPlan = plans.find((plan) => plan.id === currentPlanId) || plans[0];
  const [timezone, setTimezone] = useState('Europe/London');
  const [dateFormat, setDateFormat] = useState('');
  const [currency, setCurrency] = useState('GBP');

  const fetchData = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      if (userProfile.usertype) {
        const businessData = await getBusinessDetails(userProfile.usertype);
        setBusiness(businessData);
      }
    } catch (error) {
      console.error('Error fetching account settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

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
      setNotificationSettings(updatedSettings);
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setNotificationSettingsError('Failed to save notification settings');
      alert('Failed to save notification settings');
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
      setBusiness(updatedBusiness);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
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
  const supportsVatScheme =
    businessTypeKey === 'sole_trade' || businessTypeKey === 'partnership';
  const supportsPaye =
    businessTypeKey === 'limited_company' || businessTypeKey === 'llp';
  const showLegacyBusinessSettings = false;

  if (loading) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-slate-500">Loading settings...</div>;
  }

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
        
        {activeTab === 'team' ? (
          <Link href="/dashboard/account-settings/team/new" className="flex items-center gap-2 bg-[#22d3ee] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#06b6d4] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Team Member
          </Link>
        ) : (
          <button className="flex items-center gap-2 bg-[#e0f2fe] text-[#0284c7] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#bae6fd] transition-colors">
            <Crown className="w-4 h-4" />
            {/* {currentPlan.name} */}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#f4f6f8] rounded-lg p-1.5 mb-8 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
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
          onClick={() => setActiveTab('tax')}
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
          onClick={() => setActiveTab('billing')}
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
          onClick={() => setActiveTab('notifications')}
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
          onClick={() => setActiveTab('team')}
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
          {!business ? (
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

              {business.company_logo && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-[15px] font-bold text-slate-900 mb-3">Company Logo</h2>
                  <a
                    href={business.company_logo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#22d3ee] hover:text-[#06b6d4]"
                  >
                    View current logo
                  </a>
                </div>
              )}
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
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="CHF">CHF (Fr) - Swiss Franc</option>
                  <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  <option value="HKD">HKD (HK$) - Hong Kong Dollar</option>
                  <option value="AED">AED (د.إ) - UAE Dirham</option>
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
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
        <CollaboratorList showAddButton={false} />
      )}

      {/* Fixed Footer Action */}
      {(activeTab === 'profile' || activeTab === 'tax' || activeTab === 'notifications') && (
        <div className="fixed bottom-0 left-64 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end z-10">
          <button 
            onClick={handleSave}
            disabled={isSaving || (activeTab === 'notifications' && !notificationSettings)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:bg-slate-300"
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                {activeTab === 'tax' ? 'Save Tax Settings' : activeTab === 'notifications' ? 'Save Notification Preferences' : 'Save Business Profile'}
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

