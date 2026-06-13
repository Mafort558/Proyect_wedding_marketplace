"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenItem = (notification: Notification) => {
    if (!notification.read) {
      startTransition(() => markNotificationReadAction(notification.id));
    }
    setOpen(false);
  };

  const handleMarkAll = () => {
    startTransition(() => markAllNotificationsReadAction());
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notificaciones"
        className="tappable relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-body transition-colors hover:border-accent hover:text-accent"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-strong">Notificaciones</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="text-xs font-medium text-accent transition-colors hover:text-accent-strong disabled:opacity-50"
                >
                  Marcar todas
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No tenés notificaciones.</p>
            ) : (
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href={notification.link === "" ? "/" : notification.link}
                      onClick={() => handleOpenItem(notification)}
                      className={`block px-4 py-3 transition-colors hover:bg-background ${notification.read ? "" : "bg-accent/5"}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                        <div className={notification.read ? "pl-4" : ""}>
                          <p className="text-sm font-medium text-strong">{notification.title}</p>
                          {notification.body !== "" && <p className="mt-0.5 text-xs leading-relaxed text-body">{notification.body}</p>}
                          <p className="mt-1 text-[11px] text-muted">{DATE_FORMATTER.format(new Date(notification.created_at))}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
