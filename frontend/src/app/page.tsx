import Link from "next/link";

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
    <div className="flex flex-col gap-16 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
          Tu boda, tu cumpleaños, tu evento. Organizado por vos, de punta a punta.
        </h1>
        <p className="max-w-xl text-lg text-zinc-600">
          Todo lo que necesitás en un solo lugar: elegís el salón, armás los servicios a tu medida y
          reservás la fecha con seña online. Sin organizadora, sin comisiones ocultas.
        </p>
        <div className="flex gap-4">
          <Link href="/venues" className="rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700">
            Ver salones
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-zinc-300 px-6 py-3 hover:border-zinc-500"
          >
            Ver servicios
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-lg border border-zinc-200 bg-white p-6">
            <p className="text-sm font-medium text-zinc-400">{index + 1}</p>
            <h2 className="mt-1 text-lg font-medium">{step.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{step.detail}</p>
          </div>
        ))}
      </section>
      <section className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold">¿Tenés un salón o servicio de eventos?</h2>
        <p className="mx-auto mt-2 max-w-xl text-zinc-600">
          Publicá tu oferta, gestioná reservas y cobrá señas online. Llegá a clientes que están
          organizando su evento ahora mismo.
        </p>
        <Link
          href="/register"
          className="mt-5 inline-block rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700"
        >
          Registrate como proveedor
        </Link>
      </section>
    </div>
  );
}
