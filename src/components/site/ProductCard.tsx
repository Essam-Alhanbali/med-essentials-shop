import { Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useStore, type StoreProduct } from "@/context/StoreContext";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";

const accentByCategory: Record<string, string> = {
  Diagnostics: "from-sky-50 to-white",
  Anatomy: "from-rose-50 to-white",
  Apparel: "from-slate-50 to-white",
  Stationery: "from-amber-50 to-white",
  Surgical: "from-emerald-50 to-white",
};

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { getCategoryEmoji } = useStore();
  const wished = has(product.id);

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
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
            toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-primary"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center font-semibold tracking-tight text-foreground/70">
            <div className="text-5xl">{getCategoryEmoji(product.category)}</div>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <span>{getCategoryEmoji(product.category)}</span> {product.category}
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.blurb}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">{formatPrice(product.price)}</span>
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