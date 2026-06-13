import { PackageForm } from "@/app/panel/packages/package-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Service } from "@/lib/types";

export const metadata = { title: "Nuevo paquete" };

export default async function NewPackagePage() {
  const services = await fetchAsProvider<Service[]>("/api/providers/me/services");
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-strong">Nuevo paquete</h1>
      <PackageForm package={null} services={services} />
    </section>
  );
}
