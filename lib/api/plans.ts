import apiClient from "./axios";

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  limits: {
    customers: number | null;
    quotes: number | null;
    team: number | null;
  };
  is_current_plan: boolean;
  is_popular?: boolean;
  plan_type: string;
  is_active?: boolean;
  max_customers?: number | null;
  max_quotes_per_month?: number | null;
  max_users?: number | null;
}

export interface PlanListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plan[];
}

export interface PlanPurchaseCheckoutResponse {
  checkout_url?: string;
  redirect_url?: string;
}

type RawPlanFeatures = string[] | Record<string, boolean> | null | undefined;

interface RawPlan extends Omit<Plan, "features" | "limits"> {
  features?: RawPlanFeatures;
  limits?: Partial<Plan["limits"]> | null;
  max_customers?: number | null;
  max_quotes_per_month?: number | null;
  max_users?: number | null;
}

interface RawPlanListResponse extends Omit<PlanListResponse, "results"> {
  results: RawPlan[];
}

const FEATURE_LABELS: Record<string, string> = {
  has_api_access: "API access",
  has_basic_invoicing: "Basic invoicing",
  has_payment_collection: "Payment collection",
  has_basic_job_management: "Basic job management",
  has_advanced_job_management: "Advanced job management",
  has_activity_tracking: "Activity tracking",
  has_custom_branding: "Custom branding",
  has_custom_integrations: "Custom integrations",
  enterprise_overage_supported: "Enterprise overage support",
};

function normalizeFeatures(features: RawPlanFeatures): string[] {
  if (Array.isArray(features)) {
    return features.filter((feature): feature is string => typeof feature === "string" && feature.length > 0);
  }

  if (!features || typeof features !== "object") {
    return [];
  }

  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => FEATURE_LABELS[key] || key);
}

function normalizeLimit(
  value: number | null | undefined,
  fallback: number | null | undefined
): number | null {
  if (value !== undefined) return value;
  if (fallback !== undefined) return fallback;
  return null;
}

function normalizePlan(plan: RawPlan): Plan {
  return {
    ...plan,
    features: normalizeFeatures(plan.features),
    limits: {
      customers: normalizeLimit(plan.limits?.customers, plan.max_customers),
      quotes: normalizeLimit(plan.limits?.quotes, plan.max_quotes_per_month),
      team: normalizeLimit(plan.limits?.team, plan.max_users),
    },
    is_current_plan: plan.is_current_plan === true,
  };
}

export const getPlans = async (): Promise<PlanListResponse> => {
  const response = await apiClient.get<RawPlanListResponse>("/api/plan/list/");

  return {
    ...response.data,
    results: Array.isArray(response.data.results)
      ? response.data.results.map(normalizePlan)
      : [],
  };
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
