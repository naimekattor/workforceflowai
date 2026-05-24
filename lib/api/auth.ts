// lib/api/auth.ts
import axios from "axios";
import apiClient from "./axios";

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordConfirmPayload {
  email: string;
  verify_otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  new_password: string;
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
  message?: string;
  new_password?: string[];
  non_field_errors?: string[];
  password?: string[];
  verify_otp?: string[];
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

function getErrorMessage(
  data?: ApiErrorPayload,
  fallback = "Registration failed"
): string {
  return (
    firstMessage(data?.email) ||
    firstMessage(data?.password) ||
    firstMessage(data?.full_name) ||
    firstMessage(data?.verify_otp) ||
    firstMessage(data?.new_password) ||
    firstMessage(data?.non_field_errors) ||
    firstMessage(data?.message) ||
    firstMessage(data?.detail) ||
    fallback
  );
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<RegisterResponse>(
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

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<void> {
  try {
    await apiClient.post("/api/auth/forgot-password/", payload);
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const data = error.response?.data;
      throw new ApiRequestError(
        getErrorMessage(data, "Failed to send password reset email"),
        data
      );
    }

    throw error;
  }
}

export async function forgotPasswordConfirm(
  payload: ForgotPasswordConfirmPayload
): Promise<void> {
  try {
    await apiClient.post("/api/auth/forgot-password-confirm/", payload);
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const data = error.response?.data;
      throw new ApiRequestError(
        getErrorMessage(data, "Failed to verify OTP"),
        data
      );
    }

    throw error;
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<void> {
  try {
    await apiClient.post("/api/auth/reset-password/", payload);
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const data = error.response?.data;
      throw new ApiRequestError(
        getErrorMessage(data, "Failed to reset password"),
        data
      );
    }

    throw error;
  }
}
