import apiClient from "./axios";

export interface Quote {
  id: number;
  owner: number;
  owner_name?: string;
  customer: number;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  quote_status: string;
  quote_uuid: string;
  job_type: string;
  job_title?: string;
  job_details?: { id?: number; title?: string, site_address?: string, notes?: string, jobstatus?: string } | null;
  job_post?: number | null;
  quote_date: string;
  valid_until: string;
  deposit: string;
  payment_note?: string;
  payment_style?: 'Advance' | 'Split' | 'On_Completion' | null;
  split_percentage?: number | null;
  notes: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
  price?: string;
  total_price?: string;
}

export interface QuoteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Quote[];
}

export interface LineItem {
  id: number;
  quote: number;
  description: string;
  quantity: number;
  unit_price: string;
  vat_rate?: number;
  total_price: string;
}

export const getQuotes = async (page = 1): Promise<QuoteListResponse> => {
  const response = await apiClient.get<QuoteListResponse>(`/api/quote/list/?page=${page}`);
  return response.data;
};

export const createQuote = async (data: Partial<Quote>): Promise<Quote> => {
  const response = await apiClient.post<Quote>("/api/quote/create/", data);
  return response.data;
};

export const getQuote = async (id: number | string): Promise<Quote> => {
  const response = await apiClient.get<Quote>(`/api/quote/${id}/`);
  return response.data;
};

export const updateQuote = async (id: number, data: Partial<Quote>): Promise<Quote> => {
  const response = await apiClient.patch<Quote>(`/api/quote/${id}/`, data);
  return response.data;
};

export const deleteQuote = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/quote/${id}/`);
};

export const createLineItem = async (data: Partial<LineItem>): Promise<LineItem> => {
  const response = await apiClient.post<LineItem>("/api/line-item/create/", data);
  return response.data;
};

export const getLineItems = async (quoteId: number | string): Promise<LineItem[]> => {
  const response = await apiClient.get<LineItem[]>(`
/dashboard/quote/${quoteId}`);
  return response.data;
};

export const sendQuoteEmail = async (quoteId: number): Promise<{ success: string }> => {
  const response = await apiClient.post<{ success: string }>("/api/dashboard/quote/send-email/", { quote_id: quoteId });
  return response.data;
};

export const sendFullPaymentLink = async (quoteId: number): Promise<{ success: string }> => {
  const response = await apiClient.post<{ success: string }>(`/api/dashboard/get-full-payment/${quoteId}/`);
  return response.data;
};

export const getStripeCheckoutUrl = async (quoteId: number): Promise<{ checkout_url: string }> => {
  const response = await apiClient.post<{ checkout_url: string }>("/api/quote/checkout/", { quote_id: quoteId });
  return response.data;
};
