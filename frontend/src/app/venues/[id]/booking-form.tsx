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

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return DATE_FORMATTER.format(new Date(year, month - 1, day));
}

export function BookingForm({ venueId, isAuthenticated, bookedDates }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createVenueBookingAction, INITIAL_ACTION_STATE);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-strong">Disponibilidad</h2>
        <AvailabilityCalendar bookedDates={bookedDates} />
        <p className="text-body">
          <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
            Ingresá
          </Link>{" "}
          para reservar este salón.
        </p>
      </div>
    );
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-strong">Reservar fecha</h2>
      <input type="hidden" name="venue_id" value={venueId} />
      <input type="hidden" name="event_date" value={selectedDate ?? ""} />
      <AvailabilityCalendar bookedDates={bookedDates} selectedDate={selectedDate} onSelect={setSelectedDate} />
      {selectedDate !== null && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
          Fecha elegida: {formatDate(selectedDate)}
        </p>
      )}
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending || selectedDate === null}
        className="tappable w-fit rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Reservar
      </button>
    </form>
  );
}
