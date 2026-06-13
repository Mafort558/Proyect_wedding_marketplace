"use client";

import { useActionState } from "react";

import { saveVenueAction } from "@/lib/actions/provider";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import type { Venue } from "@/lib/types";

const INPUT_CLASS = "field rounded-lg border border-border px-3 py-1.5";

interface VenueFormProps {
  venue: Venue | null;
}

export function VenueForm({ venue }: VenueFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveVenueAction.bind(null, venue?.id ?? null),
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={formAction} className="flex max-w-lg animate-fade-up flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <label className="flex flex-col gap-1 text-sm text-body">
        Nombre
        <input type="text" name="name" required defaultValue={venue?.name} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Descripción
        <textarea name="description" rows={3} defaultValue={venue?.description} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Capacidad
        <input type="number" name="capacity" required min={1} defaultValue={venue?.capacity} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Ciudad
        <input type="text" name="city" required defaultValue={venue?.city} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Dirección
        <input type="text" name="address" required defaultValue={venue?.address} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Precio
        <input type="number" name="price" required min={0} step="0.01" defaultValue={venue?.price} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Seña
        <input
          type="number"
          name="deposit_amount"
          required
          min={0}
          step="0.01"
          defaultValue={venue?.deposit_amount}
          className={INPUT_CLASS}
        />
      </label>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="tappable w-fit rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}
