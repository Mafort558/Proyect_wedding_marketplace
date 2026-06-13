import Link from "next/link";

import { BookingsExport } from "@/app/panel/bookings-export";
import { StatusBadge } from "@/app/status-badge";
import { confirmBookingAction, rejectBookingAction } from "@/lib/actions/provider";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { fetchAsProvider } from "@/lib/provider";
import type { Booking, BookingStatus, Provider, ProviderDashboard } from "@/lib/types";

export const metadata = { title: "Panel" };

const ACTIONABLE_STATUSES: BookingStatus[] = ["pending", "deposit_paid"];
const CHART_STATUSES: BookingStatus[] = ["pending", "deposit_paid", "confirmed", "cancelled"];

export default async function PanelPage() {
  const profile = await fetchAsProvider<Provider>("/api/providers/me");
  const dashboard = await fetchAsProvider<ProviderDashboard>("/api/providers/me/dashboard");
  const bookings = await fetchAsProvider<Booking[]>("/api/providers/me/bookings");
  const metrics = [
    { label: "Reservas totales", value: dashboard.total_bookings },
    { label: "Próximos eventos", value: dashboard.upcoming_events },
    { label: "Ingresos confirmados", value: `$${dashboard.confirmed_revenue}` },
    {
      label: "Rating",
      value: dashboard.rating === null ? "—" : `${dashboard.rating.toFixed(1)} (${dashboard.review_count})`,
    },
  ];
  const chartMax = Math.max(1, ...CHART_STATUSES.map((status) => dashboard.bookings_by_status[status]));
  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-strong">{profile.business_name}</h1>
          <p className="text-sm text-muted">
            {CATEGORY_LABELS[profile.category]}
            {profile.phone !== "" && <> · {profile.phone}</>}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/panel/settings" className="tappable rounded-lg border border-border px-4 py-2 text-body hover:border-accent hover:text-accent">
            Configuración
          </Link>
          <Link href="/panel/venues" className="tappable rounded-lg border border-border px-4 py-2 text-body hover:border-accent hover:text-accent">
            Mis salones
          </Link>
          <Link href="/panel/services" className="tappable rounded-lg border border-border px-4 py-2 text-body hover:border-accent hover:text-accent">
            Mis servicios
          </Link>
          <Link href="/panel/packages" className="tappable rounded-lg border border-border px-4 py-2 text-body hover:border-accent hover:text-accent">
            Mis paquetes
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
            className="reveal rounded-2xl border border-border bg-surface p-5 text-center shadow-sm"
          >
            <p className="font-display text-2xl font-semibold text-accent sm:text-3xl">{metric.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl text-strong">Reservas por estado</h2>
        <div className="grid grid-cols-4 items-end gap-4" style={{ minHeight: "10rem" }}>
          {CHART_STATUSES.map((status) => {
            const count = dashboard.bookings_by_status[status];
            return (
              <div key={status} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-sm font-semibold text-strong">{count}</span>
                <div
                  className="w-full rounded-t-lg bg-accent/80 transition-all"
                  style={{ height: `${(count / chartMax) * 100}%`, minHeight: count > 0 ? "0.5rem" : "0.125rem" }}
                />
                <span className="text-center text-[11px] leading-tight text-muted">{STATUS_LABELS[status]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-strong">Reservas recibidas</h2>
          <BookingsExport bookings={bookings} />
        </div>
        {bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
            <p className="font-display text-xl text-strong">Todavía no recibiste reservas</p>
            <p className="mt-2 text-sm text-muted">Cuando alguien reserve uno de tus salones o servicios, va a aparecer acá.</p>
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
                  {booking.venue_id !== null && <>Salón #{booking.venue_id}</>}
                  {booking.service_id !== null && <>Servicio #{booking.service_id}</>} — {booking.event_date}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm text-muted">${booking.total_price}</span>
                </div>
              </div>
              {ACTIONABLE_STATUSES.includes(booking.status) && (
                <div className="flex items-center gap-3">
                  <form action={confirmBookingAction.bind(null, booking.id)}>
                    <button
                      type="submit"
                      className="tappable rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-strong"
                    >
                      Confirmar
                    </button>
                  </form>
                  <form action={rejectBookingAction.bind(null, booking.id)}>
                    <button
                      type="submit"
                      className="tappable rounded-lg border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
