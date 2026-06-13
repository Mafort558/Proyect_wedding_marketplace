import Link from "next/link";
import { redirect } from "next/navigation";

import { PayDepositButton } from "@/app/bookings/pay-deposit-button";
import { EventCountdown } from "@/app/event-countdown";
import { StatusBadge } from "@/app/status-badge";
import { apiFetch } from "@/lib/api";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { getSessionToken } from "@/lib/session";
import type { Booking, BookingStatus } from "@/lib/types";

export const metadata = { title: "Mis reservas" };

const CANCELLABLE_STATUSES: BookingStatus[] = ["pending", "deposit_paid"];

function bookingLabel(booking: Booking): string {
  if (booking.venue_id !== null) {
    return `Salón #${booking.venue_id}`;
  }
  return `Servicio #${booking.service_id}`;
}

function findNextEvent(bookings: Booking[]): Booking | undefined {
  const todayIso = new Date().toISOString().slice(0, 10);
  return bookings
    .filter((booking) => booking.status !== "cancelled" && booking.event_date >= todayIso)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0];
}

export default async function BookingsPage() {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const bookings = await apiFetch<Booking[]>("/api/bookings", { token });
  const nextEvent = findNextEvent(bookings);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Mis reservas</h1>
      {nextEvent !== undefined && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-strong via-accent to-[#3a1f28] p-7 text-white shadow-lg">
          <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 animate-blob rounded-full bg-white/15" />
          <span className="pointer-events-none absolute -bottom-12 -left-8 h-52 w-52 animate-blob rounded-full bg-gold/25 [animation-delay:5s]" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">Próximo evento</p>
              <p className="mt-1 font-medium text-white/90">
                {bookingLabel(nextEvent)} · {nextEvent.event_date}
              </p>
            </div>
            <EventCountdown date={nextEvent.event_date} variant="hero" />
          </div>
        </div>
      )}
      {bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Todavía no tenés reservas</p>
          <p className="mt-2 text-sm text-muted">Cuando reserves un salón o servicio, va a aparecer acá.</p>
          <Link
            href="/venues"
            className="tappable mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Explorar salones
          </Link>
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {bookings.map((booking, index) => (
          <li
            key={booking.id}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${index * 60}ms` }}
            className="reveal card-rise flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div>
              <p className="font-medium text-strong">
                {booking.venue_id !== null && (
                  <Link href={`/venues/${booking.venue_id}`} className="text-accent hover:text-accent-strong">
                    Salón #{booking.venue_id}
                  </Link>
                )}
                {booking.service_id !== null && <>Servicio #{booking.service_id}</>}{" "}
                — {booking.event_date}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={booking.status} />
                {booking.status !== "cancelled" && <EventCountdown date={booking.event_date} />}
                <span className="text-sm text-muted">${booking.total_price}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {booking.status === "pending" && <PayDepositButton bookingId={booking.id} />}
              {CANCELLABLE_STATUSES.includes(booking.status) && (
                <form action={cancelBookingAction.bind(null, booking.id)}>
                  <button
                    type="submit"
                    className="tappable rounded-lg border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
