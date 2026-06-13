import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/app/favorite-button";
import { JsonLd } from "@/app/json-ld";
import { BookingForm } from "@/app/venues/[id]/booking-form";
import { ReviewsSection } from "@/app/reviews/reviews-section";
import { ApiError, apiFetch } from "@/lib/api";
import { fetchFavoriteIds } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/session";
import type { Venue, VenueAvailability } from "@/lib/types";

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VenueDetailPageProps) {
  const { id } = await params;
  const venue = await fetchVenue(id);
  return { title: venue.name };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params;
  const venue = await fetchVenue(id);
  const availability = await apiFetch<VenueAvailability>(`/api/venues/${id}/availability`);
  const user = await getCurrentUser();
  const favoriteIds = await fetchFavoriteIds();
  return (
    <section className="flex flex-col gap-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EventVenue",
          name: venue.name,
          description: venue.description,
          maximumAttendeeCapacity: venue.capacity,
          address: {
            "@type": "PostalAddress",
            streetAddress: venue.address,
            addressLocality: venue.city,
            addressCountry: "AR",
          },
          image: venue.photos,
        }}
      />
      <div className="animate-fade-up flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-strong sm:text-5xl">{venue.name}</h1>
          <p className="mt-2 text-muted">
            {venue.address}, {venue.city} · hasta {venue.capacity} invitados
          </p>
          <Link
            href={`/providers/${venue.provider_id}`}
            className="nav-link mt-2 inline-block w-fit text-sm font-medium text-accent hover:text-accent-strong"
          >
            Ver perfil del proveedor
          </Link>
        </div>
        {user !== null && (
          <FavoriteButton venueId={venue.id} initialFavorited={favoriteIds.venue_ids.includes(venue.id)} variant="inline" />
        )}
      </div>
      {venue.photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {venue.photos.map((photo, index) => (
            <li
              key={photo}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
              className="reveal group overflow-hidden rounded-2xl shadow-sm"
            >
              <Image
                src={photo}
                alt={venue.name}
                width={800}
                height={600}
                className="h-52 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </li>
          ))}
        </ul>
      )}
      {venue.description !== "" && <p className="max-w-2xl leading-relaxed text-body">{venue.description}</p>}
      <div className="flex flex-wrap items-stretch gap-4">
        <div className="flex-1 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-muted">Precio</p>
          <p className="mt-1 text-3xl font-semibold text-strong">${venue.price}</p>
        </div>
        <div className="flex-1 rounded-2xl border border-accent/20 bg-gradient-to-br from-rose-50 to-amber-50/60 p-6 shadow-sm dark:from-accent/15 dark:to-gold/10">
          <p className="text-sm font-medium text-accent">Seña para reservar</p>
          <p className="mt-1 text-3xl font-semibold text-accent-strong">${venue.deposit_amount}</p>
        </div>
      </div>
      <BookingForm venueId={venue.id} isAuthenticated={user !== null} bookedDates={availability.booked_dates} />
      <ReviewsSection venueId={venue.id} isAuthenticated={user !== null} revalidatePath={`/venues/${venue.id}`} />
    </section>
  );
}

async function fetchVenue(id: string): Promise<Venue> {
  try {
    return await apiFetch<Venue>(`/api/venues/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
