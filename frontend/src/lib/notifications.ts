import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { NotificationList } from "@/lib/types";

const EMPTY_NOTIFICATIONS: NotificationList = { items: [], unread_count: 0 };

export async function fetchNotifications(): Promise<NotificationList> {
  const token = await getSessionToken();
  if (token === undefined) {
    return EMPTY_NOTIFICATIONS;
  }
  try {
    return await apiFetch<NotificationList>("/api/notifications", { token });
  } catch {
    return EMPTY_NOTIFICATIONS;
  }
}
