import Link from "next/link";

import { confirmBookingAction, rejectBookingAction } from "@/lib/actions/provider";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { fetchAsProvider } from "@/lib/provider";
import type { Booking, BookingStatus, Provider } from "@/lib/types";

const ACTIONABLE_STATUSES: BookingStatus[] = ["pending", "deposit_paid"];

export default async function PanelPage() {
  const profile = await fetchAsProvider<Provider>("/api/providers/me");
  const bookings = await fetchAsProvider<Booking[]>("/api/providers/me/bookings");
  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{profile.business_name}</h1>
          <p className="text-sm text-zinc-600">
            {CATEGORY_LABELS[profile.category]}
            {profile.phone !== "" && <> · {profile.phone}</>}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/panel/venues" className="rounded border border-zinc-300 px-4 py-2 hover:bg-zinc-100">
            Mis salones
          </Link>
          <Link href="/panel/services" className="rounded border border-zinc-300 px-4 py-2 hover:bg-zinc-100">
            Mis servicios
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Reservas recibidas</h2>
        {bookings.length === 0 && <p className="text-zinc-600">Todavía no recibiste reservas.</p>}
        <ul className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5"
            >
              <div>
                <p className="font-medium">
                  {booking.venue_id !== null && <>Salón #{booking.venue_id}</>}
                  {booking.service_id !== null && <>Servicio #{booking.service_id}</>} — {booking.event_date}
                </p>
                <p className="text-sm text-zinc-600">
                  {STATUS_LABELS[booking.status]} · ${booking.total_price}
                </p>
              </div>
              {ACTIONABLE_STATUSES.includes(booking.status) && (
                <div className="flex items-center gap-3">
                  <form action={confirmBookingAction.bind(null, booking.id)}>
                    <button
                      type="submit"
                      className="rounded bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700"
                    >
                      Confirmar
                    </button>
                  </form>
                  <form action={rejectBookingAction.bind(null, booking.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50"
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
