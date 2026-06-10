import { isAxiosError } from "axios";
import apiClient from "./axios";
import { buildWebSocketUrl } from "./config";

export interface Notification {
  id: number;
  user: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface NotificationSettings {
  id: number;
  user: number;
  quote_accept: boolean;
  quote_reject: boolean;
  new_customer: boolean;
}

export type NotificationSettingsPatch = Partial<
  Pick<
    NotificationSettings,
    "quote_accept" | "quote_reject" | "new_customer"
  >
>;

function isNotificationSettings(value: unknown): value is NotificationSettings {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<NotificationSettings>;
  return (
    typeof settings.quote_accept === "boolean" &&
    typeof settings.quote_reject === "boolean" &&
    typeof settings.new_customer === "boolean"
  );
}

export const getNotificationSettings =
  async (): Promise<NotificationSettings | null> => {
    const response = await apiClient.get<unknown>(
      "/api/notifications/settings/"
    );
    return isNotificationSettings(response.data) ? response.data : null;
  };

export const updateNotificationSettings = async (
  payload: NotificationSettingsPatch
): Promise<NotificationSettings | null> => {
  const response = await apiClient.patch<unknown>(
    "/api/notifications/settings/",
    payload
  );
  return isNotificationSettings(response.data) ? response.data : null;
};

export const getNotifications = async (): Promise<NotificationListResponse> => {
  const endpoints = ["api/notifications/list/", "/api/notifications/list/"];

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get<NotificationListResponse>(endpoint);
      return response.data;
    } catch (error) {
      const shouldTryNextEndpoint =
        isAxiosError(error) && error.response?.status === 404;

      if (!shouldTryNextEndpoint || endpoint === endpoints.at(-1)) {
        throw error;
      }
    }
  }

  throw new Error("Unable to load notifications.");
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await apiClient.put(`/api/notifications/${id}/mark-read/`);
};

export function getNotificationWebSocketUrl(accessToken: string): string {
  return buildWebSocketUrl(
    `/ws/notifications/?token=${encodeURIComponent(accessToken)}`
  );
}
