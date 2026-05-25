import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { StatItem } from "@/context/StoreContext";

export function StatsEditor({
  stats,
  onChange,
}: {
  stats: StatItem[];
  onChange: (next: StatItem[]) => void;
}) {
  function update(i: number, patch: Partial<StatItem>) {
    onChange(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function remove(i: number) {
    onChange(stats.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= stats.length) return;
    const next = [...stats];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function add() {
    onChange([...stats, { label: "New", value: "0" }]);
  }

  return (
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={s.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <input
            value={s.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="Value"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
              aria-label="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
              aria-label="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent"
      >
        <Plus className="h-3.5 w-3.5" /> Add stat
      </button>
    </div>
  );
}