import apiClient from "./axios";

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  is_active: boolean;
  plan_type: string;
}

export interface PlanListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plan[];
}

export interface PlanPurchaseCheckoutResponse {
  redirect_url: string;
}

export const getPlans = async (): Promise<PlanListResponse> => {
  const response = await apiClient.get<PlanListResponse>("/api/plan/list/");
  return response.data;
};

export const createPlanPurchaseCheckout = async (
  plan: number
): Promise<PlanPurchaseCheckoutResponse> => {
  const response = await apiClient.post<PlanPurchaseCheckoutResponse>(
    "/api/plan/purchase-checkout/",
    { plan }
  );
  return response.data;
};
