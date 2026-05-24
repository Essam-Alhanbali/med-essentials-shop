import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Pencil, Check, X, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore, type CategoryDoc, type FooterContent, type AboutContent, type StoreProduct } from "@/context/StoreContext";
import { db } from "@/lib/firebase";
import { categories as seedCategories } from "@/data/products";
import { uploadImageFile } from "@/lib/uploadImage";
import { formatPrice } from "@/lib/price";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MedClub Store" }] }),
});

function AdminPage() {
  const { user, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const { products, categoryDocs, about, footer } = useStore();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [user, loading, navigate]);

  // Auto-seed default categories on first admin visit if none exist.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        if (snap.empty) {
          await Promise.all(
            (seedCategories as string[]).map((name) =>
              addDoc(collection(db, "categories"), { name, subcategories: [] })
            )
          );
        }
      } catch {}
    })();
  }, [user]);

  if (loading || !user) {
    return <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <button
          onClick={() => signOutUser()}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      <CategoriesSection categoryDocs={categoryDocs} />
      <ProductsSection products={products} categoryDocs={categoryDocs} />
      <AboutSection about={about} />
      <FooterSection footer={footer} />
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* -------------------- Categories -------------------- */

function CategoriesSection({ categoryDocs }: { categoryDocs: CategoryDoc[] }) {
  const [docs, setDocs] = useState<CategoryDoc[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "categories"), (snap) => {
      setDocs(
        snap.docs.map((d) => {
          const data = d.data() as Partial<CategoryDoc>;
          return {
            id: d.id,
            name: (data.name as string) ?? d.id,
            subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
            imageUrl: data.imageUrl,
          };
        })
      );
    });
  }, []);

  async function addCat() {
    const n = name.trim();
    if (!n) return;
    if (docs.some((d) => d.name.toLowerCase() === n.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    try {
      await addDoc(collection(db, "categories"), { name: n, subcategories: [] });
      setName("");
      toast.success("Category added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add category");
    }
  }

  return (
    <Section title="Categories" desc="Manage every category, including the original defaults. Add subcategories to organize products.">
      <div className="space-y-3">
        {docs.map((c) => (
          <CategoryRow key={c.id} cat={c} />
        ))}
        {docs.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet. Add your first below.</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={addCat}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </Section>
  );
}

function CategoryRow({ cat }: { cat: CategoryDoc }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [imageUrl, setImageUrl] = useState(cat.imageUrl ?? "");
  const [newSub, setNewSub] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(cat.name);
    setImageUrl(cat.imageUrl ?? "");
  }, [cat.id, cat.name, cat.imageUrl]);

  async function save() {
    const n = name.trim();
    if (!n) return;
    try {
      await updateDoc(doc(db, "categories", cat.id), {
        name: n,
        imageUrl: imageUrl.trim() || null,
      });
      setEditing(false);
      toast.success("Category updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    }
  }

  async function remove() {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "categories", cat.id));
      toast.success("Category deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  async function addSub() {
    const s = newSub.trim();
    if (!s) return;
    if (cat.subcategories.includes(s)) {
      toast.error("Subcategory already exists");
      return;
    }
    try {
      await updateDoc(doc(db, "categories", cat.id), { subcategories: arrayUnion(s) });
      setNewSub("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add subcategory");
    }
  }

  async function removeSub(s: string) {
    try {
      await updateDoc(doc(db, "categories", cat.id), { subcategories: arrayRemove(s) });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to remove");
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(f, `categories/${cat.id}`);
      setImageUrl(url);
      await updateDoc(doc(db, "categories", cat.id), { imageUrl: url });
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 overflow-hidden rounded bg-muted">
          {cat.imageUrl ? (
            <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm"
          />
        ) : (
          <span className="flex-1 text-sm font-medium">{cat.name}</span>
        )}
        {editing ? (
          <>
            <button onClick={save} className="grid h-8 w-8 place-items-center rounded hover:bg-accent" aria-label="Save">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => { setEditing(false); setName(cat.name); }} className="grid h-8 w-8 place-items-center rounded hover:bg-accent" aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={remove} className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-accent" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {editing && (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-accent">
            <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>
      )}

      <div className="mt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subcategories</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {cat.subcategories.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs">
              {s}
              <button onClick={() => removeSub(s)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${s}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {cat.subcategories.length === 0 && (
            <span className="text-xs text-muted-foreground">No subcategories yet.</span>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            placeholder="Add subcategory"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          />
          <button onClick={addSub} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-accent">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Products -------------------- */

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

const emptyProductForm = (firstCat: string): ProductForm => ({
  name: "",
  category: firstCat,
  subcategory: "",
  price: "",
  blurb: "",
  description: "",
  badge: "",
  imageUrl: "",
});

function ProductsSection({
  products,
  categoryDocs,
}: {
  products: StoreProduct[];
  categoryDocs: CategoryDoc[];
}) {
  const [form, setForm] = useState<ProductForm>(() => emptyProductForm(categoryDocs[0]?.name ?? ""));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setForm(emptyProductForm(categoryDocs[0]?.name ?? ""));
      toast.success("Product added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add product");
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
      toast.success("Product updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    }
  }

  async function onUploadNew(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(f, "products");
      setForm((s) => ({ ...s, imageUrl: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onUploadEdit(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !editForm) return;
    try {
      const url = await uploadImageFile(f, "products");
      setEditForm({ ...editForm, imageUrl: url });
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    }
  }

  const firestoreProducts = products.filter((p) => p.source === "firestore");

  return (
    <Section title="Products" desc="Add and manage products. The image URL or upload (whichever you set last) wins.">
      <div className="rounded-lg border border-border bg-card p-5">
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
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <input
            placeholder="Badge (optional, e.g. New)"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              placeholder="Image URL (e.g. https://images.unsplash.com/...)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload image"}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUploadNew} />
            </label>
          </div>
          {form.imageUrl && (
            <div className="sm:col-span-2">
              <img src={form.imageUrl} alt="" className="h-24 w-24 rounded-md border border-border object-cover" />
            </div>
          )}
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
      </div>

      <div className="mt-6 space-y-3">
        {firestoreProducts.length === 0 && (
          <p className="text-sm text-muted-foreground">No custom products yet.</p>
        )}
        {firestoreProducts.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-4">
            {editingId === p.id && editForm ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Name" />
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value, subcategory: "" })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                  {categoryDocs.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {editCat && editCat.subcategories.length > 0 && (
                  <select value={editForm.subcategory} onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                    <option value="">No subcategory</option>
                    {editCat.subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Price" />
                <input value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Badge (optional)" />
                <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Image URL" />
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={onUploadEdit} />
                  </label>
                </div>
                <input value={editForm.blurb} onChange={(e) => setEditForm({ ...editForm, blurb: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2" placeholder="Blurb" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3} className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" placeholder="Description" />
                <div className="flex gap-2 sm:col-span-2">
                  <button onClick={saveEdit} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button onClick={() => { setEditingId(null); setEditForm(null); }}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-accent">
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
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category}{p.subcategory ? ` › ${p.subcategory}` : ""} · {formatPrice(p.price)}{p.badge ? ` · ${p.badge}` : ""}
                  </div>
                </div>
                <button onClick={() => startEdit(p)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-accent">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => remove(p.id)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs text-destructive hover:bg-accent">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------- About -------------------- */

function AboutSection({ about }: { about: AboutContent }) {
  const [draft, setDraft] = useState(about);
  useEffect(() => setDraft(about), [about]);

  async function save() {
    try {
      await setDoc(doc(db, "content", "about"), draft);
      toast.success("About page updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  }

  return (
    <Section title="About Us page">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-5">
        {(
          [
            ["heading", "Heading"],
            ["intro", "Intro paragraph"],
            ["body", "Body paragraph"],
            ["email", "Contact email"],
            ["address", "Address"],
            ["hours", "Hours"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            {key === "intro" || key === "body" ? (
              <textarea
                rows={3}
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <input
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            )}
          </label>
        ))}
        <button
          onClick={save}
          className="mt-2 inline-flex h-10 items-center justify-center self-start rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </Section>
  );
}

/* -------------------- Footer -------------------- */

function FooterSection({ footer }: { footer: FooterContent }) {
  const [draft, setDraft] = useState(footer);
  useEffect(() => setDraft(footer), [footer]);

  async function save() {
    try {
      await setDoc(doc(db, "content", "footer"), draft);
      toast.success("Footer updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  }

  const fields: Array<[keyof FooterContent, string, "input" | "textarea"]> = [
    ["tagline", "Tagline (under the logo)", "textarea"],
    ["email", "Contact email", "input"],
    ["address", "Address", "input"],
    ["copyright", "Bottom-left copyright text", "input"],
    ["bottomRight", "Bottom-right text", "input"],
  ];

  return (
    <Section title="Footer">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-5">
        {fields.map(([key, label, kind]) => (
          <label key={key} className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            {kind === "textarea" ? (
              <textarea
                rows={2}
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <input
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            )}
          </label>
        ))}
        <button
          onClick={save}
          className="mt-2 inline-flex h-10 items-center justify-center self-start rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </Section>
  );
}