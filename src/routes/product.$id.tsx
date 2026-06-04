import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ArrowLeft, Check, ZoomIn, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";
import { getImageUrl, getImageSrcSet } from "@/lib/getImageUrl";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  head: () => ({ meta: [{ title: "Product — MedClub Store" }] }),
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
  const { id } = Route.useParams();
  const { getProduct, getCategoryEmoji } = useStore();
  const product = getProduct(id);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <button
          type="button"
          onClick={() => product.imageUrl && setZoomOpen(true)}
          className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary to-background p-4 sm:p-6"
          aria-label="Zoom image"
        >
          {product.imageUrl ? (
            <>
              <img
                src={getImageUrl(product.imageUrl, { w: 960, fit: "inside" })}
                srcSet={getImageSrcSet(product.imageUrl, [640, 960, 1200], { fit: "inside" })}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={product.name}
                width={1200}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
                <ZoomIn className="h-3.5 w-3.5" /> Click to zoom
              </span>
            </>
          ) : (
            <div className="text-9xl">{getCategoryEmoji(product.category)}</div>
          )}
        </button>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{product.name}</h1>
          <div className="mt-4 text-2xl font-semibold text-foreground">{formatPrice(product.price)}</div>
          <p className="mt-6 text-base text-muted-foreground">{product.description}</p>

          {product.features && product.features.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-red" />
                  {f}
                </li>
              ))}
            </ul>
          )}

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

      {zoomOpen && product.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={getImageUrl(product.imageUrl, { w: 1600, fit: "inside" })}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}