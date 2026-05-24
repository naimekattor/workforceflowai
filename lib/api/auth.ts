// lib/api/auth.ts
import axios from "axios";

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  access: string;
  refresh: string;
}

export interface ApiErrorPayload {
  detail?: string;
  email?: string[];
  full_name?: string[];
  non_field_errors?: string[];
  password?: string[];
  [key: string]: unknown;
}

export class ApiRequestError extends Error {
  data?: ApiErrorPayload;

  constructor(message: string, data?: ApiErrorPayload) {
    super(message);
    this.name = "ApiRequestError";
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
  return (
    firstMessage(data?.email) ||
    firstMessage(data?.password) ||
    firstMessage(data?.full_name) ||
    firstMessage(data?.non_field_errors) ||
    firstMessage(data?.detail) ||
    "Registration failed"
  );
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const response = await axios.post<RegisterResponse>(
      "/api/auth/register/",
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const data = error.response?.data;
      throw new ApiRequestError(getErrorMessage(data), data);
    }

    throw error;
  }
}
