import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ArrowLeft, Check } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — MedClub Store` },
          { name: "description", content: loaderData.product.blurb },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-secondary to-background">
          <div className="text-9xl">
            {product.category === "Diagnostics" && "🩺"}
            {product.category === "Anatomy" && "🦴"}
            {product.category === "Apparel" && "🥼"}
            {product.category === "Stationery" && "📓"}
            {product.category === "Surgical" && "✂️"}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
          <div className="mt-4 text-2xl font-semibold text-foreground">${product.price}</div>
          <p className="mt-6 text-base text-muted-foreground">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {["Authentic, manufacturer-sourced", "Free campus pickup", "30-day club return policy"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex h-11 items-center rounded-md border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                add(product.id, qty);
                toast.success(`${qty} × ${product.name} added to cart`);
              }}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}