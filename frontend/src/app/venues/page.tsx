import Link from "next/link";

import { CoverPhoto } from "@/app/cover-photo";
import { apiFetch } from "@/lib/api";
import type { VenueList } from "@/lib/types";

const PAGE_SIZE = 20;

interface VenuesPageProps {
  searchParams: Promise<{ city?: string; min_capacity?: string; page?: string }>;
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const filters = await searchParams;
  const page = Math.max(Number(filters.page ?? "1"), 1);
  const venues = await apiFetch<VenueList>("/api/venues", {
    searchParams: {
      city: filters.city,
      min_capacity: filters.min_capacity,
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    },
  });
  const totalPages = Math.max(Math.ceil(venues.total / PAGE_SIZE), 1);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Salones</h1>
      <form method="GET" className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          Ciudad
          <input
            type="text"
            name="city"
            defaultValue={filters.city ?? ""}
            className="rounded border border-zinc-300 px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Capacidad mínima
          <input
            type="number"
            name="min_capacity"
            min={1}
            defaultValue={filters.min_capacity ?? ""}
            className="rounded border border-zinc-300 px-3 py-1.5"
          />
        </label>
        <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
          Filtrar
        </button>
      </form>
      {venues.items.length === 0 && <p className="text-zinc-600">No hay salones para esos filtros.</p>}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {venues.items.map((venue) => (
          <li key={venue.id}>
            <Link
              href={`/venues/${venue.id}`}
              className="block overflow-hidden rounded-lg border border-zinc-200 bg-white hover:border-zinc-400"
            >
              <CoverPhoto src={venue.photos[0]} alt={venue.name} />
              <div className="p-5">
                <h2 className="text-lg font-medium">{venue.name}</h2>
                <p className="text-sm text-zinc-600">
                  {venue.city} · hasta {venue.capacity} invitados
                </p>
                <p className="mt-2 font-medium">${venue.price}</p>
                <p className="text-sm text-zinc-500">Seña: ${venue.deposit_amount}</p>
              </div>
            </Link>
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
                  ? "rounded bg-zinc-900 px-3 py-1 text-white"
                  : "rounded border border-zinc-300 px-3 py-1 hover:border-zinc-500"
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
