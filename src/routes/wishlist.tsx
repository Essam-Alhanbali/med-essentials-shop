import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist — MedClub Store" },
      { name: "description", content: "Items you've saved for later." },
    ],
  }),
});

function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <Heart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on any product to save it for later.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <button
          onClick={clear}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      </div>
      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {items.map((product) => (
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
                  <div className="mt-1 text-sm font-semibold">{formatPriceWrapper(product.price)}</div>
                </div>
                <button
                  onClick={() => remove(product.id)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex justify-end pt-3">
                <button
                  onClick={() => {
                    add(product.id);
                    toast.success(`${product.name} added to cart`);
                  }}
                  className="inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background hover:bg-primary"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}