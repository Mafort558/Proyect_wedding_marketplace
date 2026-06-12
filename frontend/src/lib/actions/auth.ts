"use server";

import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { clearSessionToken, setSessionToken } from "@/lib/session";
import type { ActionState } from "@/lib/actions/shared";
import { toErrorMessage } from "@/lib/actions/shared";
import type { TokenResponse, User } from "@/lib/types";

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const credentials = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  let token: TokenResponse;
  try {
    token = await apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: credentials });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  await setSessionToken(token.access_token);
  redirect("/venues");
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    role: "client",
  };
  try {
    await apiFetch<User>("/api/auth/register", { method: "POST", body: payload });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
  return loginAction(_prevState, formData);
}

export async function logoutAction(): Promise<void> {
  await clearSessionToken();
  redirect("/venues");
}
