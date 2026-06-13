"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

interface FavoriteTarget {
  venueId?: number;
  serviceId?: number;
}

export async function toggleFavoriteAction(target: FavoriteTarget): Promise<boolean> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const payload = target.venueId !== undefined ? { venue_id: target.venueId } : { service_id: target.serviceId };
  const result = await apiFetch<{ favorited: boolean }>("/api/favorites/toggle", {
    method: "POST",
    body: payload,
    token,
  });
  revalidatePath("/favorites");
  return result.favorited;
}
