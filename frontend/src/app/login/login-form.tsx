"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" required className="rounded border border-zinc-300 px-3 py-1.5" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input type="password" name="password" required className="rounded border border-zinc-300 px-3 py-1.5" />
      </label>
      {state.error !== null && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-900 px-5 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        Ingresar
      </button>
    </form>
  );
}
