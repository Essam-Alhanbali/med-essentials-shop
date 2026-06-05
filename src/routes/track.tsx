import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Check, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/price";

const searchSchema = z.object({ order: z.string().optional() });

export const Route = createFileRoute("/track")({
  validateSearch: searchSchema,
  component: TrackPage,
  head: () => ({ meta: [{ title: "Track Order — MedClub Store" }] }),
});

const STAGES = ["Order Placed", "Being Prepared", "Ready for Pickup", "Collected"] as const;

function statusToStage(status: string): number {
  switch (status) {
    case "Pending":
    case "Order Placed":
      return 0;
    case "Confirmed":
    case "Being Prepared":
      return 1;
    case "Ready for Pickup":
      return 2;
    case "Out for Delivery":
      return 2;
    case "Collected":
    case "Completed":
      return 3;
    default:
      return 0;
  }
}

function TrackPage() {
  const { order } = Route.useSearch();
  const [input, setInput] = useState(order ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  async function lookup(num: string) {
    if (!num.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const q = query(collection(db, "orders"), where("orderNumber", "==", num.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError("No order found with that number.");
      } else {
        const d = snap.docs[0];
        setResult({ id: d.id, ...d.data() });
      }
    } catch (e: any) {
      setError(e?.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (order) lookup(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const stage = result ? statusToStage(result.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Track your order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your order number (e.g. MC-2847) to see status.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(input);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="MC-XXXX"
          className="h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> {loading ? "Looking…" : "Look up"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 space-y-8">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
                <div className="text-lg font-semibold">{result.orderNumber}</div>
              </div>
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs">
                {result.status}
              </span>
            </div>

            <ol className="mt-6 grid grid-cols-4 gap-2">
              {STAGES.map((s, i) => {
                const active = i === stage;
                const done = i < stage;
                return (
                  <li key={s} className="flex flex-col items-center text-center">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                        done
                          ? "border-green-600 bg-green-600 text-white"
                          : active
                          ? "border-brand-red bg-brand-red text-white"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <div
                      className={`mt-2 text-[11px] leading-tight ${
                        active ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Order summary
            </h2>
            <ul className="mt-3 divide-y divide-border">
              {(result.items || []).map((it: any, i: number) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span>
                    {it.quantity} × {it.name}
                    {it.size && <span className="text-muted-foreground"> · {it.size}</span>}
                  </span>
                  <span className="font-medium">{formatPrice(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total</span>
              <span>{formatPrice(result.total)}</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pickup location
                </div>
                <div>Student Union, Room 204</div>
              </div>
              {result.readyDate && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estimated ready
                  </div>
                  <div>{result.readyDate}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/shop" className="text-sm text-primary hover:underline">
          Back to shop
        </Link>
      </div>
    </div>
  );
}