import { notFound } from "next/navigation";

import { VenueForm } from "@/app/panel/venues/venue-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Venue } from "@/lib/types";

interface EditVenuePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const { id } = await params;
  const venues = await fetchAsProvider<Venue[]>("/api/providers/me/venues");
  const venue = venues.find((item) => item.id === Number(id));
  if (venue === undefined) {
    notFound();
  }
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editar salón</h1>
      <VenueForm venue={venue} />
    </section>
  );
}
