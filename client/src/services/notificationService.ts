import { httpClient } from "@/external/httpClient";
import type { NotificationResponseData } from "@/schemas/events";

export async function getNotifications(token: string) {
  return httpClient<NotificationResponseData[]>("GET", "/api/notifications", undefined, token);
}

export async function getUnreadCount(token: string) {
  return httpClient<{ count: number }>("GET", "/api/notifications/unread-count", undefined, token);
}

export async function markAsRead(notificationId: string, token: string) {
  return httpClient<NotificationResponseData>("PUT", `/api/notifications/${notificationId}/read`, undefined, token);
}

export async function markAllAsRead(token: string) {
  return httpClient<void>("PUT", "/api/notifications/read-all", undefined, token);
}
