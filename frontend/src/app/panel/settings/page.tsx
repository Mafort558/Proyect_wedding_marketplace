import Link from "next/link";

import { PasswordForm } from "@/app/panel/password-form";
import { ProfileForm } from "@/app/panel/profile-form";
import { fetchAsProvider } from "@/lib/provider";
import type { Provider } from "@/lib/types";

export const metadata = { title: "Configuración" };

export default async function PanelSettingsPage() {
  const profile = await fetchAsProvider<Provider>("/api/providers/me");
  return (
    <section className="flex flex-col gap-6">
      <div className="animate-fade-up flex items-center gap-3">
        <Link href="/panel" className="nav-link text-sm text-muted hover:text-accent">
          ← Panel
        </Link>
        <h1 className="text-3xl font-semibold text-strong">Configuración</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm profile={profile} />
        <PasswordForm />
      </div>
    </section>
  );
}
