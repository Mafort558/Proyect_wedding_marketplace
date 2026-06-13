"use client";

import { useActionState, useState } from "react";

import { registerAction } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { UserRole } from "@/lib/types";

const INPUT_CLASS = "field rounded-lg border border-border px-3 py-1.5";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, INITIAL_ACTION_STATE);
  const [role, setRole] = useState<UserRole>("client");
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <fieldset className="flex gap-6 text-sm text-body">
        <legend className="mb-2">Quiero registrarme como</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={() => setRole("client")}
          />
          Cliente
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="role"
            value="provider"
            checked={role === "provider"}
            onChange={() => setRole("provider")}
          />
          Proveedor
        </label>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm text-body">
        Nombre completo
        <input type="text" name="full_name" required className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Email
        <input type="email" name="email" required className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-body">
        Contraseña
        <input type="password" name="password" required minLength={8} className={INPUT_CLASS} />
      </label>
      {role === "provider" && (
        <>
          <label className="flex flex-col gap-1 text-sm text-body">
            Nombre del negocio
            <input type="text" name="business_name" required className={INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-body">
            Rubro
            <select name="category" required className={INPUT_CLASS}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="tappable rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Crear cuenta
      </button>
    </form>
  );
}
