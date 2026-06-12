"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { AvailabilityCalendar } from "@/app/venues/[id]/availability-calendar";
import { createVenueBookingAction } from "@/lib/actions/bookings";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface BookingFormProps {
  venueId: number;
  isAuthenticated: boolean;
  bookedDates: string[];
}

export function BookingForm({ venueId, isAuthenticated, bookedDates }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createVenueBookingAction, INITIAL_ACTION_STATE);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-medium">Disponibilidad</h2>
        <AvailabilityCalendar bookedDates={bookedDates} />
        <p className="text-zinc-700">
          <Link href="/login" className="font-medium underline">
            Ingresá
          </Link>{" "}
          para reservar este salón.
        </p>
      </div>
    );
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="text-xl font-medium">Reservar fecha</h2>
      <input type="hidden" name="venue_id" value={venueId} />
      <input type="hidden" name="event_date" value={selectedDate ?? ""} />
      <AvailabilityCalendar bookedDates={bookedDates} selectedDate={selectedDate} onSelect={setSelectedDate} />
      {selectedDate !== null && (
        <p className="text-sm text-zinc-600">Fecha elegida: {selectedDate}</p>
      )}
      {state.error !== null && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending || selectedDate === null}
        className="w-fit rounded bg-zinc-900 px-5 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        Reservar
      </button>
    </form>
  );
}
