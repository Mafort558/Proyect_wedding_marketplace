"use server";

import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import type { Booking } from "@/lib/types";

export async function createVenueBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const payload = {
    venue_id: Number(formData.get("venue_id")),
    event_date: String(formData.get("event_date") ?? ""),
  };
  try {
    await apiFetch<Booking>("/api/bookings", { method: "POST", body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/bookings");
}

export async function createServiceBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const payload = {
    service_id: Number(formData.get("service_id")),
    event_date: String(formData.get("event_date") ?? ""),
  };
  try {
    await apiFetch<Booking>("/api/bookings", { method: "POST", body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/bookings");
}

export async function cancelBookingAction(bookingId: number): Promise<void> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  await apiFetch<Booking>(`/api/bookings/${bookingId}/cancel`, { method: "POST", token });
  redirect("/bookings");
}
