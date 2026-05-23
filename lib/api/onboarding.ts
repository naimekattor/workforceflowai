import type { BusinessType } from "@/onboarding/context/OnboardingContext";
import axios from "axios";
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

type ApiErrorPayload = Record<string, unknown>;

export class OnboardingApiError extends Error {
  data?: ApiErrorPayload;

  constructor(message: string, data?: ApiErrorPayload) {
    super(message);
    this.name = "OnboardingApiError";
    this.data = data;
  }
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
}

function getErrorMessage(data?: ApiErrorPayload): string {
  if (!data) return "Setup failed. Please check your details and try again.";

  const directMessage =
    firstMessage(data.detail) || firstMessage(data.non_field_errors);
  if (directMessage) return directMessage;

  for (const [field, value] of Object.entries(data)) {
    const message = firstMessage(value);
    if (message) return `${field}: ${message}`;
  }

  return "Setup failed. Please check your details and try again.";
}

export async function createBusinessDetails(
  businessType: BusinessType,
  formData: FormData
): Promise<unknown> {
  try {
    const response = await apiClient.post(
      getBusinessDetailsEndpoint(businessType),
      formData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const data = error.response?.data;
      throw new OnboardingApiError(getErrorMessage(data), data);
    }

    throw error;
  }
}
