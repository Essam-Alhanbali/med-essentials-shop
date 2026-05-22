import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [{ title: "Cart — MedClub Store" }],
  }),
});

function CartPage() {
  const { detailed, setQty, remove, subtotal, clear } = useCart();
  const shipping = subtotal > 0 ? (subtotal > 75 ? 0 : 5) : 0;
  const total = subtotal + shipping;

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and add a few essentials to get started.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {detailed.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 p-5">
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-md bg-secondary text-3xl"
              >
                {product.category === "Diagnostics" && "🩺"}
                {product.category === "Anatomy" && "🦴"}
                {product.category === "Apparel" && "🥼"}
                {product.category === "Stationery" && "📓"}
                {product.category === "Surgical" && "✂️"}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </div>
                    <Link
                      to="/product/$id"
                      params={{ id: product.id }}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex h-9 items-center rounded-md border border-border">
                    <button
                      onClick={() => setQty(product.id, quantity - 1)}
                      className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => setQty(product.id, quantity + 1)}
                      className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-sm font-semibold">${(product.price * quantity).toFixed(2)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd>
            </div>
            {subtotal < 75 && (
              <p className="text-xs text-muted-foreground">
                Add ${(75 - subtotal).toFixed(2)} more for free shipping.
              </p>
            )}
            <div className="my-3 border-t border-border" />
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">${total.toFixed(2)}</dd>
            </div>
          </dl>
          <button className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Checkout
          </button>
          <button
            onClick={clear}
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear cart
          </button>
        </aside>
      </div>
    </div>
  );
}