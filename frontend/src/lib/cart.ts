export interface CartItem {
  id: number;
  name: string;
  price: string;
}

const CART_STORAGE_KEY = "cart";
export const CART_EVENT = "cart-change";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function isInCart(id: number): boolean {
  return readCart().some((item) => item.id === id);
}

export function addToCart(item: CartItem): void {
  const items = readCart();
  if (items.some((existing) => existing.id === item.id)) {
    return;
  }
  writeCart([...items, item]);
}

export function removeFromCart(id: number): void {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart(): void {
  writeCart([]);
}
