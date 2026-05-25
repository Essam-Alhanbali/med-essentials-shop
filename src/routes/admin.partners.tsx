import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { useStore, type Partner } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/partners")({
  component: PartnersAdminPage,
  head: () => ({ meta: [{ title: "Partners — MedClub Admin" }] }),
});

function PartnersAdminPage() {
  const { partners } = useStore();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  async function add() {
    if (!name.trim()) return toast.error("Name required");
    try {
      await addDoc(collection(db, "partners"), {
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
      });
      setName(""); setLogoUrl(""); setWebsiteUrl("");
      toast.success("Partner added");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminLayout title="Partners" description="These appear in the Sponsored By section on the homepage and the Partners section on About Us.">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="text-sm font-semibold">Add new partner</div>
        <div className="mt-4 grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Partner name"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL (optional)"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
          <ImageInput value={logoUrl} onChange={setLogoUrl} folder="partners" label="Logo image" />
          <button onClick={add} className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add partner
          </button>
        </div>
      </section>
      <section className="mt-8 space-y-3">
        {partners.length === 0 && <p className="text-sm text-muted-foreground">No partners yet.</p>}
        {partners.map((p) => <PartnerRow key={p.id} partner={p} />)}
      </section>
    </AdminLayout>
  );
}

function PartnerRow({ partner }: { partner: Partner }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(partner.name);
  const [logoUrl, setLogoUrl] = useState(partner.logoUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(partner.websiteUrl ?? "");

  async function save() {
    try {
      await updateDoc(doc(db, "partners", partner.id), {
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
      });
      setEditing(false);
      toast.success("Updated");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function remove() {
    if (!confirm(`Delete "${partner.name}"?`)) return;
    try { await deleteDoc(doc(db, "partners", partner.id)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {editing ? (
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" placeholder="Name" />
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" placeholder="Website URL" />
          <ImageInput value={logoUrl} onChange={setLogoUrl} folder="partners" label="Logo" />
          <div className="flex gap-2">
            <button onClick={save} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Check className="h-4 w-4" /> Save</button>
            <button onClick={() => setEditing(false)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent"><X className="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-16 w-24 overflow-hidden rounded-md bg-muted">
            {partner.logoUrl ? <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-contain" /> : <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No logo</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{partner.name}</div>
            {partner.websiteUrl && <a href={partner.websiteUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-primary hover:underline">{partner.websiteUrl}</a>}
          </div>
          <button onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-accent"><Pencil className="h-3.5 w-3.5" /> Edit</button>
          <button onClick={remove} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs text-destructive hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>
      )}
    </div>
  );
}