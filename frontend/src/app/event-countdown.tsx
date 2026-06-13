"use client";

import { useEffect, useState } from "react";

const MS_PER_DAY = 86_400_000;

interface EventCountdownProps {
  date: string;
  variant?: "badge" | "hero";
}

function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

function label(days: number): string {
  if (days > 1) {
    return `Faltan ${days} días`;
  }
  if (days === 1) {
    return "Falta 1 día";
  }
  if (days === 0) {
    return "¡Es hoy!";
  }
  return "Finalizado";
}

export function EventCountdown({ date, variant = "badge" }: EventCountdownProps) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(date));
  }, [date]);

  if (days === null) {
    return null;
  }

  if (variant === "hero") {
    if (days < 0) {
      return <p className="font-display text-2xl font-semibold text-white/90">Evento finalizado</p>;
    }
    if (days === 0) {
      return <p className="font-display text-4xl font-semibold text-white sm:text-5xl">¡Es hoy!</p>;
    }
    return (
      <p className="font-display text-white">
        <span className="text-5xl font-semibold sm:text-6xl">{days}</span>
        <span className="ml-2 text-lg text-white/85">{days === 1 ? "día" : "días"}</span>
      </p>
    );
  }

  const tone =
    days < 0
      ? "border-border bg-surface text-muted"
      : days === 0
        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "border-accent/30 bg-accent/10 text-accent";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label(days)}
    </span>
  );
}
