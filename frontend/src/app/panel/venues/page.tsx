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
        <h1 className="text-3xl font-semibold text-strong">Mis salones</h1>
        <Link href="/panel/venues/new" className="tappable rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong">
          Nuevo salón
        </Link>
      </div>
      {venues.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
          <p className="font-display text-xl text-strong">Todavía no cargaste salones</p>
          <p className="mt-2 text-sm text-muted">Sumá tu primer salón para empezar a recibir reservas.</p>
          <Link
            href="/panel/venues/new"
            className="tappable mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Nuevo salón
          </Link>
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {venues.map((venue, index) => (
          <li
            key={venue.id}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${index * 60}ms` }}
            className="reveal card-rise flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div>
              <p className="font-medium text-strong">{venue.name}</p>
              <p className="text-sm text-muted">
                {venue.city} · {venue.capacity} personas · ${venue.price} (seña ${venue.deposit_amount})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/panel/venues/${venue.id}`}
                className="tappable rounded-lg border border-border px-4 py-1.5 text-sm text-body hover:border-accent hover:text-accent"
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
