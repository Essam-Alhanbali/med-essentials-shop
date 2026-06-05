import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useStore, type StoreProduct } from "@/context/StoreContext";

interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  add: (productId: string, qty?: number, size?: string) => void;
  remove: (productId: string, size?: string) => void;
  setQty: (productId: string, qty: number, size?: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  detailed: { product: StoreProduct; quantity: number; size?: string; unitPrice: number }[];
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "medclub.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { products } = useStore();

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
        if (!product) return null;
        const sizeInfo = i.size ? product.sizes?.find((s) => s.label === i.size) : undefined;
        const unitPrice = product.price + (sizeInfo?.priceDelta ?? 0);
        return { product, quantity: i.quantity, size: i.size, unitPrice };
      })
      .filter(Boolean) as { product: StoreProduct; quantity: number; size?: string; unitPrice: number }[];

    const sameKey = (a: CartItem, productId: string, size?: string) =>
      a.productId === productId && (a.size ?? "") === (size ?? "");

    return {
      items,
      add: (productId, qty = 1, size) =>
        setItems((prev) => {
          const existing = prev.find((i) => sameKey(i, productId, size));
          if (existing) {
            return prev.map((i) =>
              sameKey(i, productId, size) ? { ...i, quantity: i.quantity + qty } : i,
            );
          }
          return [...prev, { productId, quantity: qty, size }];
        }),
      remove: (productId, size) =>
        setItems((prev) => prev.filter((i) => !sameKey(i, productId, size))),
      setQty: (productId, qty, size) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => !sameKey(i, productId, size))
            : prev.map((i) => (sameKey(i, productId, size) ? { ...i, quantity: qty } : i)),
        ),
      clear: () => setItems([]),
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: detailed.reduce((s, d) => s + d.unitPrice * d.quantity, 0),
      detailed,
    };
  }, [items, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}