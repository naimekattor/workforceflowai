// lib/api/axios.ts
import axios, { AxiosHeaders } from "axios";
import { getSession } from "next-auth/react";
import { getApiBaseUrl } from "./config";

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

// Auto-attach Bearer token on every request
apiClient.interceptors.request.use(async (config) => {
  config.headers = AxiosHeaders.from(config.headers);

  const session = await getSession();
  if (session?.accessToken) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    config.headers.delete("Content-Type");
  } else if (config.data && !config.headers.has("Content-Type")) {
    config.headers.set("Content-Type", "application/json");
  }

  return config;
});

// Handle 401s globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
