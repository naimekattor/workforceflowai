import apiClient from "./axios";

export interface Customer {
  id: number;
  customer_name: string;
  customer_email: string;
  phone_number: string;
  customer_type: string;
  billing_address?: string;
  site_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export const getCustomers = async (
  page = 1,
  search = "",
  ordering = "-created_at",
  filters?: { name?: string; email?: string; phone?: string; phone_number?: string }
): Promise<CustomerListResponse> => {
  const isSearching = Boolean(search) || Boolean(filters?.name) || Boolean(filters?.email) || Boolean(filters?.phone) || Boolean(filters?.phone_number);
  const response = await apiClient.get<CustomerListResponse>("/api/customer/list/", {
    params: {
      ...(isSearching ? {} : { page }),
      ...(isSearching ? {} : { ordering }),
      ...(search ? { search } : {}),
      ...(filters?.name ? { name: filters.name } : {}),
      ...(filters?.email ? { email: filters.email } : {}),
      ...(filters?.phone ? { phone: filters.phone } : {}),
      ...(filters?.phone_number ? { phone_number: filters.phone_number } : {}),
    },
  });
  return response.data;
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.post<Customer>("/api/customer/create/", data);
  return response.data;
};

export const getCustomer = async (id: number | string): Promise<Customer> => {
  const response = await apiClient.get<Customer>(`/api/customer/${id}/`);
  return response.data;
};

export const updateCustomer = async (id: number | string, data: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.patch<Customer>(`/api/customer/${id}/`, data);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/customer/${id}/`);
};

export const searchCustomersByName = async (name: string): Promise<Customer[]> => {
  const response = await apiClient.get<CustomerListResponse>("/api/customer/list/", {
    params: { name },
  });
  return response.data.results;
};
