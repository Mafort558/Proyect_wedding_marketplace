import Image from "next/image";
import { notFound } from "next/navigation";

import { BookingForm } from "@/app/venues/[id]/booking-form";
import { ApiError, apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import type { Venue, VenueAvailability } from "@/lib/types";

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params;
  const venue = await fetchVenue(id);
  const availability = await apiFetch<VenueAvailability>(`/api/venues/${id}/availability`);
  const user = await getCurrentUser();
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">{venue.name}</h1>
        <p className="text-zinc-600">
          {venue.address}, {venue.city} · hasta {venue.capacity} invitados
        </p>
      </div>
      {venue.photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {venue.photos.map((photo) => (
            <li key={photo}>
              <Image
                src={photo}
                alt={venue.name}
                width={800}
                height={600}
                className="h-48 w-full rounded-lg object-cover"
              />
            </li>
          ))}
        </ul>
      )}
      {venue.description !== "" && <p className="max-w-2xl text-zinc-700">{venue.description}</p>}
      <div className="flex gap-8 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <p className="text-sm text-zinc-500">Precio</p>
          <p className="text-xl font-medium">${venue.price}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Seña para reservar</p>
          <p className="text-xl font-medium">${venue.deposit_amount}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Disponibilidad</h2>
        {availability.booked_dates.length === 0 && (
          <p className="text-zinc-600">Sin fechas ocupadas en el próximo año.</p>
        )}
        {availability.booked_dates.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {availability.booked_dates.map((bookedDate) => (
              <li key={bookedDate} className="rounded bg-red-50 px-3 py-1 text-sm text-red-700">
                {bookedDate}
              </li>
            ))}
          </ul>
        )}
      </div>
      <BookingForm venueId={venue.id} isAuthenticated={user !== null} bookedDates={availability.booked_dates} />
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
