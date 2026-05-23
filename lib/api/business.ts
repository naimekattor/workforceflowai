import { isAxiosError } from "axios";
import apiClient from "./axios";

export type BusinessTypeKey =
  | "sole_trade"
  | "limited_company"
  | "partnership"
  | "llp";

export interface UserProfile {
  id: number;
  email: string;
  name?: string;
  full_name?: string;
  usertype: string | null;
}

export interface BusinessDetails {
  id?: number;
  user?: number;
  owner?: number;
  usertype?: string;
  created_at?: string;
  updated_at?: string;

  business_name?: string | null;
  trading_name?: string | null;
  date_business_started?: string | null;
  business_address?: string | null;
  utr?: string | null;
  National_insurance_number?: string | null;
  industry?: string | null;

  company_name?: string | null;
  registration_number?: string | null;
  date_of_incorporation?: string | null;
  company_address?: string | null;
  trading_address?: string | null;
  directors?: string | null;
  primary_contact_email?: string | null;
  primary_phone_number?: string | null;
  corporation_tax_utr?: string | null;

  partnership_name?: string | null;
  date_started?: string | null;
  date_partnership_started?: string | null;
  partnership_address?: string | null;
  partner_name?: string | null;
  partner_utr?: string | null;
  partnership_utr?: string | null;

  llp_name?: string | null;
  register_address?: string | null;
  member_name?: string | null;
  member_utr?: string | null;
  designated_members?: string | null;

  is_vat_registered?: boolean;
  is_cis_registered?: boolean;
  is_paye_registered?: boolean;
  vat_scheme?: string | null;
  cis_role?: string | null;
  accounting_method?: string | null;

  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  full_address?: string | null;
  secondary_full_name?: string | null;
  secondary_email?: string | null;
  secondary_phone_number?: string | null;

  company_logo?: string | null;
  invoice_prefix?: string | null;
  quote_number_format?: string | null;
  invoice_number_format?: string | null;
  currency?: string | null;
  tax_display?: string | null;
  default_payment_terms?: number | string | null;

  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  secondary_contact_name?: string | null;
  secondary_contact_email?: string | null;
  secondary_contact_phone?: string | null;
  vat_number?: string | null;
  vat_rate?: string | null;
}

type BusinessDetailsResponse = BusinessDetails | BusinessDetails[];

const BUSINESS_ENDPOINTS: Record<BusinessTypeKey, string> = {
  sole_trade: "/api/Details-sole-trade-business/update/",
  limited_company: "/api/Details-limited-company/update/",
  partnership: "/api/Details-partner/update/",
  llp: "/api/Details-limited-liability-partnership/update/",
};

export function getBusinessTypeKey(usertype?: string | null): BusinessTypeKey {
  const normalized = (usertype || "").trim().toLowerCase();

  if (["ltd", "lc", "limited company", "limited_company"].includes(normalized)) {
    return "limited_company";
  }

  if (
    [
      "pt",
      "partner",
      "partnership",
      "ordinary partnership",
      "ordinary_partnership",
    ].includes(normalized)
  ) {
    return "partnership";
  }

  if (
    [
      "llp",
      "limited liability partnership",
      "limited_liability_partnership",
    ].includes(normalized)
  ) {
    return "llp";
  }

  return "sole_trade";
}

export function getBusinessTypeLabel(usertype?: string | null): string {
  const typeKey = getBusinessTypeKey(usertype);

  if (typeKey === "limited_company") return "Limited Company";
  if (typeKey === "partnership") return "Partnership";
  if (typeKey === "llp") return "Limited Liability Partnership";

  return "Sole Trade";
}

export function getBusinessDetailsEndpoint(usertype?: string | null): string {
  return BUSINESS_ENDPOINTS[getBusinessTypeKey(usertype)];
}

function normalizeBusinessDetails(data: BusinessDetailsResponse): BusinessDetails | null {
  return Array.isArray(data) ? data[0] ?? null : data;
}

async function getWithFallback<T>(endpoints: string[]): Promise<T> {
  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    } catch (error) {
      const shouldTryNextEndpoint =
        isAxiosError(error) && error.response?.status === 404;

      if (!shouldTryNextEndpoint || endpoint === endpoints.at(-1)) {
        throw error;
      }
    }
  }

  throw new Error("Unable to load data.");
}

export const getUserProfile = async (): Promise<UserProfile> => {
  return getWithFallback<UserProfile>(["/api/auth/profile/", "/auth/profile/"]);
};

export const getBusinessDetails = async (
  usertype: string | null
): Promise<BusinessDetails | null> => {
  const endpoint = getBusinessDetailsEndpoint(usertype);
  const response = await apiClient.get<BusinessDetailsResponse>(endpoint);
  return normalizeBusinessDetails(response.data);
};

export const updateBusinessDetails = async (
  usertype: string | null,
  data: Partial<BusinessDetails>
): Promise<BusinessDetails> => {
  const endpoint = getBusinessDetailsEndpoint(usertype);
  const response = await apiClient.patch<BusinessDetails>(endpoint, data);
  return response.data;
};
