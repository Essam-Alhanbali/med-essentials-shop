import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useStore, type FooterContent } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/footer")({
  component: FooterAdminPage,
  head: () => ({ meta: [{ title: "Footer — MedClub Admin" }] }),
});

function FooterAdminPage() {
  const { footer, categoryDocs } = useStore();
  const [draft, setDraft] = useState<FooterContent>(footer);
  useEffect(() => setDraft(footer), [footer]);

  async function save() {
    try { await setDoc(doc(db, "content", "footer"), draft); toast.success("Footer saved"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  function toggleCat(id: string) {
    const has = draft.shopCategoryIds.includes(id);
    if (has) setDraft({ ...draft, shopCategoryIds: draft.shopCategoryIds.filter((x) => x !== id) });
    else if (draft.shopCategoryIds.length < 5) setDraft({ ...draft, shopCategoryIds: [...draft.shopCategoryIds, id] });
    else toast.error("Max 5 categories");
  }

  return (
    <AdminLayout title="Footer" description="Edit footer content. Use {year} for current year.">
      <div className="space-y-5 rounded-lg border border-border bg-card p-5">
        <Field label="Tagline" value={draft.tagline} onChange={(v) => setDraft({ ...draft, tagline: v })} multi />
        <Field label="Contact email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
        <Field label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
        <Field label="Bottom-left copyright (use {year})" value={draft.copyright} onChange={(v) => setDraft({ ...draft, copyright: v })} />
        <Field label="Bottom-right text" value={draft.bottomRight} onChange={(v) => setDraft({ ...draft, bottomRight: v })} />
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Shop links (max 5)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryDocs.map((c) => {
              const checked = draft.shopCategoryIds.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggleCat(c.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${checked ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent"}`}>
                  <span>{c.emoji ?? "📦"}</span> {c.name}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={save} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save changes</button>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, multi }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {multi ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
      )}
    </label>
  );
}