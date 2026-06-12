import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export async function fetchAsProvider<T>(path: string): Promise<T> {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  try {
    return await apiFetch<T>(path, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      redirect("/venues");
    }
    throw error;
  }
}
