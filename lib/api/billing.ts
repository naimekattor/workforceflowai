import apiClient from "./axios";

export interface BillingInfo {
  invoice_id: string;
  created_at: string;
  plan_name: string;
  amount: string;
  status: string;
}

export interface BillingHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BillingInfo[];
}

export interface StripeConnectAccount {
  id: number;
  stripe_account_id: string;
  account_type: string;
  status: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_link: string | null;
  onboarding_link_expires_at: string | null;
  onboarding_completed_at: string | null;
  last_event_id: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface StripeConnectOnboardingLinkPayload {
  refresh_url: string;
}

export interface StripeConnectOnboardingLinkResponse {
  url: string;
  expires_at: string;
}

export const getBillingHistory = async (): Promise<BillingHistoryResponse> => {
  const response = await apiClient.get<BillingHistoryResponse>(
    "/api/billing/history/"
  );
  return response.data;
};

export const createStripeConnectAccount =
  async (): Promise<StripeConnectAccount> => {
    const response = await apiClient.post<StripeConnectAccount>(
      "/api/billing/stripe/connect/account/"
    );
    return response.data;
  };

export const createStripeConnectOnboardingLink = async (
  payload: StripeConnectOnboardingLinkPayload
): Promise<StripeConnectOnboardingLinkResponse> => {
  const response = await apiClient.post<StripeConnectOnboardingLinkResponse>(
    "/api/billing/stripe/connect/onboarding-link/",
    payload
  );
  return response.data;
};
