import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { useStore, type CategoryDoc, type StoreProduct } from "@/context/StoreContext";
import { formatPrice } from "@/lib/price";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
  head: () => ({ meta: [{ title: "Products — MedClub Admin" }] }),
});

type ProductForm = {
  name: string;
  category: string;
  subcategory: string;
  price: string;
  blurb: string;
  description: string;
  badge: string;
  imageUrl: string;
};

const empty = (firstCat: string): ProductForm => ({
  name: "",
  category: firstCat,
  subcategory: "",
  price: "",
  blurb: "",
  description: "",
  badge: "",
  imageUrl: "",
});

function ProductsAdminPage() {
  const { products, categoryDocs } = useStore();
  const [form, setForm] = useState<ProductForm>(() => empty(categoryDocs[0]?.name ?? ""));
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm | null>(null);

  const currentCat = categoryDocs.find((c) => c.name === form.category);
  const editCat = editForm ? categoryDocs.find((c) => c.name === editForm.category) : null;

  async function create() {
    if (!form.name.trim() || !form.category) {
      toast.error("Name and category are required");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "products"), {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory.trim() || null,
        price: Number(form.price) || 0,
        blurb: form.blurb.trim(),
        description: form.description.trim(),
        badge: form.badge.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
      });
      setForm(empty(categoryDocs[0]?.name ?? ""));
      toast.success("Product added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  function startEdit(p: StoreProduct) {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory ?? "",
      price: String(p.price ?? ""),
      blurb: p.blurb ?? "",
      description: p.description ?? "",
      badge: p.badge ?? "",
      imageUrl: p.imageUrl ?? "",
    });
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    try {
      await updateDoc(doc(db, "products", editingId), {
        name: editForm.name.trim(),
        category: editForm.category,
        subcategory: editForm.subcategory.trim() || null,
        price: Number(editForm.price) || 0,
        blurb: editForm.blurb.trim(),
        description: editForm.description.trim(),
        badge: editForm.badge.trim() || null,
        imageUrl: editForm.imageUrl.trim() || null,
      });
      setEditingId(null);
      setEditForm(null);
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  return (
    <AdminLayout title="Products" description="Add new products and manage existing ones.">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="text-sm font-semibold">Add new product</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Select category</option>
            {categoryDocs.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {currentCat && currentCat.subcategories.length > 0 && (
            <select
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">No subcategory</option>
              {currentCat.subcategories.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <input
            placeholder="Price (JOD)"
            type="number"
            step="0.001"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <input
            placeholder="Badge (optional)"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <ImageInput
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              folder="products"
              label="Product image"
            />
          </div>
          <input
            placeholder="Short blurb"
            value={form.blurb}
            onChange={(e) => setForm({ ...form, blurb: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="Full description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
          />
        </div>
        <button
          onClick={create}
          disabled={busy}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {busy ? "Saving…" : "Add product"}
        </button>
      </section>

      <section className="mt-8 space-y-3">
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-4">
            {editingId === p.id && editForm ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Name" />
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value, subcategory: "" })} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                  {categoryDocs.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {editCat && editCat.subcategories.length > 0 && (
                  <select value={editForm.subcategory} onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                    <option value="">No subcategory</option>
                    {editCat.subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                <input type="number" step="0.001" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Price" />
                <input value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2" placeholder="Badge" />
                <div className="sm:col-span-2">
                  <ImageInput value={editForm.imageUrl} onChange={(url) => setEditForm({ ...editForm, imageUrl: url })} folder="products" label="Product image" />
                </div>
                <input value={editForm.blurb} onChange={(e) => setEditForm({ ...editForm, blurb: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2" placeholder="Blurb" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" placeholder="Description" />
                <div className="flex gap-2 sm:col-span-2">
                  <button onClick={saveEdit} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button onClick={() => { setEditingId(null); setEditForm(null); }} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category}{p.subcategory ? ` › ${p.subcategory}` : ""} · {formatPrice(p.price)}{p.badge ? ` · ${p.badge}` : ""}
                  </div>
                </div>
                <button onClick={() => startEdit(p)} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-accent">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => remove(p.id)} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs text-destructive hover:bg-accent">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </AdminLayout>
  );
}

// avoid unused import warning if not used
export type _T = CategoryDoc;