"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendMessageAction } from "@/lib/actions/messages";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface MessageComposerProps {
  recipientId: number;
}

export function MessageComposer({ recipientId }: MessageComposerProps) {
  const [state, formAction, isPending] = useActionState(sendMessageAction, INITIAL_ACTION_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="recipient_id" value={recipientId} />
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          maxLength={2000}
          placeholder="Escribí un mensaje…"
          className="field flex-1 resize-none rounded-2xl border border-border px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={isPending}
          className="tappable shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
