import { Link } from "@tanstack/react-router";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useStore } from "@/context/StoreContext";

export function CompareBar() {
  const { ids, remove, clear } = useCompare();
  const { products } = useStore();
  if (ids.length === 0) return null;
  const selected = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as any[];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <GitCompareArrows className="h-4 w-4" /> Compare ({selected.length}/3)
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
            >
              {p.name}
              <button
                onClick={() => remove(p.id)}
                className="grid h-4 w-4 place-items-center rounded-full hover:bg-accent"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
          <Link
            to="/compare"
            className="inline-flex h-9 items-center rounded-md bg-brand-red px-4 text-xs font-medium text-white hover:bg-brand-red/90"
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}