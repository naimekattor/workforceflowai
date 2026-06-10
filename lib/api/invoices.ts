import apiClient from "./axios";

export interface Invoice {
  id: number;
  owner: number;
  customer: number;
  customer_name?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  price: string;
  status: string;
  invoice_uuid: string;
}

export interface InvoiceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
}

export const getInvoices = async (page = 1, search?: string): Promise<InvoiceListResponse> => {
  const response = await apiClient.get<InvoiceListResponse>("/api/invoice/list/", {
    params: { page, search }
  });
  return response.data;
};

export const getInvoiceDetail = async (id: number | string): Promise<unknown> => {
  const response = await apiClient.get(`/api/invoice/detail/${id}/`);
  return response.data;
};
