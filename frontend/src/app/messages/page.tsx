import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchConversations } from "@/lib/messages";
import { getSessionToken } from "@/lib/session";

export const metadata = { title: "Mensajes" };

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function MessagesPage() {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const conversations = await fetchConversations(token);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Mensajes</h1>
      {conversations.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Sin conversaciones</p>
          <p className="mt-2 text-sm text-muted">Escribile a un proveedor desde su perfil para empezar a chatear.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.items.map((conversation) => (
            <li key={conversation.partner_id}>
              <Link
                href={`/messages/${conversation.partner_id}`}
                className="card-rise flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-strong">
                    {conversation.partner_name}
                    {conversation.unread_count > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                        {conversation.unread_count}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{conversation.last_body}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{DATE_FORMATTER.format(new Date(conversation.last_at))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
