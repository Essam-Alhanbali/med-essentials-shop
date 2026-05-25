import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import type { CategoryDoc } from "@/context/StoreContext";
import { CATEGORY_EMOJIS, DEFAULT_CATEGORY_EMOJI } from "@/lib/orderStatus";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdminPage,
  head: () => ({ meta: [{ title: "Categories — MedClub Admin" }] }),
});

function CategoriesAdminPage() {
  const [docs, setDocs] = useState<CategoryDoc[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "categories"), (snap) => {
      setDocs(snap.docs.map((d) => {
        const data = d.data() as Partial<CategoryDoc>;
        return {
          id: d.id,
          name: data.name ?? d.id,
          subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
          imageUrl: data.imageUrl,
          emoji: data.emoji,
        };
      }));
    });
  }, []);

  async function addCat() {
    const n = name.trim();
    if (!n) return;
    try {
      await addDoc(collection(db, "categories"), { name: n, subcategories: [], emoji: DEFAULT_CATEGORY_EMOJI });
      setName("");
      toast.success("Category added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <AdminLayout title="Categories" description="All categories are editable and deletable.">
      <div className="space-y-3">
        {docs.map((c) => <CategoryRow key={c.id} cat={c} />)}
        {docs.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name"
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm" />
        <button onClick={addCat} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </AdminLayout>
  );
}

function CategoryRow({ cat }: { cat: CategoryDoc }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [imageUrl, setImageUrl] = useState(cat.imageUrl ?? "");
  const [emoji, setEmoji] = useState(cat.emoji ?? DEFAULT_CATEGORY_EMOJI);
  const [newSub, setNewSub] = useState("");

  useEffect(() => {
    setName(cat.name);
    setImageUrl(cat.imageUrl ?? "");
    setEmoji(cat.emoji ?? DEFAULT_CATEGORY_EMOJI);
  }, [cat.id, cat.name, cat.imageUrl, cat.emoji]);

  async function save() {
    try {
      await updateDoc(doc(db, "categories", cat.id), {
        name: name.trim(),
        imageUrl: imageUrl.trim() || null,
        emoji: emoji || DEFAULT_CATEGORY_EMOJI,
      });
      setEditing(false);
      toast.success("Updated");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function remove() {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try { await deleteDoc(doc(db, "categories", cat.id)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function addSub() {
    const s = newSub.trim();
    if (!s) return;
    try { await updateDoc(doc(db, "categories", cat.id), { subcategories: arrayUnion(s) }); setNewSub(""); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function removeSub(s: string) {
    try { await updateDoc(doc(db, "categories", cat.id), { subcategories: arrayRemove(s) }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{cat.emoji ?? DEFAULT_CATEGORY_EMOJI}</span>
        {editing ? (
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm" />
        ) : (
          <span className="flex-1 text-sm font-medium">{cat.name}</span>
        )}
        {editing ? (
          <>
            <button onClick={save} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><Check className="h-4 w-4" /></button>
            <button onClick={() => setEditing(false)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><X className="h-4 w-4" /></button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={remove} className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /></button>
          </>
        )}
      </div>

      {editing && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Icon</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {CATEGORY_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`grid h-9 w-9 place-items-center rounded border text-lg ${emoji === e ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <ImageInput value={imageUrl} onChange={setImageUrl} folder={`categories/${cat.id}`} label="Category image" />
        </div>
      )}

      <div className="mt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subcategories</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {cat.subcategories.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs">
              {s}
              <button onClick={() => removeSub(s)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
          {cat.subcategories.length === 0 && <span className="text-xs text-muted-foreground">No subcategories.</span>}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add subcategory"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm" />
          <button onClick={addSub} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-accent">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}