"use client";

import { useActionState, useState } from "react";

import { createReviewAction } from "@/lib/actions/reviews";
import { INITIAL_ACTION_STATE } from "@/lib/actions/shared";

interface ReviewFormProps {
  venueId?: number;
  serviceId?: number;
  revalidatePath: string;
}

const RATING_VALUES = [1, 2, 3, 4, 5];

export function ReviewForm({ venueId, serviceId, revalidatePath }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(createReviewAction, INITIAL_ACTION_STATE);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? rating;
  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-strong">Dejá tu reseña</h3>
      {venueId !== undefined && <input type="hidden" name="venue_id" value={venueId} />}
      {serviceId !== undefined && <input type="hidden" name="service_id" value={serviceId} />}
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="revalidate_path" value={revalidatePath} />
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {RATING_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            className="tappable"
            aria-label={`${value} estrellas`}
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-7 w-7 transition-colors ${value <= active ? "text-gold" : "text-border"}`}
              fill="currentColor"
              aria-hidden
            >
              <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79L1.58 7.62l5.82-.85L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={3}
        maxLength={2000}
        placeholder="Contanos tu experiencia (opcional)"
        className="field rounded-lg border border-border px-3 py-2"
      />
      {state.error !== null && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="tappable w-fit rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Publicar reseña
      </button>
    </form>
  );
}
