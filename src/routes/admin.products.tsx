import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageInput } from "@/components/admin/ImageInput";
import { useStore, type CategoryDoc, type StoreProduct, type ProductSize, type ProductVariant, YEAR_OPTIONS } from "@/context/StoreContext";
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
  images: string[];
  features: string[];
  sizes: ProductSize[];
  years: string[];
  variants: ProductVariant[];
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
  images: [],
  features: [],
  sizes: [],
  years: [],
  variants: [],
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
        images: form.images.filter((u) => u.trim()),
        features: form.features.map((f) => f.trim()).filter(Boolean),
        sizes: form.sizes
          .map((s) => ({ label: s.label.trim(), stock: Number(s.stock) || 0, priceDelta: Number(s.priceDelta) || 0 }))
          .filter((s) => s.label),
        years: form.years,
        variants: form.variants
          .map((v) => ({
            name: v.name.trim(),
            hex: v.hex || "#000000",
            price: v.price != null && !Number.isNaN(Number(v.price)) ? Number(v.price) : undefined,
            displayName: v.displayName?.trim() || undefined,
            images: (v.images ?? []).filter((u) => u.trim()),
          }))
          .filter((v) => v.name),
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
      images: p.images ?? [],
      features: p.features ?? [],
      sizes: p.sizes ?? [],
      years: p.years ?? [],
      variants: p.variants ?? [],
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
        images: editForm.images.filter((u) => u.trim()),
        features: editForm.features.map((f) => f.trim()).filter(Boolean),
        sizes: editForm.sizes
          .map((s) => ({ label: s.label.trim(), stock: Number(s.stock) || 0, priceDelta: Number(s.priceDelta) || 0 }))
          .filter((s) => s.label),
        years: editForm.years,
        variants: editForm.variants
          .map((v) => ({
            name: v.name.trim(),
            hex: v.hex || "#000000",
            price: v.price != null && !Number.isNaN(Number(v.price)) ? Number(v.price) : undefined,
            displayName: v.displayName?.trim() || undefined,
            images: (v.images ?? []).filter((u) => u.trim()),
          }))
          .filter((v) => v.name),
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
              label="Main product image"
            />
          </div>
          <div className="sm:col-span-2">
            <ImagesEditor
              images={form.images}
              onChange={(images) => setForm({ ...form, images })}
              label="Additional images (gallery)"
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
          <div className="sm:col-span-2">
            <FeaturesEditor
              features={form.features}
              onChange={(features) => setForm({ ...form, features })}
              label="Checked features (shown under product with ✓)"
            />
          </div>
          <div className="sm:col-span-2">
            <SizesEditor sizes={form.sizes} onChange={(sizes) => setForm({ ...form, sizes })} />
          </div>
          <div className="sm:col-span-2">
            <YearsEditor years={form.years} onChange={(years) => setForm({ ...form, years })} />
          </div>
          <div className="sm:col-span-2">
            <VariantsEditor variants={form.variants} onChange={(variants) => setForm({ ...form, variants })} />
          </div>
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
                <div className="sm:col-span-2">
                  <ImagesEditor
                    images={editForm.images}
                    onChange={(images) => setEditForm({ ...editForm, images })}
                    label="Additional images (gallery)"
                  />
                </div>
                <input value={editForm.blurb} onChange={(e) => setEditForm({ ...editForm, blurb: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2" placeholder="Blurb" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" placeholder="Description" />
                <div className="sm:col-span-2">
                  <FeaturesEditor
                    features={editForm.features}
                    onChange={(features) => setEditForm({ ...editForm, features })}
                    label="Checked features"
                  />
                </div>
                <div className="sm:col-span-2">
                  <SizesEditor sizes={editForm.sizes} onChange={(sizes) => setEditForm({ ...editForm, sizes })} />
                </div>
                <div className="sm:col-span-2">
                  <YearsEditor years={editForm.years} onChange={(years) => setEditForm({ ...editForm, years })} />
                </div>
                <div className="sm:col-span-2">
                  <VariantsEditor variants={editForm.variants} onChange={(variants) => setEditForm({ ...editForm, variants })} />
                </div>
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

function FeaturesEditor({
  features,
  onChange,
  label,
}: {
  features: string[];
  onChange: (next: string[]) => void;
  label: string;
}) {
  const update = (i: number, v: string) => onChange(features.map((f, idx) => (idx === i ? v : f)));
  const remove = (i: number) => onChange(features.filter((_, idx) => idx !== i));
  const add = () => onChange([...features, ""]);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 space-y-2">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-brand-red shrink-0" />
            <input
              value={f}
              onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. Free campus pickup"
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add check
        </button>
      </div>
    </div>
  );
}

function SizesEditor({ sizes, onChange }: { sizes: ProductSize[]; onChange: (next: ProductSize[]) => void }) {
  const update = (i: number, patch: Partial<ProductSize>) =>
    onChange(sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange(sizes.filter((_, idx) => idx !== i));
  const add = () => onChange([...sizes, { label: "", stock: 0, priceDelta: 0 }]);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Sizes / variants (leave empty if product has no sizes)
      </div>
      <div className="mt-2 space-y-2">
        {sizes.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_36px] gap-2">
            <input
              value={s.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (S, M, XXL, 42cm)"
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            />
            <input
              type="number"
              value={s.stock}
              onChange={(e) => update(i, { stock: Number(e.target.value) })}
              placeholder="Stock"
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            />
            <input
              type="number"
              step="0.001"
              value={s.priceDelta ?? 0}
              onChange={(e) => update(i, { priceDelta: Number(e.target.value) })}
              placeholder="+JOD"
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add size
        </button>
      </div>
    </div>
  );
}

function YearsEditor({ years, onChange }: { years: string[]; onChange: (next: string[]) => void }) {
  const toggle = (y: string) =>
    onChange(years.includes(y) ? years.filter((x) => x !== y) : [...years, y]);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recommended for year(s)
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "All Years"] as const).map((y) => {
          const active = years.includes(y);
          return (
            <button
              key={y}
              type="button"
              onClick={() => toggle(y)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ImagesEditor({
  images,
  onChange,
  label,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  label: string;
}) {
  const update = (i: number, v: string) => onChange(images.map((u, idx) => (idx === i ? v : u)));
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const add = (url: string) => onChange([...images, url]);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 space-y-2">
        {images.map((u, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <ImageInput value={u} onChange={(v) => update(i, v)} folder="products" label={`Image ${i + 1}`} />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-6 grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"
              aria-label="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => add("")}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add image
        </button>
      </div>
    </div>
  );
}

function VariantsEditor({
  variants,
  onChange,
}: {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}) {
  const update = (i: number, patch: Partial<ProductVariant>) =>
    onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => onChange(variants.filter((_, idx) => idx !== i));
  const add = () => onChange([...variants, { name: "", hex: "#a50908", images: [] }]);
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Color variants (first added = default)
      </div>
      <div className="mt-2 space-y-3">
        {variants.map((v, i) => (
          <div key={i} className="rounded-md border border-border bg-background/40 p-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={v.hex || "#000000"}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                aria-label="Color swatch"
              />
              <input
                value={v.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Color name (e.g. Midnight Blue)"
                className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid h-9 w-9 place-items-center rounded-md border border-border text-destructive hover:bg-accent"
                aria-label="Remove variant"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={v.displayName ?? ""}
                onChange={(e) => update(i, { displayName: e.target.value })}
                placeholder="Display name (optional)"
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              />
              <input
                type="number"
                step="0.001"
                value={v.price ?? ""}
                onChange={(e) =>
                  update(i, { price: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                placeholder="Price (JOD) — blank uses base"
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="mt-3">
              <ImagesEditor
                images={v.images ?? []}
                onChange={(images) => update(i, { images })}
                label="Variant photos"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add color variant
        </button>
      </div>
    </div>
  );
}