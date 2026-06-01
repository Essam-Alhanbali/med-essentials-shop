import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { useStore, type SiteImages } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/images")({
  component: ImagesAdminPage,
  head: () => ({ meta: [{ title: "Images — MedClub Admin" }] }),
});

function ImagesAdminPage() {
  const { site } = useStore();
  const [draft, setDraft] = useState<SiteImages>(site);
  useEffect(() => setDraft(site), [site]);

  async function save() {
    try { await setDoc(doc(db, "content", "site"), draft); toast.success("Site images saved"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminLayout title="Images" description="Global site images.">
      <div className="space-y-5 rounded-lg border border-border bg-card p-5">
        <ImageInput value={draft.logoUrl ?? ""} onChange={(url) => setDraft({ ...draft, logoUrl: url })} folder="site" label="Website logo (replaces the + icon)" />
        <ImageInput value={draft.poweredByLogoUrl ?? ""} onChange={(url) => setDraft({ ...draft, poweredByLogoUrl: url })} folder="site" label="Intro 'Powered by' logo" />
        <ImageInput value={draft.heroImageUrl ?? ""} onChange={(url) => setDraft({ ...draft, heroImageUrl: url })} folder="site" label="Homepage hero image" />
        <button onClick={save} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save changes</button>
      </div>
    </AdminLayout>
  );
}