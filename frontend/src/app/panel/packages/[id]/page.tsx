import { notFound } from "next/navigation";

import { PackageForm } from "@/app/panel/packages/package-form";
import { fetchAsProvider } from "@/lib/provider";
import type { PackageList, Service } from "@/lib/types";

interface EditPackagePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar paquete" };

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params;
  const packages = await fetchAsProvider<PackageList>("/api/packages/mine");
  const pkg = packages.items.find((item) => item.id === Number(id));
  if (pkg === undefined) {
    notFound();
  }
  const services = await fetchAsProvider<Service[]>("/api/providers/me/services");
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-strong">Editar paquete</h1>
      <PackageForm package={pkg} services={services} />
    </section>
  );
}
