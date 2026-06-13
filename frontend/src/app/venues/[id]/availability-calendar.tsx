"use client";

import { useState } from "react";

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

interface AvailabilityCalendarProps {
  bookedDates: string[];
  selectedDate?: string | null;
  onSelect?: (date: string) => void;
}

export function AvailabilityCalendar({ bookedDates, selectedDate = null, onSelect }: AvailabilityCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const booked = new Set(bookedDates);
  const today = toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
  const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;

  function goToPreviousMonth() {
    if (monthIndex === 0) {
      setYear(year - 1);
      setMonthIndex(MONTHS_PER_YEAR - 1);
      return;
    }
    setMonthIndex(monthIndex - 1);
  }

  function goToNextMonth() {
    if (monthIndex === MONTHS_PER_YEAR - 1) {
      setYear(year + 1);
      setMonthIndex(0);
      return;
    }
    setMonthIndex(monthIndex + 1);
  }

  const base = "tappable relative flex aspect-square items-center justify-center rounded-xl text-sm transition-colors";

  function dayClassName(isoDate: string, isDisabled: boolean) {
    if (isoDate === selectedDate) {
      return `${base} bg-accent font-semibold text-white shadow-md shadow-accent/30`;
    }
    if (booked.has(isoDate)) {
      return `${base} bg-red-100 text-red-700 line-through dark:bg-red-500/15 dark:text-red-400`;
    }
    if (isoDate === today) {
      return `${base} text-body ring-1 ring-inset ring-accent/40`;
    }
    if (isDisabled) {
      return `${base} text-muted/40`;
    }
    if (onSelect === undefined) {
      return `${base} text-body`;
    }
    return `${base} text-body hover:bg-accent/10 hover:text-accent`;
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={isCurrentMonth}
          aria-label="Mes anterior"
          className="tappable rounded-lg px-2 py-1 text-body hover:bg-foreground/5 disabled:opacity-30"
        >
          ←
        </button>
        <p className="text-sm font-medium text-strong">
          {MONTH_LABELS[monthIndex]} {year}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="tappable rounded-lg px-2 py-1 text-body hover:bg-foreground/5"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const isoDate = toIsoDate(year, monthIndex, index + 1);
          const isDisabled = isoDate < today || booked.has(isoDate) || onSelect === undefined;
          const isSelectable = !isDisabled && isoDate !== selectedDate;
          return (
            <button
              key={isoDate}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(isoDate)}
              className={dayClassName(isoDate, isDisabled)}
            >
              {index + 1}
              {isSelectable && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        {onSelect !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Libre
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100 dark:bg-red-500/20" /> Ocupada
        </span>
        {onSelect !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-accent" /> Elegida
          </span>
        )}
      </div>
    </div>
  );
}

function toIsoDate(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${month}-${paddedDay}`;
}
