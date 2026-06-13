"use client";

import { useEffect, useState } from "react";

import { CART_EVENT, addToCart, isInCart, removeFromCart, type CartItem } from "@/lib/cart";

interface AddToCartButtonProps {
  item: CartItem;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(isInCart(item.id));
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, [item.id]);

  const handleClick = () => {
    if (inCart) {
      removeFromCart(item.id);
      return;
    }
    addToCart(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={inCart}
      className={`tappable w-fit rounded-full px-6 py-2.5 font-medium transition-colors ${
        inCart
          ? "border border-accent bg-accent/10 text-accent"
          : "border border-border text-body hover:border-accent hover:text-accent"
      }`}
    >
      {inCart ? "Quitar del carrito" : "Agregar al carrito"}
    </button>
  );
}
