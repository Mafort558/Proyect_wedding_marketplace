import Link from "next/link";

import { DeleteButton } from "@/app/panel/delete-button";
import { deleteVenueAction } from "@/lib/actions/provider";
import { fetchAsProvider } from "@/lib/provider";
import type { Venue } from "@/lib/types";

export default async function PanelVenuesPage() {
  const venues = await fetchAsProvider<Venue[]>("/api/providers/me/venues");
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis salones</h1>
        <Link href="/panel/venues/new" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
          Nuevo salón
        </Link>
      </div>
      {venues.length === 0 && <p className="text-zinc-600">Todavía no cargaste salones.</p>}
      <ul className="flex flex-col gap-4">
        {venues.map((venue) => (
          <li
            key={venue.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5"
          >
            <div>
              <p className="font-medium">{venue.name}</p>
              <p className="text-sm text-zinc-600">
                {venue.city} · {venue.capacity} personas · ${venue.price} (seña ${venue.deposit_amount})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/panel/venues/${venue.id}`}
                className="rounded border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100"
              >
                Editar
              </Link>
              <DeleteButton action={deleteVenueAction.bind(null, venue.id)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
