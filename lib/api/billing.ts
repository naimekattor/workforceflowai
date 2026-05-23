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

export const getBillingHistory = async (): Promise<BillingHistoryResponse> => {
  const response = await apiClient.get<BillingHistoryResponse>(
    "/api/billing/history/"
  );
  return response.data;
};
