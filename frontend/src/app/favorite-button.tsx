"use client";

import { useState, useTransition } from "react";

import { toggleFavoriteAction } from "@/lib/actions/favorites";

interface FavoriteButtonProps {
  venueId?: number;
  serviceId?: number;
  initialFavorited: boolean;
  variant?: "icon" | "inline";
}

export function FavoriteButton({ venueId, serviceId, initialFavorited, variant = "icon" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    setFavorited((current) => !current);
    startTransition(async () => {
      const result = await toggleFavoriteAction({ venueId, serviceId });
      setFavorited(result);
    });
  }

  const heart = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.3 4.8 5.7 4.8c2 0 3.4 1.2 4.3 2.4.9-1.2 2.3-2.4 4.3-2.4 3.4 0 5.1 3.6 3.7 6.9C19.5 16.4 12 21 12 21z" />
    </svg>
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`tappable inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          favorited ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-body hover:border-accent hover:text-accent"
        }`}
      >
        {heart}
        {favorited ? "Guardado" : "Guardar"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`tappable absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50 ${
        favorited ? "text-rose-300" : "text-white"
      }`}
    >
      {heart}
    </button>
  );
}
