import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { useStore, type HomeContent } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageAdminPage,
  head: () => ({ meta: [{ title: "Homepage — MedClub Admin" }] }),
});

function HomepageAdminPage() {
  const { home } = useStore();
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
        <button onClick={save} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save changes
        </button>
      </div>
    </AdminLayout>
  );
}