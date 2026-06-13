"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createServiceBookingAction } from "@/lib/actions/bookings";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface ServiceBookingFormProps {
  serviceId: number;
  isAuthenticated: boolean;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function ServiceBookingForm({ serviceId, isAuthenticated }: ServiceBookingFormProps) {
  const [state, formAction, isPending] = useActionState(createServiceBookingAction, INITIAL_ACTION_STATE);
  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-strong">Reservar este servicio</h2>
        <p className="mt-3 text-body">
          <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
            Ingresá
          </Link>{" "}
          para reservar este servicio.
        </p>
      </div>
    );
  }
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-strong">Reservar este servicio</h2>
      <input type="hidden" name="service_id" value={serviceId} />
      <label className="flex flex-col gap-1 text-sm text-body">
        Fecha del evento
        <input
          type="date"
          name="event_date"
          required
          min={TODAY_ISO}
          className="field w-fit rounded-lg border border-border px-3 py-1.5"
        />
      </label>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="tappable w-fit rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Reservar
      </button>
    </form>
  );
}
