import Link from "next/link";

import { CoverPhoto } from "@/app/cover-photo";
import { FavoriteButton } from "@/app/favorite-button";
import { apiFetch } from "@/lib/api";
import { fetchFavoriteIds } from "@/lib/favorites";
import type { VenueList } from "@/lib/types";

export const metadata = { title: "Salones" };

const PAGE_SIZE = 20;

const SORT_OPTIONS = {
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  capacity_desc: "Mayor capacidad",
  recent: "Más recientes",
};

interface VenuesPageProps {
  searchParams: Promise<{
    city?: string;
    min_capacity?: string;
    q?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const filters = await searchParams;
  const page = Math.max(Number(filters.page ?? "1"), 1);
  const venues = await apiFetch<VenueList>("/api/venues", {
    searchParams: {
      city: filters.city,
      min_capacity: filters.min_capacity,
      q: filters.q,
      min_price: filters.min_price,
      max_price: filters.max_price,
      sort: filters.sort,
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    },
  });
  const favoriteIds = await fetchFavoriteIds();
  const favoriteVenues = new Set(favoriteIds.venue_ids);
  const totalPages = Math.max(Math.ceil(venues.total / PAGE_SIZE), 1);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Salones</h1>
      <form method="GET" className="sticky top-20 z-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface/95 p-5 shadow-sm backdrop-blur">
        <label className="flex flex-col gap-1 text-sm text-body">
          Buscar
          <input
            type="search"
            name="q"
            placeholder="Nombre, ciudad…"
            defaultValue={filters.q ?? ""}
            className="field rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Ciudad
          <input
            type="text"
            name="city"
            defaultValue={filters.city ?? ""}
            className="field rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Capacidad mínima
          <input
            type="number"
            name="min_capacity"
            min={1}
            defaultValue={filters.min_capacity ?? ""}
            className="field rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Precio mínimo
          <input
            type="number"
            name="min_price"
            min={0}
            defaultValue={filters.min_price ?? ""}
            className="field w-28 rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Precio máximo
          <input
            type="number"
            name="max_price"
            min={0}
            defaultValue={filters.max_price ?? ""}
            className="field w-28 rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Ordenar
          <select name="sort" defaultValue={filters.sort ?? ""} className="field rounded-lg border border-border px-3 py-1.5">
            <option value="">Relevancia</option>
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="tappable rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-strong">
          Filtrar
        </button>
      </form>
      {venues.total > 0 && (
        <p className="text-sm text-muted">
          {venues.total} {venues.total === 1 ? "salón" : "salones"}
        </p>
      )}
      {venues.items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Sin resultados</p>
          <p className="mt-2 text-sm text-muted">No hay salones para esos filtros. Probá ampliar la búsqueda.</p>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {venues.items.map((venue, index) => (
          <li key={venue.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
            <div className="card-rise group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <FavoriteButton venueId={venue.id} initialFavorited={favoriteVenues.has(venue.id)} />
              <Link href={`/venues/${venue.id}`} className="block">
                <CoverPhoto src={venue.photos[0]} alt={venue.name} badge={`$${venue.price}`} />
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-strong transition-colors group-hover:text-accent">{venue.name}</h2>
                  <p className="text-sm text-muted">
                    {venue.city} · hasta {venue.capacity} invitados
                  </p>
                  <p className="mt-3 text-lg font-semibold text-accent">${venue.price}</p>
                  <p className="text-sm text-muted">Seña: ${venue.deposit_amount}</p>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <nav className="flex gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={{ pathname: "/venues", query: { ...filters, page: String(pageNumber) } }}
              className={
                pageNumber === page
                  ? "tappable rounded-lg bg-accent px-3 py-1 text-white"
                  : "tappable rounded-lg border border-border px-3 py-1 text-body hover:border-accent hover:text-accent"
              }
            >
              {pageNumber}
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}
