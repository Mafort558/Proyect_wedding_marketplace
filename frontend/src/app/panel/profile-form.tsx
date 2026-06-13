"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/lib/actions/provider";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import type { Provider } from "@/lib/types";

interface ProfileFormProps {
  profile: Provider;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="font-display text-xl text-strong">Datos del negocio</h2>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-body">Nombre del negocio</span>
        <input
          name="business_name"
          defaultValue={profile.business_name}
          required
          maxLength={255}
          className="field rounded-lg border border-border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-body">Descripción</span>
        <textarea
          name="description"
          defaultValue={profile.description}
          rows={4}
          maxLength={5000}
          className="field resize-none rounded-lg border border-border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-body">Teléfono</span>
        <input
          name="phone"
          defaultValue={profile.phone}
          maxLength={50}
          placeholder="+54 9 ..."
          className="field rounded-lg border border-border px-3 py-2"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="tappable rounded-full bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
        >
          Guardar cambios
        </button>
        {state.success === true && <span className="text-sm text-emerald-600 dark:text-emerald-400">Guardado</span>}
      </div>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
