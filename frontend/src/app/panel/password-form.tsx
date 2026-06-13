"use client";

import { useActionState, useEffect, useRef } from "react";

import { changePasswordAction } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, INITIAL_ACTION_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success === true) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      <h2 className="font-display text-xl text-strong">Cambiar contraseña</h2>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-body">Contraseña actual</span>
        <input
          type="password"
          name="current_password"
          required
          className="field rounded-lg border border-border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-body">Nueva contraseña</span>
        <input
          type="password"
          name="new_password"
          required
          minLength={8}
          maxLength={128}
          className="field rounded-lg border border-border px-3 py-2"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="tappable rounded-full bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
        >
          Actualizar contraseña
        </button>
        {state.success === true && <span className="text-sm text-emerald-600 dark:text-emerald-400">Actualizada</span>}
      </div>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
