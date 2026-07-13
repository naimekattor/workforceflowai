import axios from "axios";
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
  quote_number: string;
  customer: number;
  customer_name?: string;
  quote_status: string;
  price: string | number;
  created_at: string;
}

export interface RecentInvoice {
  id: number;
  quote_uuid: string;
  quote_number: string;
  company_name:string;
  invoice_number: string;
  customer: number;
  customer_name?: string;
  company_logo?: string | null;
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

interface CustomerListResponse {
  count: number;
  results?: unknown[];
}

interface JobListResponse {
  count: number;
  results?: { jobstatus?: string }[];
}

interface QuoteListResponse {
  count: number;
  results?: RecentQuote[];
}

interface InvoiceListItem {
  id: number;
  customer: number;
  customer_name?: string;
  company_logo?: string | null;
  company_name?: string;
  invoice_number?: string;
  invoice_uuid?: string;
  quote_uuid?: string;
  quote_number?: string;
  status?: string;
  quote_status?: string;
  price?: string | number;
  total_price?: string | number;
  issue_date?: string;
  created_at?: string;
}

interface InvoiceListResponse {
  count: number;
  results?: InvoiceListItem[];
}

function normalizeListResponse<T>(
  data: T[] | { results?: T[] } | null | undefined
) {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.results) ? data.results : [];
}

function isNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

async function getListCount(url: string): Promise<number> {
  const response = await apiClient.get<CustomerListResponse>(url);
  if (typeof response.data.count === "number") return response.data.count;
  return Array.isArray(response.data.results) ? response.data.results.length : 0;
}

function sortByCreatedAt<T extends { created_at?: string }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
  );
}

function toRecentInvoice(invoice: InvoiceListItem): RecentInvoice {
  return {
    id: invoice.id,
    quote_uuid: invoice.quote_uuid || invoice.invoice_uuid || "",
    quote_number: invoice.quote_number || "",
    invoice_number: invoice.invoice_number || `Invoice ${invoice.id}`,
    customer: invoice.customer,
    customer_name: invoice.customer_name,
    company_name: invoice.company_name || "Workforceflow AI",
    company_logo: invoice.company_logo,
    quote_status: invoice.quote_status || invoice.status || "",
    total_price: invoice.total_price ?? invoice.price ?? 0,
    created_at: invoice.created_at || invoice.issue_date || "",
  };
}

async function getFallbackDashboardStats(): Promise<DashboardStats> {
  const [customers, jobs, quotes, invoices] = await Promise.allSettled([
    getListCount("/api/customer/list/?page=1"),
    apiClient.get<JobListResponse>("/api/jobs/list/?page=1"),
    apiClient.get<QuoteListResponse>("/api/quote/list/?page=1"),
    getListCount("/api/invoice/list/?page=1"),
  ]);

  const quoteResults =
    quotes.status === "fulfilled" && Array.isArray(quotes.value.data.results)
      ? quotes.value.data.results
      : [];

  const jobResults =
    jobs.status === "fulfilled" && Array.isArray(jobs.value.data.results)
      ? jobs.value.data.results
      : [];

  return {
    total_customers: customers.status === "fulfilled" ? customers.value : 0,
    active_jobs: jobResults.filter(
      (job) => !["closed", "completed"].includes(job.jobstatus?.toLowerCase() ?? "")
    ).length,
    quote_awating_response: quoteResults.filter((quote) =>
      quote.quote_status?.toLowerCase().includes("await")
    ).length,
    quote_accepted: quoteResults.filter((quote) =>
      quote.quote_status?.toLowerCase().includes("accepted")
    ).length,
    invoice_created: invoices.status === "fulfilled" ? invoices.value : 0,
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<DashboardStats>("/api/dashboard/stats/");
    return response.data;
  } catch (error) {
    if (isNotFound(error)) {
      return getFallbackDashboardStats();
    }

    throw error;
  }
};

export const getRecentQuotes = async (): Promise<RecentQuote[]> => {
  try {
    const response = await apiClient.get<RecentQuote[] | RecentQuoteListResponse>(
      "/api/dashboard/recent-quotes/"
    );
    return normalizeListResponse(response.data);
  } catch (error) {
    if (isNotFound(error)) {
      const response = await apiClient.get<QuoteListResponse>("/api/quote/list/?page=1");
      return sortByCreatedAt(normalizeListResponse(response.data)).slice(0, 5);
    }

    throw error;
  }
};

export const getRecentInvoices = async (): Promise<RecentInvoice[]> => {
  try {
    const response = await apiClient.get<
      RecentInvoice[] | RecentInvoiceListResponse
    >("/api/dashboard/recent-invoices/");
    return normalizeListResponse(response.data);
  } catch (error) {
    if (isNotFound(error)) {
      const response = await apiClient.get<InvoiceListResponse>("/api/invoice/list/?page=1");
      return sortByCreatedAt(normalizeListResponse(response.data).map(toRecentInvoice)).slice(0, 5);
    }

    throw error;
  }
};
