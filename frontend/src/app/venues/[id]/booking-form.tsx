"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createVenueBookingAction } from "@/lib/actions/bookings";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface BookingFormProps {
  venueId: number;
  isAuthenticated: boolean;
  bookedDates: string[];
}

export function BookingForm({ venueId, isAuthenticated, bookedDates }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createVenueBookingAction, INITIAL_ACTION_STATE);
  if (!isAuthenticated) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-700">
        <Link href="/login" className="font-medium underline">
          Ingresá
        </Link>{" "}
        para reservar este salón.
      </p>
    );
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="text-xl font-medium">Reservar fecha</h2>
      <input type="hidden" name="venue_id" value={venueId} />
      <label className="flex max-w-xs flex-col gap-1 text-sm">
        Fecha del evento
        <input type="date" name="event_date" required className="rounded border border-zinc-300 px-3 py-1.5" />
      </label>
      {bookedDates.length > 0 && (
        <p className="text-sm text-zinc-500">Fechas ya ocupadas: {bookedDates.join(", ")}</p>
      )}
      {state.error !== null && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-zinc-900 px-5 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        Reservar
      </button>
    </form>
  );
}
