import { VenueForm } from "@/app/panel/venues/venue-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Provider } from "@/lib/types";

export default async function NewVenuePage() {
  await fetchAsProvider<Provider>("/api/providers/me");
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nuevo salón</h1>
      <VenueForm venue={null} />
    </section>
  );
}
