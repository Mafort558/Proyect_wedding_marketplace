"use server";

import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import type { CheckoutResponse } from "@/lib/types";

export async function payDepositAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const payload = { booking_id: Number(formData.get("booking_id")) };
  let checkout: CheckoutResponse;
  try {
    checkout = await apiFetch<CheckoutResponse>("/api/payments/checkout", {
      method: "POST",
      body: payload,
      token,
    });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  redirect(checkout.init_point);
}
