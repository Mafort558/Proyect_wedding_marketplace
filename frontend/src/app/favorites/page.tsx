import Link from "next/link";
import { redirect } from "next/navigation";

import { CoverPhoto } from "@/app/cover-photo";
import { FavoriteButton } from "@/app/favorite-button";
import { apiFetch } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/labels";
import { getSessionToken } from "@/lib/session";
import type { FavoriteList } from "@/lib/types";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const token = await getSessionToken();
  if (token === undefined) {
    redirect("/login");
  }
  const favorites = await apiFetch<FavoriteList>("/api/favorites", { token });
  const isEmpty = favorites.venues.length === 0 && favorites.services.length === 0;
  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Favoritos</h1>
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Todavía no guardaste nada</p>
          <p className="mt-2 text-sm text-muted">Tocá el corazón en un salón o servicio para guardarlo acá.</p>
          <Link
            href="/venues"
            className="tappable mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Explorar salones
          </Link>
        </div>
      )}
      {favorites.venues.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-strong">Salones</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {favorites.venues.map((venue, index) => (
              <li key={venue.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
                <div className="card-rise group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <FavoriteButton venueId={venue.id} initialFavorited />
                  <Link href={`/venues/${venue.id}`} className="block">
                    <CoverPhoto src={venue.photos[0]} alt={venue.name} badge={`$${venue.price}`} />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-strong transition-colors group-hover:text-accent">{venue.name}</h3>
                      <p className="text-sm text-muted">
                        {venue.city} · hasta {venue.capacity} invitados
                      </p>
                      <p className="mt-3 text-lg font-semibold text-accent">${venue.price}</p>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {favorites.services.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-strong">Servicios</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.services.map((service, index) => (
              <li key={service.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
                <div className="card-rise group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <FavoriteButton serviceId={service.id} initialFavorited />
                  <Link href={`/services/${service.id}`} className="block">
                    <CoverPhoto src={service.photos[0]} alt={service.name} badge={`$${service.price}`} />
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-widest text-accent">{CATEGORY_LABELS[service.category]}</p>
                      <h3 className="mt-1 text-lg font-semibold text-strong transition-colors group-hover:text-accent">{service.name}</h3>
                      <p className="mt-3 text-lg font-semibold text-accent">${service.price}</p>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
