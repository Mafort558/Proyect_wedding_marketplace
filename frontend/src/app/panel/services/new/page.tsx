import { ServiceForm } from "@/app/panel/services/service-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Provider } from "@/lib/types";

export default async function NewServicePage() {
  await fetchAsProvider<Provider>("/api/providers/me");
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-strong">Nuevo servicio</h1>
      <ServiceForm service={null} />
    </section>
  );
}
