import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
        Organizá tu boda sin organizadora
      </h1>
      <p className="max-w-xl text-lg text-zinc-600">
        Salones, catering y servicios en un solo lugar. Reservá la fecha y pagá la seña online.
      </p>
      <Link
        href="/venues"
        className="rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700"
      >
        Ver salones
      </Link>
    </section>
  );
}
