"use client";

import { useActionState } from "react";

import { payDepositAction } from "@/lib/actions/payments";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface PayDepositButtonProps {
  bookingId: number;
}

export function PayDepositButton({ bookingId }: PayDepositButtonProps) {
  const [state, formAction, isPending] = useActionState(payDepositAction, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="booking_id" value={bookingId} />
      <button
        type="submit"
        disabled={isPending}
        className="shimmer-btn rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-50"
      >
        Pagar seña
      </button>
      {state.error !== null && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
