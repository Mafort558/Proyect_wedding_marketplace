import type { BookingStatus, ProviderCategory } from "@/lib/types";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pendiente de seña",
  deposit_paid: "Seña pagada",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  venue: "Salones",
  catering: "Catering",
  photography: "Fotografía",
  music: "Música",
  decoration: "Decoración",
};
