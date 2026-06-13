import Link from "next/link";

import { DeleteButton } from "@/app/panel/delete-button";
import { deletePackageAction } from "@/lib/actions/provider";
import { fetchAsProvider } from "@/lib/provider";
import type { PackageList } from "@/lib/types";

export const metadata = { title: "Mis paquetes" };

export default async function PanelPackagesPage() {
  const packages = await fetchAsProvider<PackageList>("/api/packages/mine");
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-strong">Mis paquetes</h1>
        <Link
          href="/panel/packages/new"
          className="tappable rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Nuevo paquete
        </Link>
      </div>
      {packages.items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
          <p className="font-display text-xl text-strong">Todavía no armaste paquetes</p>
          <p className="mt-2 text-sm text-muted">Combiná varios servicios en un combo con precio especial.</p>
          <Link
            href="/panel/packages/new"
            className="tappable mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Nuevo paquete
          </Link>
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {packages.items.map((pkg, index) => (
          <li
            key={pkg.id}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${index * 60}ms` }}
            className="reveal card-rise flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div>
              <p className="font-medium text-strong">{pkg.name}</p>
              <p className="text-sm text-muted">
                {pkg.service_ids.length} {pkg.service_ids.length === 1 ? "servicio" : "servicios"} · ${pkg.price}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/panel/packages/${pkg.id}`}
                className="tappable rounded-lg border border-border px-4 py-1.5 text-sm text-body hover:border-accent hover:text-accent"
              >
                Editar
              </Link>
              <DeleteButton action={deletePackageAction.bind(null, pkg.id)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
