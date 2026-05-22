import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const accentByCategory: Record<string, string> = {
  Diagnostics: "from-sky-50 to-white",
  Anatomy: "from-rose-50 to-white",
  Apparel: "from-slate-50 to-white",
  Stationery: "from-amber-50 to-white",
  Surgical: "from-emerald-50 to-white",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[0_10px_30px_-15px_rgb(25_120_229/0.25)]">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${
          accentByCategory[product.category] ?? "from-slate-50 to-white"
        }`}
      >
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
            {product.badge}
          </span>
        )}
        <div className="text-center font-semibold tracking-tight text-foreground/70">
          <div className="text-5xl">
            {product.category === "Diagnostics" && "🩺"}
            {product.category === "Anatomy" && "🦴"}
            {product.category === "Apparel" && "🥼"}
            {product.category === "Stationery" && "📓"}
            {product.category === "Surgical" && "✂️"}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.blurb}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">${product.price}</span>
          <button
            onClick={() => {
              add(product.id);
              toast.success(`${product.name} added to cart`);
            }}
            className="inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}