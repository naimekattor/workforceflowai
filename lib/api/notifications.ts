import apiClient from "./axios";

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

export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const response = await apiClient.get<NotificationSettings>(
      "/api/notifications/settings/"
    );
    return response.data;
  };

export const updateNotificationSettings = async (
  payload: NotificationSettingsPatch
): Promise<NotificationSettings> => {
  const response = await apiClient.patch<NotificationSettings>(
    "/api/notifications/settings/",
    payload
  );
  return response.data;
};
