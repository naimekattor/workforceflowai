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

export interface BillingVatRateResponse {
  vat_rate: number;
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
  return_url?: string;
}

export interface StripeConnectOnboardingLinkResponse {
  url: string;
  expires_at: string;
}

export interface StripeConnectAccountSummary {
  id: number;
  display_name: string;
  account_health: string;
  is_primary: boolean;
  is_current_plan: boolean;
  onboarding_complete: boolean;
  is_connected: boolean;
  is_ready_for_payments: boolean;
  can_receive_payouts: boolean;
  created_at: string;
  updated_at: string;
}

export interface StripeConnectAccountsResponse {
  count: number;
  accounts: StripeConnectAccountSummary[];
}

export interface StripeConnectAccountActionPayload {
  account_id: number;
}

export interface StripeConnectWalletResponse {
  wallet?: {
    available?: string | number;
    pending?: string | number;
    total?: string | number;
    currency?: string;
  };
  balance?: string | number;
  available?: string | number;
  available_balance?: string | number;
  pending?: string | number;
  pending_balance?: string | number;
  currency?: string;
  can_withdraw?: boolean;
  withdraw_status?: string;
  error?: string;
  detail?: string;
}

export interface StripeConnectPayoutPayload {
  payout_amount: string;
}

export interface StripeConnectActionResponse {
  detail?: string;
  error?: string;
  message?: string;
}

export const getBillingHistory = async (): Promise<BillingHistoryResponse> => {
  const response = await apiClient.get<BillingHistoryResponse>(
    "/api/billing/history/"
  );
  return response.data;
};

export const getBillingVatRate = async (): Promise<BillingVatRateResponse> => {
  const response = await apiClient.get<BillingVatRateResponse>(
    "/api/billing/vat-rate/"
  );
  return response.data;
};

export const getStripeConnectAccounts =
  async (): Promise<StripeConnectAccountsResponse> => {
    const response = await apiClient.get<StripeConnectAccountsResponse>(
      "/api/billing/stripe/connect/accounts-list/"
    );
    return response.data;
  };

export const deleteStripeConnectAccount = async (
  accountId: number
): Promise<void> => {
  await apiClient.delete(`/api/billing/stripe/connect/accounts/${accountId}/`);
};

export const setPrimaryStripeConnectAccount = async (
  accountId: number
): Promise<StripeConnectActionResponse> => {
  const response = await apiClient.post<StripeConnectActionResponse>(
    "/api/billing/stripe/connect/set-primary/",
    { account_id: accountId }
  );
  return response.data;
};

export const turnActiveStripeConnectAccount = async (
  accountId: number
): Promise<StripeConnectActionResponse> => {
  const response = await apiClient.post<StripeConnectActionResponse>(
    "/api/billing/stripe/connect/turn-active/",
    { account_id: accountId }
  );
  return response.data;
};

export const getStripeConnectWallet =
  async (): Promise<StripeConnectWalletResponse> => {
    const response = await apiClient.get<StripeConnectWalletResponse>(
      "/api/billing/stripe/connect/wallet/"
    );
    return response.data;
  };

export const requestStripeConnectPayout = async (
  payoutAmount: string
): Promise<StripeConnectActionResponse> => {
  const response = await apiClient.post<StripeConnectActionResponse>(
    "/api/billing/stripe/connect/payout/",
    { payout_amount: payoutAmount }
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
