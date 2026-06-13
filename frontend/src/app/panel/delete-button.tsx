"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/actions/shared";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface DeleteButtonProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}

export function DeleteButton({ action }: DeleteButtonProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={isPending}
        className="tappable rounded-lg border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        Eliminar
      </button>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
