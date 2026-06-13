"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import type { Booking, Package, Provider, Service, Venue } from "@/lib/types";

interface Endpoint {
  path: string;
  method: string;
}

async function requireToken(): Promise<string> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  return token;
}

function saveEndpoint(basePath: string, entityId: number | null): Endpoint {
  if (entityId === null) {
    return { path: basePath, method: "POST" };
  }
  return { path: `${basePath}/${entityId}`, method: "PUT" };
}

export async function saveVenueAction(
  venueId: number | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  const payload = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    capacity: Number(formData.get("capacity")),
    city: String(formData.get("city") ?? ""),
    address: String(formData.get("address") ?? ""),
    price: String(formData.get("price") ?? ""),
    deposit_amount: String(formData.get("deposit_amount") ?? ""),
  };
  const endpoint = saveEndpoint("/api/venues", venueId);
  try {
    await apiFetch<Venue>(endpoint.path, { method: endpoint.method, body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/venues");
}

export async function deleteVenueAction(
  venueId: number,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  try {
    await apiFetch<void>(`/api/venues/${venueId}`, { method: "DELETE", token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/venues");
}

export async function saveServiceAction(
  serviceId: number | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  const payload = {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
  };
  const endpoint = saveEndpoint("/api/services", serviceId);
  try {
    await apiFetch<Service>(endpoint.path, { method: endpoint.method, body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/services");
}

export async function deleteServiceAction(
  serviceId: number,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  try {
    await apiFetch<void>(`/api/services/${serviceId}`, { method: "DELETE", token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/services");
}

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = await requireToken();
  const payload = {
    business_name: String(formData.get("business_name") ?? ""),
    description: String(formData.get("description") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
  try {
    await apiFetch<Provider>("/api/providers/me", { method: "PATCH", body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  revalidatePath("/panel");
  return { error: null, success: true };
}

export async function savePackageAction(
  packageId: number | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  const serviceIds = formData.getAll("service_ids").map((value) => Number(value));
  if (serviceIds.length === 0) {
    return { error: "Elegí al menos un servicio para el paquete" };
  }
  const payload = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    service_ids: serviceIds,
  };
  const endpoint = saveEndpoint("/api/packages", packageId);
  try {
    await apiFetch<Package>(endpoint.path, { method: endpoint.method, body: payload, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/packages");
}

export async function deletePackageAction(
  packageId: number,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const token = await requireToken();
  try {
    await apiFetch<void>(`/api/packages/${packageId}`, { method: "DELETE", token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect("/panel/packages");
}

export async function confirmBookingAction(bookingId: number): Promise<void> {
  const token = await requireToken();
  await apiFetch<Booking>(`/api/providers/me/bookings/${bookingId}/confirm`, { method: "POST", token });
  redirect("/panel");
}

export async function rejectBookingAction(bookingId: number): Promise<void> {
  const token = await requireToken();
  await apiFetch<Booking>(`/api/providers/me/bookings/${bookingId}/reject`, { method: "POST", token });
  redirect("/panel");
}
