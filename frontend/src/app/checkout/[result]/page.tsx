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
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{content.title}</h1>
      <p className="max-w-md text-zinc-600">{content.message}</p>
      <Link href="/bookings" className="rounded-full bg-zinc-900 px-6 py-2.5 text-white hover:bg-zinc-700">
        Ver mis reservas
      </Link>
    </section>
  );
}
