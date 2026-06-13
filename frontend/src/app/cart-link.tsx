"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CART_EVENT, readCart } from "@/lib/cart";

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCart().length);
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  return (
    <Link href="/cart" className="nav-link relative transition-colors hover:text-accent">
      Carrito
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
