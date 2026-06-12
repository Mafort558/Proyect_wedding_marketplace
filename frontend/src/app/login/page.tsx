import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect("/venues");
  }
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 py-12">
      <h1 className="text-2xl font-semibold">Ingresar</h1>
      <LoginForm />
      <p className="text-sm text-zinc-600">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="underline">
          Creala acá
        </Link>
      </p>
    </section>
  );
}
