"use client";

import { useActionState } from "react";

import { saveServiceAction } from "@/lib/actions/provider";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { Service } from "@/lib/types";

const INPUT_CLASS = "rounded border border-zinc-300 px-3 py-1.5";

interface ServiceFormProps {
  service: Service | null;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveServiceAction.bind(null, service?.id ?? null),
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input type="text" name="name" required defaultValue={service?.name} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Categoría
        <select name="category" required defaultValue={service?.category} className={INPUT_CLASS}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Descripción
        <textarea name="description" rows={3} defaultValue={service?.description} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
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
      {state.error !== null && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-zinc-900 px-5 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}
