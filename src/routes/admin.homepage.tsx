import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { useStore, type HomeContent } from "@/context/StoreContext";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageAdminPage,
  head: () => ({ meta: [{ title: "Homepage — MedClub Admin" }] }),
});

function HomepageAdminPage() {
  const { home, products } = useStore();
  const [draft, setDraft] = useState<HomeContent>(home);
  useEffect(() => setDraft(home), [home]);

  async function save() {
    try { await setDoc(doc(db, "content", "home"), draft); toast.success("Homepage saved"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminLayout title="Homepage" description="Edit the hero and homepage stats.">
      <div className="space-y-6 rounded-lg border border-border bg-card p-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hero headline</span>
          <input value={draft.heroHeadline} onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
            className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hero subheadline</span>
          <textarea rows={3} value={draft.heroSubheadline} onChange={(e) => setDraft({ ...draft, heroSubheadline: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <ImageInput value={draft.heroImageUrl ?? ""} onChange={(url) => setDraft({ ...draft, heroImageUrl: url })} folder="homepage" label="Hero image" />
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stats</div>
          <div className="mt-2">
            <StatsEditor stats={draft.stats} onChange={(stats) => setDraft({ ...draft, stats })} />
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Feature highlights</div>
          <p className="mt-1 text-xs text-muted-foreground">The three blocks below the hero (shipping, warranty, pricing, etc.)</p>
          <div className="mt-2 space-y-2">
            {draft.features.map((f, i) => {
              const update = (patch: Partial<typeof f>) =>
                setDraft({ ...draft, features: draft.features.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) });
              const remove = () => setDraft({ ...draft, features: draft.features.filter((_, idx) => idx !== i) });
              const move = (dir: -1 | 1) => {
                const j = i + dir;
                if (j < 0 || j >= draft.features.length) return;
                const next = [...draft.features];
                [next[i], next[j]] = [next[j], next[i]];
                setDraft({ ...draft, features: next });
              };
              return (
                <div key={i} className="grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto]">
                  <input value={f.icon ?? ""} onChange={(e) => update({ icon: e.target.value })} placeholder="Icon"
                    className="h-10 rounded-md border border-border bg-background px-3 text-center text-lg" />
                  <input value={f.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
                  <input value={f.description} onChange={(e) => update({ description: e.target.value })} placeholder="Description"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={remove} className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setDraft({ ...draft, features: [...draft.features, { icon: "✨", title: "New", description: "" }] })}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent">
              <Plus className="h-3.5 w-3.5" /> Add feature
            </button>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Featured products</div>
          <p className="mt-1 text-xs text-muted-foreground">Pick which products appear in the "Featured this semester" section. Leave empty to auto-pick the first 6.</p>
          <div className="mt-2 max-h-72 space-y-1 overflow-auto rounded-md border border-border bg-background p-2">
            {products.length === 0 && <p className="p-2 text-xs text-muted-foreground">No products yet.</p>}
            {products.map((p) => {
              const selected = (draft.featuredProductIds ?? []).includes(p.id);
              const toggle = () => {
                const cur = draft.featuredProductIds ?? [];
                setDraft({
                  ...draft,
                  featuredProductIds: selected ? cur.filter((id) => id !== p.id) : [...cur, p.id],
                });
              };
              return (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
                  <input type="checkbox" checked={selected} onChange={toggle} className="h-4 w-4" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.category}</span>
                </label>
              );
            })}
          </div>
        </div>
        <button onClick={save} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save changes
        </button>
      </div>
    </AdminLayout>
  );
}