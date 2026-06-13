"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export async function markNotificationReadAction(notificationId: number): Promise<void> {
  const token = await requireToken();
  await apiFetch(`/api/notifications/${notificationId}/read`, { method: "POST", token });
  revalidatePath("/");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const token = await requireToken();
  await apiFetch("/api/notifications/read-all", { method: "POST", token });
  revalidatePath("/");
}

async function requireToken(): Promise<string> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  return token;
}
