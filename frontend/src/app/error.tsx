"use client";

interface ErrorProps {
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <section className="flex flex-col items-center gap-5 py-24 text-center">
      <p className="font-display text-6xl font-semibold gradient-text">Ups</p>
      <h1 className="text-2xl font-semibold text-strong">Algo salió mal</h1>
      <p className="max-w-md text-muted">No pudimos cargar esta sección. Probá de nuevo en un momento.</p>
      <button
        type="button"
        onClick={reset}
        className="shimmer-btn tappable rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
      >
        Reintentar
      </button>
    </section>
  );
}
