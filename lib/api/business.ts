import apiClient from "./axios";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  usertype: string;
}

export interface BusinessDetails {
  id: number;
  owner: number;
  trading_name: string;
  trading_address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  secondary_contact_name?: string;
  secondary_contact_email?: string;
  secondary_contact_phone?: string;
  is_vat_registered: boolean;
  vat_number?: string;
  vat_rate?: string;
  is_cis_registered: boolean;
  is_paye_registered: boolean;
  // Additional fields for specific types
  utr_number?: string;
  national_insurance_number?: string;
  company_registration_number?: string;
  partnership_utr_number?: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>("/api/auth/profile/");
  return response.data;
};

const getBusinessEndpoint = (usertype: string) => {
  switch (usertype) {
    case 'Sole Trade': return '/api/business-details/sole-trade/';
    case 'Limited Company': return '/api/business-details/limited-company/';
    case 'Ordinary Partnership': return '/api/business-details/ordinary-partnership/';
    case 'Limited Liability Partnership': return '/api/business-details/limited-liability-partnership/';
    default: return '/api/business-details/sole-trade/';
  }
};

export const getBusinessDetails = async (usertype: string): Promise<BusinessDetails> => {
  const endpoint = getBusinessEndpoint(usertype);
  const response = await apiClient.get<BusinessDetails[]>(endpoint);
  // Usually returns an array with one item for the logged in user
  return response.data[0];
};

export const updateBusinessDetails = async (usertype: string, id: number, data: Partial<BusinessDetails>): Promise<BusinessDetails> => {
  const endpoint = `${getBusinessEndpoint(usertype)}${id}/`;
  const response = await apiClient.patch<BusinessDetails>(endpoint, data);
  return response.data;
};
