import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedding Marketplace",
  description: "Salones, catering y servicios para tu boda, con reserva y seña online",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Wedding Marketplace
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/venues" className="hover:underline">
                Salones
              </Link>
              {user !== null && (
                <>
                  {user.role === "provider" && (
                    <Link href="/panel" className="hover:underline">
                      Panel
                    </Link>
                  )}
                  <Link href="/bookings" className="hover:underline">
                    Mis reservas
                  </Link>
                  <span className="text-zinc-500">{user.full_name}</span>
                  <form action={logoutAction}>
                    <button type="submit" className="hover:underline">
                      Salir
                    </button>
                  </form>
                </>
              )}
              {user === null && (
                <>
                  <Link href="/login" className="hover:underline">
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
