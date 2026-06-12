import Link from "next/link";

import { CoverPhoto } from "@/app/cover-photo";
import { apiFetch } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { ServiceList } from "@/lib/types";

const PAGE_SIZE = 20;

interface ServicesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const filters = await searchParams;
  const page = Math.max(Number(filters.page ?? "1"), 1);
  const services = await apiFetch<ServiceList>("/api/services", {
    searchParams: {
      category: filters.category,
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    },
  });
  const totalPages = Math.max(Math.ceil(services.total / PAGE_SIZE), 1);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Servicios</h1>
      <form method="GET" className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          Rubro
          <select name="category" defaultValue={filters.category ?? ""} className="rounded border border-zinc-300 px-3 py-1.5">
            <option value="">Todos</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
          Filtrar
        </button>
      </form>
      {services.items.length === 0 && <p className="text-zinc-600">No hay servicios para ese rubro.</p>}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((service) => (
          <li key={service.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <CoverPhoto src={service.photos[0]} alt={service.name} />
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{CATEGORY_LABELS[service.category]}</p>
              <h2 className="text-lg font-medium">{service.name}</h2>
              {service.description !== "" && (
                <p className="mt-1 text-sm text-zinc-600">{service.description}</p>
              )}
              <p className="mt-2 font-medium">${service.price}</p>
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
