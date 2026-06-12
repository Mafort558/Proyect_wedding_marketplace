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

  function dayClassName(isoDate: string, isDisabled: boolean) {
    if (isoDate === selectedDate) {
      return "rounded bg-zinc-900 py-1.5 text-white";
    }
    if (booked.has(isoDate)) {
      return "rounded bg-red-100 py-1.5 text-red-700 line-through";
    }
    if (isDisabled) {
      return "rounded py-1.5 text-zinc-300";
    }
    if (onSelect === undefined) {
      return "rounded py-1.5 text-zinc-700";
    }
    return "rounded py-1.5 text-zinc-700 hover:bg-zinc-100";
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-zinc-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={isCurrentMonth}
          aria-label="Mes anterior"
          className="rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
        >
          ←
        </button>
        <p className="text-sm font-medium">
          {MONTH_LABELS[monthIndex]} {year}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
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
          return (
            <button
              key={isoDate}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(isoDate)}
              className={dayClassName(isoDate, isDisabled)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-100" /> Ocupada
        </span>
        {onSelect !== undefined && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-zinc-900" /> Seleccionada
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
