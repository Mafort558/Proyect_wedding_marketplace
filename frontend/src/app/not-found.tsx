import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex animate-fade-up flex-col items-center gap-5 py-28 text-center">
      <p className="gradient-text font-display text-7xl font-semibold">404</p>
      <h1 className="text-2xl font-semibold text-strong">No encontramos lo que buscás</h1>
      <Link
        href="/venues"
        className="shimmer-btn tappable rounded-full bg-accent px-7 py-3 font-medium text-white shadow-lg shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
      >
        Volver al catálogo
      </Link>
    </section>
  );
}
