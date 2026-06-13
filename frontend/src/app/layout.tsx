import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { BackToTop } from "@/app/back-to-top";
import { CartLink } from "@/app/cart-link";
import { NotificationBell } from "@/app/notification-bell";
import { ScrollProgress } from "@/app/scroll-progress";
import { ScrollReveal } from "@/app/scroll-reveal";
import { ThemeToggle } from "@/app/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { getSiteUrl } from "@/lib/config";
import { fetchNotifications } from "@/lib/notifications";
import { getCurrentUser } from "@/lib/session";

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Bodas & Eventos",
    template: "%s · Bodas & Eventos",
  },
  description: "Salones, catering y servicios para bodas y todo tipo de eventos, con reserva y seña online",
  openGraph: {
    title: "Bodas & Eventos",
    description: "Salones, catering y servicios para bodas y todo tipo de eventos, con reserva y seña online",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#151013" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const notifications = user === null ? null : await fetchNotifications();
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <ScrollProgress />
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="group flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-accent-strong transition-colors hover:text-accent"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-gold transition-transform duration-500 group-hover:scale-150" />
              Bodas &amp; Eventos
            </Link>
            <div className="flex items-center gap-6 text-sm text-body">
              <Link href="/venues" className="nav-link transition-colors hover:text-accent">
                Salones
              </Link>
              <Link href="/services" className="nav-link transition-colors hover:text-accent">
                Servicios
              </Link>
              <CartLink />
              {user !== null && (
                <>
                  {user.role === "provider" && (
                    <Link href="/panel" className="nav-link transition-colors hover:text-accent">
                      Panel
                    </Link>
                  )}
                  <Link href="/favorites" className="nav-link transition-colors hover:text-accent">
                    Favoritos
                  </Link>
                  <Link href="/bookings" className="nav-link transition-colors hover:text-accent">
                    Mis reservas
                  </Link>
                  <Link href="/messages" className="nav-link transition-colors hover:text-accent">
                    Mensajes
                  </Link>
                  {notifications !== null && (
                    <NotificationBell notifications={notifications.items} unreadCount={notifications.unread_count} />
                  )}
                  <span className="hidden text-muted sm:inline">{user.full_name}</span>
                  <form action={logoutAction}>
                    <button type="submit" className="nav-link transition-colors hover:text-accent">
                      Salir
                    </button>
                  </form>
                </>
              )}
              {user === null && (
                <>
                  <Link href="/login" className="nav-link transition-colors hover:text-accent">
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="shimmer-btn tappable rounded-full bg-accent px-5 py-2 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
        <ScrollReveal />
        <BackToTop />
        <footer className="mt-10 border-t border-border bg-surface/40">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-accent-strong">
                <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                Bodas &amp; Eventos
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                Salones, catering y servicios para bodas y todo tipo de eventos, con reserva y seña online.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-strong">Explorar</p>
              <Link href="/venues" className="nav-link w-fit text-muted transition-colors hover:text-accent">
                Salones
              </Link>
              <Link href="/services" className="nav-link w-fit text-muted transition-colors hover:text-accent">
                Servicios
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-strong">Cuenta</p>
              <Link href="/login" className="nav-link w-fit text-muted transition-colors hover:text-accent">
                Ingresar
              </Link>
              <Link href="/register" className="nav-link w-fit text-muted transition-colors hover:text-accent">
                Crear cuenta
              </Link>
            </div>
          </div>
          <div className="border-t border-border">
            <div className="mx-auto w-full max-w-5xl px-6 py-5 text-xs text-muted">
              © {new Date().getFullYear()} Bodas &amp; Eventos. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
