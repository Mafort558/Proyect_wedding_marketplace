"use client";

import { useActionState } from "react";

import { savePackageAction } from "@/lib/actions/provider";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { Package, Service } from "@/lib/types";

const INPUT_CLASS = "field rounded-lg border border-border px-3 py-1.5";

interface PackageFormProps {
  package: Package | null;
  services: Service[];
}

export function PackageForm({ package: pkg, services }: PackageFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePackageAction.bind(null, pkg?.id ?? null),
    INITIAL_ACTION_STATE,
  );
  const selectedIds = new Set(pkg?.service_ids ?? []);
  return (
    <form action={formAction} className="flex max-w-lg animate-fade-up flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <label className="flex flex-col gap-1 text-sm text-body">
        Nombre
        <input type="text" name="name" required defaultValue={pkg?.name} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Descripción
        <textarea name="description" rows={3} defaultValue={pkg?.description} className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Precio del paquete
        <input type="number" name="price" required min={0} step="0.01" defaultValue={pkg?.price} className={INPUT_CLASS} />
      </label>
      <fieldset className="flex flex-col gap-2 text-sm text-body">
        <legend className="font-medium text-strong">Servicios incluidos</legend>
        {services.length === 0 ? (
          <p className="text-sm text-muted">Primero cargá servicios para poder armar un paquete.</p>
        ) : (
          services.map((service) => (
            <label key={service.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input
                type="checkbox"
                name="service_ids"
                value={service.id}
                defaultChecked={selectedIds.has(service.id)}
                className="h-4 w-4 accent-accent"
              />
              <span className="flex-1">{service.name}</span>
              <span className="text-xs text-muted">
                {CATEGORY_LABELS[service.category]} · ${service.price}
              </span>
            </label>
          ))
        )}
      </fieldset>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending || services.length === 0}
        className="tappable w-fit rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}
