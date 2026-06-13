import Image from "next/image";
import Link from "next/link";

import { CountUp } from "@/app/count-up";
import { HeroDecor } from "@/app/hero-decor";

const STATS = [
  { value: 120, suffix: "+", label: "Salones publicados" },
  { value: 350, suffix: "+", label: "Servicios disponibles" },
  { value: 8, suffix: "", label: "Rubros de eventos" },
  { value: 100, suffix: "%", label: "Reserva online" },
];

const STEPS = [
  {
    title: "Elegí el lugar",
    detail: "Salones, estancias y quintas con fotos, precios y disponibilidad real por fecha.",
  },
  {
    title: "Sumá los servicios",
    detail: "Catering, música, fotografía y ambientación. Armá tu evento como quieras, pieza por pieza.",
  },
  {
    title: "Reservá online",
    detail: "Asegurá la fecha pagando la seña con Mercado Pago. Sin llamados ni vueltas.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-black/10 px-6 py-32 text-center shadow-[0_30px_80px_-40px_rgba(140,47,67,0.45)]">
        <Image
          src="https://picsum.photos/seed/celebracion-evento/1600/1000"
          alt="Salón de eventos decorado"
          fill
          priority
          sizes="100vw"
          className="ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-[#2b0f18]/85" />
        <HeroDecor />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-7">
          <span className="animate-fade-up rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
            Bodas · Cumpleaños · Eventos
          </span>
          <h1 className="animate-fade-up text-balance text-5xl font-semibold leading-[1.05] text-white drop-shadow-lg sm:text-6xl [animation-delay:80ms]">
            Organizá tu evento, <span className="gradient-text">de punta a punta</span>.
          </h1>
          <p className="max-w-xl animate-fade-up text-lg leading-relaxed text-white/85 [animation-delay:160ms]">
            Todo en un solo lugar: elegís el salón, armás los servicios a tu medida y reservás la fecha
            con seña online. Sin organizadora, sin comisiones ocultas.
          </p>
          <div className="flex animate-fade-up flex-wrap justify-center gap-4 [animation-delay:240ms]">
            <Link
              href="/venues"
              className="shimmer-btn tappable rounded-full bg-accent px-8 py-3.5 font-medium text-white shadow-lg shadow-accent/40 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-xl"
            >
              Ver salones
            </Link>
            <Link
              href="/services"
              className="tappable rounded-full border border-white/40 bg-white/10 px-8 py-3.5 font-medium text-white backdrop-blur hover:-translate-y-0.5 hover:border-white hover:bg-white/20"
            >
              Ver servicios
            </Link>
          </div>
        </div>
        <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 animate-float text-white/70">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </section>
      <section className="flex flex-col gap-10">
        <div data-reveal className="reveal mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold text-strong sm:text-4xl">Tu evento en tres pasos</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
          <div
            key={step.title}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${index * 120}ms` }}
            className="reveal card-rise group rounded-2xl border border-border bg-surface p-8 shadow-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-strong font-display text-xl font-semibold text-white shadow-md shadow-accent/25 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              {index + 1}
            </span>
            <h2 className="mt-5 text-xl font-semibold text-strong">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">{step.detail}</p>
          </div>
          ))}
        </div>
      </section>
      <section data-reveal className="reveal grid grid-cols-2 gap-6 rounded-[2rem] border border-border bg-surface px-6 py-12 shadow-sm md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-4xl font-semibold gradient-text sm:text-5xl">
              <CountUp to={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </section>
      <section data-reveal className="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-900 to-[#3a1f28] px-8 py-16 text-center text-white shadow-2xl">
        <span className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 animate-blob rounded-full bg-accent/30" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-64 w-64 animate-blob rounded-full bg-gold/20 [animation-delay:6s]" />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">¿Tenés un salón o servicio de eventos?</h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-stone-300">
            Publicá tu oferta, gestioná reservas y cobrá señas online. Llegá a clientes que están
            organizando su evento ahora mismo.
          </p>
          <Link
            href="/register"
            className="shimmer-btn tappable mt-8 inline-block rounded-full bg-accent px-8 py-3.5 font-medium text-white shadow-lg shadow-accent/30 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Registrate como proveedor
          </Link>
        </div>
      </section>
    </div>
  );
}
