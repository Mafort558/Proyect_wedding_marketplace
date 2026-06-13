import { STATUS_LABELS } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "border-amber-300/60 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
  deposit_paid: "border-sky-300/60 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
  confirmed: "border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  cancelled: "border-stone-300/60 bg-stone-100 text-stone-600 dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-400",
};

const DOT_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  deposit_paid: "bg-sky-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-stone-400",
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
