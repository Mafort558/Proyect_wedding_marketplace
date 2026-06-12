import Link from "next/link";

import { DeleteButton } from "@/app/panel/delete-button";
import { deleteServiceAction } from "@/lib/actions/provider";
import { CATEGORY_LABELS } from "@/lib/labels";
import { fetchAsProvider } from "@/lib/provider";
import type { Service } from "@/lib/types";

export default async function PanelServicesPage() {
  const services = await fetchAsProvider<Service[]>("/api/providers/me/services");
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis servicios</h1>
        <Link
          href="/panel/services/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Nuevo servicio
        </Link>
      </div>
      {services.length === 0 && <p className="text-zinc-600">Todavía no cargaste servicios.</p>}
      <ul className="flex flex-col gap-4">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5"
          >
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-zinc-600">
                {CATEGORY_LABELS[service.category]} · ${service.price}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/panel/services/${service.id}`}
                className="rounded border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100"
              >
                Editar
              </Link>
              <DeleteButton action={deleteServiceAction.bind(null, service.id)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
