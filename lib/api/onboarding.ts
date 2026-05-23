import type { BusinessType } from "@/onboarding/context/OnboardingContext";
import apiClient from "./axios";

const BUSINESS_DETAILS_ENDPOINTS: Record<BusinessType, string> = {
  sole_trader: "/api/Details-sole-trade-business/",
  limited_company: "/api/Details-limited-company/",
  partnership: "/api/Details-partner/",
  llp: "/api/Details-limited-liability-partnership/",
};

export function getBusinessDetailsEndpoint(businessType: BusinessType): string {
  return BUSINESS_DETAILS_ENDPOINTS[businessType];
}

export async function createBusinessDetails(
  businessType: BusinessType,
  formData: FormData
): Promise<unknown> {
  const response = await apiClient.post(
    getBusinessDetailsEndpoint(businessType),
    formData
  );
  return response.data;
}
