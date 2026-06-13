"use client";

import { useActionState } from "react";

import { saveServiceAction } from "@/lib/actions/provider";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { Service } from "@/lib/types";

const INPUT_CLASS = "field rounded-lg border border-border px-3 py-1.5";

interface ServiceFormProps {
  service: Service | null;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveServiceAction.bind(null, service?.id ?? null),
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={formAction} className="flex max-w-lg animate-fade-up flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <label className="flex flex-col gap-1 text-sm text-body">
        Nombre
        <input type="text" name="name" required defaultValue={service?.name} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Categoría
        <select name="category" required defaultValue={service?.category} className={INPUT_CLASS}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Descripción
        <textarea name="description" rows={3} defaultValue={service?.description} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Precio
        <input
          type="number"
          name="price"
          required
          min={0}
          step="0.01"
          defaultValue={service?.price}
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
