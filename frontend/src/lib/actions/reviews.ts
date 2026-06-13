"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import { getSessionToken } from "@/lib/session";
import type { Review } from "@/lib/types";

function targetPayload(formData: FormData): Record<string, number> {
  const venueId = formData.get("venue_id");
  if (venueId !== null) {
    return { venue_id: Number(venueId) };
  }
  return { service_id: Number(formData.get("service_id")) };
}

export async function createReviewAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const payload = {
    ...targetPayload(formData),
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") ?? ""),
  };
  try {
    await apiFetch<Review>("/api/reviews", { method: "POST", body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  revalidatePath(String(formData.get("revalidate_path") ?? "/"));
  return { error: null };
}
