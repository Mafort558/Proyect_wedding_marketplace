import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/app/add-to-cart-button";
import { FavoriteButton } from "@/app/favorite-button";
import { JsonLd } from "@/app/json-ld";
import { ServiceBookingForm } from "@/app/services/[id]/service-booking-form";
import { ReviewsSection } from "@/app/reviews/reviews-section";
import { ApiError, apiFetch } from "@/lib/api";
import { fetchFavoriteIds } from "@/lib/favorites";
import { CATEGORY_LABELS } from "@/lib/labels";
import { getCurrentUser } from "@/lib/session";
import type { Service } from "@/lib/types";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  const service = await fetchService(id);
  return { title: service.name };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  const service = await fetchService(id);
  const user = await getCurrentUser();
  const favoriteIds = await fetchFavoriteIds();
  return (
    <section className="flex flex-col gap-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: service.name,
          description: service.description,
          category: CATEGORY_LABELS[service.category],
          image: service.photos,
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <div className="animate-fade-up flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">{CATEGORY_LABELS[service.category]}</p>
          <h1 className="mt-1 text-4xl font-semibold text-strong sm:text-5xl">{service.name}</h1>
          <Link
            href={`/providers/${service.provider_id}`}
            className="nav-link mt-2 inline-block w-fit text-sm font-medium text-accent hover:text-accent-strong"
          >
            Ver perfil del proveedor
          </Link>
        </div>
        {user !== null && (
          <FavoriteButton serviceId={service.id} initialFavorited={favoriteIds.service_ids.includes(service.id)} variant="inline" />
        )}
      </div>
      {service.photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {service.photos.map((photo, index) => (
            <li
              key={photo}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
              className="reveal group overflow-hidden rounded-2xl shadow-sm"
            >
              <Image
                src={photo}
                alt={service.name}
                width={800}
                height={600}
                className="h-52 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </li>
          ))}
        </ul>
      )}
      {service.description !== "" && <p className="max-w-2xl leading-relaxed text-body">{service.description}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm text-muted">Precio</p>
            <p className="mt-1 text-3xl font-semibold text-strong">${service.price}</p>
          </div>
          <AddToCartButton item={{ id: service.id, name: service.name, price: service.price }} />
          <Link
            href="/services"
            className="tappable w-fit rounded-full border border-border px-6 py-2.5 font-medium text-body hover:border-accent hover:text-accent"
          >
            Volver al catálogo
          </Link>
        </div>
        <ServiceBookingForm serviceId={service.id} isAuthenticated={user !== null} />
      </div>
      <ReviewsSection
        serviceId={service.id}
        isAuthenticated={user !== null}
        revalidatePath={`/services/${service.id}`}
      />
    </section>
  );
}

async function fetchService(id: string): Promise<Service> {
  try {
    return await apiFetch<Service>(`/api/services/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
