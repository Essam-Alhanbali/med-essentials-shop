import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { useStore, type AboutContent } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/about")({
  component: AboutAdminPage,
  head: () => ({ meta: [{ title: "About — MedClub Admin" }] }),
});

function AboutAdminPage() {
  const { about } = useStore();
  const [draft, setDraft] = useState<AboutContent>(about);
  useEffect(() => setDraft(about), [about]);

  async function save() {
    try { await setDoc(doc(db, "content", "about"), draft); toast.success("About saved"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminLayout title="About Us" description="Edit the About page content.">
      <div className="space-y-5 rounded-lg border border-border bg-card p-5">
        <Field label="Heading" value={draft.heading} onChange={(v) => setDraft({ ...draft, heading: v })} />
        <Field label="Intro paragraph" value={draft.intro} onChange={(v) => setDraft({ ...draft, intro: v })} multi />
        <Field label="Body paragraph" value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} multi />
        <Field label="Contact email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
        <Field label="Phone number" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
        <ImageInput value={draft.imageUrl ?? ""} onChange={(url) => setDraft({ ...draft, imageUrl: url })} folder="about" label="About image" />
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stats / Highlights</div>
          <div className="mt-2"><StatsEditor stats={draft.stats} onChange={(stats) => setDraft({ ...draft, stats })} /></div>
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
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
      )}
    </label>
  );
}