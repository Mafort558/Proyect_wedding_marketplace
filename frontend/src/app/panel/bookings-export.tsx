"use client";

import { STATUS_LABELS } from "@/lib/labels";
import type { Booking } from "@/lib/types";

interface BookingsExportProps {
  bookings: Booking[];
}

const CSV_HEADERS = ["id", "fecha_evento", "estado", "salon_id", "servicio_id", "total"];

function toCsv(bookings: Booking[]): string {
  const rows = bookings.map((booking) =>
    [
      booking.id,
      booking.event_date,
      STATUS_LABELS[booking.status],
      booking.venue_id ?? "",
      booking.service_id ?? "",
      booking.total_price,
    ].join(","),
  );
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function BookingsExport({ bookings }: BookingsExportProps) {
  const handleExport = () => {
    const blob = new Blob([toCsv(bookings)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reservas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={bookings.length === 0}
      className="tappable rounded-lg border border-border px-4 py-2 text-sm text-body hover:border-accent hover:text-accent disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}
