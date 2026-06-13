import { apiFetch } from "@/lib/api";
import type { ConversationList, Thread } from "@/lib/types";

export async function fetchConversations(token: string): Promise<ConversationList> {
  return apiFetch<ConversationList>("/api/messages", { token });
}

export async function fetchThread(token: string, partnerId: number): Promise<Thread> {
  return apiFetch<Thread>(`/api/messages/${partnerId}`, { token });
}
