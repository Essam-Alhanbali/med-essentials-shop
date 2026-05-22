import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  detailed: { product: Product; quantity: number }[];
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "medclub.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const detailed = items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId);
        return product ? { product, quantity: i.quantity } : null;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];

    return {
      items,
      add: (productId, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            return prev.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
            );
          }
          return [...prev, { productId, quantity: qty }];
        }),
      remove: (productId) =>
        setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        ),
      clear: () => setItems([]),
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: detailed.reduce((s, d) => s + d.product.price * d.quantity, 0),
      detailed,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}