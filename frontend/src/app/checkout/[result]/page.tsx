import Link from "next/link";
import { notFound } from "next/navigation";

interface CheckoutResultContent {
  title: string;
  message: string;
}

const RESULT_CONTENT: Record<string, CheckoutResultContent> = {
  success: {
    title: "¡Seña pagada!",
    message: "Tu pago fue aprobado. La reserva quedó asegurada y el salón ya no acepta otra reserva para tu fecha.",
  },
  pending: {
    title: "Pago en proceso",
    message: "Mercado Pago está procesando tu pago. Cuando se acredite, tu reserva va a figurar como seña pagada.",
  },
  failure: {
    title: "El pago no se completó",
    message: "Podés intentar de nuevo desde Mis reservas. Tu reserva sigue pendiente.",
  },
};

interface CheckoutResultPageProps {
  params: Promise<{ result: string }>;
}

export default async function CheckoutResultPage({ params }: CheckoutResultPageProps) {
  const { result } = await params;
  const content = RESULT_CONTENT[result];
  if (content === undefined) {
    notFound();
  }
  return (
    <section className="flex animate-fade-up flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-strong">{content.title}</h1>
      <p className="max-w-md text-body">{content.message}</p>
      <Link href="/bookings" className="shimmer-btn tappable rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-lg shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong">
        Ver mis reservas
      </Link>
    </section>
  );
}
