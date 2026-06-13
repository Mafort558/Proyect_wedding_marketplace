import Link from "next/link";
import { notFound } from "next/navigation";

import { CoverPhoto } from "@/app/cover-photo";
import { JsonLd } from "@/app/json-ld";
import { ReviewStars } from "@/app/reviews/review-stars";
import { ApiError, apiFetch } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/labels";
import { getCurrentUser } from "@/lib/session";
import type { ProviderPublic } from "@/lib/types";

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

interface ProviderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProviderPageProps) {
  const { id } = await params;
  const provider = await fetchProvider(id);
  return { title: provider.business_name };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { id } = await params;
  const provider = await fetchProvider(id);
  const user = await getCurrentUser();
  const canContact = user !== null && user.id !== provider.user_id;
  const serviceNameById = new Map(provider.services.map((service) => [service.id, service.name]));
  return (
    <section className="flex flex-col gap-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: provider.business_name,
          description: provider.description,
          telephone: provider.phone === "" ? undefined : provider.phone,
          aggregateRating:
            provider.rating === null
              ? undefined
              : {
                  "@type": "AggregateRating",
                  ratingValue: provider.rating,
                  reviewCount: provider.review_count,
                },
        }}
      />
      <header className="animate-fade-up flex flex-col gap-4 rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">{CATEGORY_LABELS[provider.category]}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 011.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
            Proveedor verificado
          </span>
        </div>
        <h1 className="text-4xl font-semibold text-strong sm:text-5xl">{provider.business_name}</h1>
        {provider.rating !== null && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <ReviewStars rating={provider.rating} />
            <span className="font-medium text-strong">{provider.rating.toFixed(1)}</span>
            <span>
              · {provider.review_count} {provider.review_count === 1 ? "reseña" : "reseñas"}
            </span>
          </div>
        )}
        {provider.description !== "" && <p className="max-w-2xl leading-relaxed text-body">{provider.description}</p>}
        {provider.phone !== "" && (
          <p className="text-sm text-muted">
            Contacto: <span className="font-medium text-strong">{provider.phone}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {canContact && (
            <Link
              href={`/messages/${provider.user_id}`}
              className="tappable rounded-full bg-accent px-5 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              Enviar mensaje
            </Link>
          )}
          {provider.phone !== "" && (
            <a
              href={whatsappLink(provider.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="tappable rounded-full border border-emerald-500/40 px-5 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              WhatsApp
            </a>
          )}
        </div>
      </header>

      {provider.packages.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-strong">Paquetes</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {provider.packages.map((pkg, index) => (
              <li
                key={pkg.id}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
                className="reveal rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-strong">{pkg.name}</h3>
                  <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                    ${pkg.price}
                  </span>
                </div>
                {pkg.description !== "" && <p className="mt-2 text-sm leading-relaxed text-body">{pkg.description}</p>}
                <ul className="mt-3 flex flex-col gap-1 text-sm text-muted">
                  {pkg.service_ids.map((serviceId) => (
                    <li key={serviceId} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                      {serviceNameById.get(serviceId) ?? `Servicio #${serviceId}`}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {provider.venues.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-strong">Salones</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {provider.venues.map((venue, index) => (
              <li key={venue.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
                <Link
                  href={`/venues/${venue.id}`}
                  className="card-rise group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                >
                  <CoverPhoto src={venue.photos[0]} alt={venue.name} badge={`$${venue.price}`} />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-strong transition-colors group-hover:text-accent">{venue.name}</h3>
                    <p className="text-sm text-muted">
                      {venue.city} · hasta {venue.capacity} invitados
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {provider.services.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-strong">Servicios</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {provider.services.map((service, index) => (
              <li key={service.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 70}ms` }} className="reveal">
                <Link
                  href={`/services/${service.id}`}
                  className="card-rise group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                >
                  <CoverPhoto src={service.photos[0]} alt={service.name} badge={`$${service.price}`} />
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-accent">{CATEGORY_LABELS[service.category]}</p>
                    <h3 className="mt-1 text-lg font-semibold text-strong transition-colors group-hover:text-accent">{service.name}</h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {provider.venues.length === 0 && provider.services.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Sin publicaciones</p>
          <p className="mt-2 text-sm text-muted">Este proveedor todavía no cargó salones ni servicios.</p>
        </div>
      )}
    </section>
  );
}

async function fetchProvider(id: string): Promise<ProviderPublic> {
  try {
    return await apiFetch<ProviderPublic>(`/api/providers/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
