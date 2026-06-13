"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CART_EVENT, clearCart, readCart, removeFromCart, type CartItem } from "@/lib/cart";

const CURRENCY = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  const total = items.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="animate-fade-up text-3xl font-semibold text-strong sm:text-4xl">Mi carrito</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-strong">Tu carrito está vacío</p>
          <p className="mt-2 text-sm text-muted">Agregá servicios desde el catálogo para planear tu evento.</p>
          <Link
            href="/services"
            className="tappable mt-5 inline-block rounded-full bg-accent px-6 py-2.5 font-medium text-white shadow-md shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Ver servicios
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <Link href={`/services/${item.id}`} className="font-medium text-strong hover:text-accent">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/services/${item.id}`}
                    className="tappable rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-strong"
                  >
                    Reservar
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="tappable rounded-lg border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <p className="text-sm text-muted">Total estimado</p>
              <p className="text-2xl font-semibold text-strong">${CURRENCY.format(total)}</p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="tappable rounded-lg border border-border px-4 py-2 text-sm text-body hover:border-accent hover:text-accent"
            >
              Vaciar carrito
            </button>
          </div>
          <p className="text-sm text-muted">
            Reservá cada servicio por separado eligiendo la fecha de tu evento. El total es una estimación.
          </p>
        </>
      )}
    </section>
  );
}
