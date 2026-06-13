"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <label className="flex flex-col gap-1 text-sm text-body">
        Email
        <input type="email" name="email" required className="field rounded-lg border border-border px-3 py-1.5" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Contraseña
        <input type="password" name="password" required className="field rounded-lg border border-border px-3 py-1.5" />
      </label>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="tappable rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Ingresar
      </button>
    </form>
  );
}
