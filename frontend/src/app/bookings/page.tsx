import Link from "next/link";
import { redirect } from "next/navigation";

import { PayDepositButton } from "@/app/bookings/pay-deposit-button";
import { apiFetch } from "@/lib/api";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { STATUS_LABELS } from "@/lib/labels";
import { getSessionToken } from "@/lib/session";
import type { Booking, BookingStatus } from "@/lib/types";

const CANCELLABLE_STATUSES: BookingStatus[] = ["pending", "deposit_paid"];

export default async function BookingsPage() {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const bookings = await apiFetch<Booking[]>("/api/bookings", { token });
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mis reservas</h1>
      {bookings.length === 0 && (
        <p className="text-zinc-600">
          Todavía no tenés reservas.{" "}
          <Link href="/venues" className="underline">
            Mirá los salones
          </Link>
          .
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5"
          >
            <div>
              <p className="font-medium">
                {booking.venue_id !== null && (
                  <Link href={`/venues/${booking.venue_id}`} className="underline">
                    Salón #{booking.venue_id}
                  </Link>
                )}
                {booking.service_id !== null && <>Servicio #{booking.service_id}</>}{" "}
                — {booking.event_date}
              </p>
              <p className="text-sm text-zinc-600">
                {STATUS_LABELS[booking.status]} · ${booking.total_price}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {booking.status === "pending" && <PayDepositButton bookingId={booking.id} />}
              {CANCELLABLE_STATUSES.includes(booking.status) && (
                <form action={cancelBookingAction.bind(null, booking.id)}>
                  <button
                    type="submit"
                    className="rounded border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50"
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
