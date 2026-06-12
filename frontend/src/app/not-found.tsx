import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">No encontramos lo que buscás</h1>
      <Link href="/venues" className="underline">
        Volver al catálogo
      </Link>
    </section>
  );
}
