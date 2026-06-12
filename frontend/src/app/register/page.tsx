import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/register/register-form";
import { getCurrentUser } from "@/lib/session";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect("/venues");
  }
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 py-12">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <RegisterForm />
      <p className="text-sm text-zinc-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="underline">
          Ingresá
        </Link>
      </p>
    </section>
  );
}
