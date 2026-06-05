import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/site/ProductCard";

const searchSchema = z.object({
  category: z.string().optional(),
  year: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop — MedClub Store" },
      { name: "description", content: "Browse our full catalog of medical school essentials." },
    ],
  }),
});

type Sort = "featured" | "price-asc" | "price-desc" | "name";

function ShopPage() {
  const { category, year } = Route.useSearch();
  const { products, categoryDocs, getCategoryEmoji } = useStore();
  const [sort, setSort] = useState<Sort>("featured");
  const [active, setActive] = useState<string | undefined>(category);
  const [activeYear, setActiveYear] = useState<string | undefined>(year);
  const [storedYear, setStoredYear] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sy = localStorage.getItem("medclub.studentYear");
    if (sy) {
      setStoredYear(sy);
      if (!activeYear) setActiveYear(sy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = active ? products.filter((p) => p.category === active) : products;
    if (activeYear) {
      list = list.filter(
        (p) => p.years?.includes(activeYear) || p.years?.includes("All Years"),
      );
    }
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [active, sort, activeYear, products]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {storedYear && activeYear === storedYear && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/5 px-3 py-1 text-xs text-foreground">
          Showing for {storedYear} ·{" "}
          <button
            onClick={() => {
              localStorage.removeItem("medclub.studentYear");
              setStoredYear(null);
              setActiveYear(undefined);
            }}
            className="font-medium text-brand-red hover:underline"
          >
            Change
          </button>
        </div>
      )}
      <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {active ?? "All products"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} available
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[200px_1fr]">
        <aside>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Category</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <button
                onClick={() => setActive(undefined)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  !active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
            </li>
            {categoryDocs.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActive(c.name)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active === c.name
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="mr-1.5">{c.emoji || getCategoryEmoji(c.name)}</span>{c.name}
                </button>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-foreground">Your Year</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveYear(undefined)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                !activeYear
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              All
            </button>
            {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((y) => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  activeYear === y
                    ? "border-brand-red bg-brand-red text-white"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {y.replace("Year ", "Y")}
              </button>
            ))}
          </div>
        </aside>
        <div>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No products in this category yet.{" "}
              <Link to="/shop" className="text-primary hover:underline">
                View all
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}