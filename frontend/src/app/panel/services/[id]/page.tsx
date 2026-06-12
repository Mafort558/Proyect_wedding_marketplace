import { notFound } from "next/navigation";

import { ServiceForm } from "@/app/panel/services/service-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Service } from "@/lib/types";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const services = await fetchAsProvider<Service[]>("/api/providers/me/services");
  const service = services.find((item) => item.id === Number(id));
  if (service === undefined) {
    notFound();
  }
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editar servicio</h1>
      <ServiceForm service={service} />
    </section>
  );
}
