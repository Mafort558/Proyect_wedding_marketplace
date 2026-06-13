"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import { getSessionToken } from "@/lib/session";
import type { Message } from "@/lib/types";

export async function sendMessageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const recipientId = Number(formData.get("recipient_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (body === "") {
    return { error: "Escribí un mensaje" };
  }
  try {
    await apiFetch<Message>("/api/messages", { method: "POST", body: { recipient_id: recipientId, body }, token });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  revalidatePath(`/messages/${recipientId}`);
  return { error: null };
}
