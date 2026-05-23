import apiClient from "./axios";

export interface DashboardStats {
  total_customers: number;
  active_jobs: number;
  quote_awating_response: number;
  quote_accepted: number;
  invoice_created: number;
}

export interface RecentQuote {
  id: number;
  quote_uuid: string;
  customer: number;
  quote_status: string;
  total_price: string | number;
  created_at: string;
}

export interface RecentInvoice {
  id: number;
  quote_uuid: string;
  invoice_number: string;
  customer: number;
  quote_status: string;
  total_price: string | number;
  created_at: string;
}

export interface RecentQuoteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecentQuote[];
}

export interface RecentInvoiceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecentInvoice[];
}

function normalizeListResponse<T>(
  data: T[] | { results?: T[] } | null | undefined
) {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.results) ? data.results : [];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>("/api/dashboard/stats/");
  return response.data;
};

export const getRecentQuotes = async (): Promise<RecentQuote[]> => {
  const response = await apiClient.get<RecentQuote[] | RecentQuoteListResponse>(
    "/api/dashboard/recent-quotes/"
  );
  return normalizeListResponse(response.data);
};

export const getRecentInvoices = async (): Promise<RecentInvoice[]> => {
  const response = await apiClient.get<
    RecentInvoice[] | RecentInvoiceListResponse
  >("/api/dashboard/recent-invoices/");
  return normalizeListResponse(response.data);
};
