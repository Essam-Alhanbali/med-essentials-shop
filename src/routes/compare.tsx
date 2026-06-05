import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/price";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({ meta: [{ title: "Compare — MedClub Store" }] }),
});

function ComparePage() {
  const { ids, remove } = useCompare();
  const { products } = useStore();
  const { add } = useCart();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as any[];

  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  useEffect(() => {
    if (ids.length === 0) return;
    const q = query(collection(db, "reviews"), where("approved", "==", true));
    return onSnapshot(q, (snap) => {
      const map: Record<string, { sum: number; count: number }> = {};
      snap.docs.forEach((d) => {
        const r = d.data() as any;
        if (!ids.includes(r.productId)) return;
        map[r.productId] = map[r.productId] || { sum: 0, count: 0 };
        map[r.productId].sum += Number(r.rating || 0);
        map[r.productId].count += 1;
      });
      const out: Record<string, { avg: number; count: number }> = {};
      Object.entries(map).forEach(([k, v]) => (out[k] = { avg: v.sum / v.count, count: v.count }));
      setRatings(out);
    });
  }, [ids.join(",")]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">No products to compare</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add up to 3 products from the shop using the Compare checkbox.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (p: any) => React.ReactNode }[] = [
    {
      label: "",
      render: (p) => (
        <div className="relative">
          <button
            onClick={() => remove(p.id)}
            className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-muted-foreground shadow hover:text-destructive"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-md bg-secondary p-3">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-5xl">📦</div>
            )}
          </div>
        </div>
      ),
    },
    { label: "Name", render: (p) => <div className="font-semibold">{p.name}</div> },
    { label: "Category", render: (p) => <div className="text-sm text-muted-foreground">{p.category}</div> },
    { label: "Price", render: (p) => <div className="text-base font-semibold">{formatPrice(p.price)}</div> },
    {
      label: "Rating",
      render: (p) => {
        const r = ratings[p.id];
        if (!r) return <span className="text-sm text-muted-foreground">No reviews</span>;
        return (
          <span className="text-sm">
            {"★".repeat(Math.round(r.avg))}
            {"☆".repeat(5 - Math.round(r.avg))}{" "}
            <span className="text-muted-foreground">({r.count})</span>
          </span>
        );
      },
    },
    {
      label: "Description",
      render: (p) => (
        <p className="text-xs text-muted-foreground line-clamp-6">{p.description || p.blurb}</p>
      ),
    },
    {
      label: "Stock",
      render: (p) => {
        if (!p.sizes?.length) return <span className="text-sm text-green-600">Available</span>;
        const total = p.sizes.reduce((s: number, x: any) => s + (x.stock || 0), 0);
        return total > 0 ? (
          <span className="text-sm text-green-600">In stock</span>
        ) : (
          <span className="text-sm text-destructive">Out of stock</span>
        );
      },
    },
    {
      label: "",
      render: (p) =>
        p.sizes?.length ? (
          <Link
            to="/product/$id"
            params={{ id: p.id }}
            className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent"
          >
            Choose size
          </Link>
        ) : (
          <button
            onClick={() => {
              add(p.id, 1);
              toast.success(`${p.name} added to cart`);
            }}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add to cart
          </button>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Compare products</h1>
      <p className="mt-1 text-sm text-muted-foreground">Side-by-side specs for the items you selected.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="w-32 py-4 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground align-top">
                  {row.label}
                </td>
                {items.map((p) => (
                  <td key={p.id} className="w-64 px-3 py-4 align-top">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}