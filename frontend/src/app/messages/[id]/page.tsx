import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MessageComposer } from "@/app/messages/message-composer";
import { ApiError } from "@/lib/api";
import { fetchThread } from "@/lib/messages";
import { getCurrentUser, getSessionToken } from "@/lib/session";
import type { Thread } from "@/lib/types";

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps) {
  const { id } = await params;
  const token = await getSessionToken();
  if (token === undefined) {
    return { title: "Mensajes" };
  }
  const thread = await loadThread(token, Number(id));
  return { title: `Chat con ${thread.partner_name}` };
}

const TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const partnerId = Number(id);
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const user = await getCurrentUser();
  const thread = await loadThread(token, partnerId);
  return (
    <section className="flex flex-col gap-5">
      <div className="animate-fade-up flex items-center gap-3">
        <Link href="/messages" className="nav-link text-sm text-muted hover:text-accent">
          ← Mensajes
        </Link>
        <h1 className="text-2xl font-semibold text-strong">{thread.partner_name}</h1>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        {thread.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No hay mensajes todavía. Escribí el primero.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {thread.messages.map((message) => {
              const mine = user !== null && message.sender_id === user.id;
              return (
                <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      mine ? "bg-accent text-white" : "bg-background text-body"
                    }`}
                  >
                    <p>{message.body}</p>
                    <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>
                      {TIME_FORMATTER.format(new Date(message.created_at))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <MessageComposer recipientId={partnerId} />
    </section>
  );
}

async function loadThread(token: string, partnerId: number): Promise<Thread> {
  try {
    return await fetchThread(token, partnerId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
