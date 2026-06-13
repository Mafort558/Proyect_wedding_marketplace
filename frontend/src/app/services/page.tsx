import Link from "next/link";

import { CoverPhoto } from "@/app/cover-photo";
import { FavoriteButton } from "@/app/favorite-button";
import { apiFetch } from "@/lib/api";
import { fetchFavoriteIds } from "@/lib/favorites";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { ServiceList } from "@/lib/types";

export const metadata = { title: "Servicios" };

const PAGE_SIZE = 20;

const SORT_OPTIONS = {
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  recent: "Más recientes",
};

interface ServicesPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const filters = await searchParams;
  const page = Math.max(Number(filters.page ?? "1"), 1);
  const services = await apiFetch<ServiceList>("/api/services", {
    searchParams: {
      category: filters.category,
      q: filters.q,
      min_price: filters.min_price,
      max_price: filters.max_price,
      sort: filters.sort,
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    },
  });
  const favoriteIds = await fetchFavoriteIds();
  const favoriteServices = new Set(favoriteIds.service_ids);
  const totalPages = Math.max(Math.ceil(services.total / PAGE_SIZE), 1);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Servicios</h1>
      <form method="GET" className="sticky top-20 z-10 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface/95 p-5 shadow-sm backdrop-blur">
        <label className="flex flex-col gap-1 text-sm text-body">
          Buscar
          <input
            type="search"
            name="q"
            placeholder="Nombre del servicio…"
            defaultValue={filters.q ?? ""}
            className="field rounded-lg border border-border px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-body">
          Rubro
          <select name="category" defaultValue={filters.category ?? ""} className="field rounded-lg border border-border px-3 py-1.5">
            <option value="">Todos</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
      {services.total > 0 && (
        <p className="text-sm text-muted">
          {services.total} {services.total === 1 ? "servicio" : "servicios"}
        </p>
      )}
      {services.items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Sin resultados</p>
          <p className="mt-2 text-sm text-muted">No hay servicios para ese rubro. Probá con otra categoría.</p>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((service, index) => (
          <li key={service.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
            <div className="card-rise group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <FavoriteButton serviceId={service.id} initialFavorited={favoriteServices.has(service.id)} />
              <Link href={`/services/${service.id}`} className="block">
                <CoverPhoto src={service.photos[0]} alt={service.name} badge={`$${service.price}`} />
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-widest text-accent">{CATEGORY_LABELS[service.category]}</p>
                  <h2 className="mt-1 text-lg font-semibold text-strong transition-colors group-hover:text-accent">{service.name}</h2>
                  {service.description !== "" && (
                    <p className="mt-1 text-sm leading-relaxed text-body">{service.description}</p>
                  )}
                  <p className="mt-3 text-lg font-semibold text-accent">${service.price}</p>
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
              href={{ pathname: "/services", query: { ...filters, page: String(pageNumber) } }}
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
