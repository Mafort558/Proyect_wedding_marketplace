import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/register/register-form";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect("/venues");
  }
  return (
    <section className="mx-auto grid w-full max-w-4xl animate-fade-up overflow-hidden rounded-3xl border border-border bg-surface shadow-sm md:grid-cols-2">
      <aside className="relative hidden flex-col justify-end overflow-hidden bg-gradient-to-br from-accent-strong via-accent to-[#3a1f28] p-10 text-white md:flex">
        <span className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-blob rounded-full bg-white/15" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 animate-blob rounded-full bg-gold/30 [animation-delay:5s]" />
        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight">Sumate al marketplace de eventos.</p>
          <p className="mt-3 text-sm text-white/80">Reservá como cliente o publicá tu salón y servicios como proveedor.</p>
        </div>
      </aside>
      <div className="flex flex-col gap-6 p-10">
        <h1 className="text-3xl font-semibold text-strong">Crear cuenta</h1>
        <RegisterForm />
        <p className="text-sm text-body">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
            Ingresá
          </Link>
        </p>
      </div>
    </section>
  );
}
