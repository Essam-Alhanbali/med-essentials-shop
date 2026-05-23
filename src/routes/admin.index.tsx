import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { db } from "@/lib/firebase";
import { onSnapshot } from "firebase/firestore";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MedClub Store" }] }),
});

function AdminPage() {
  const { user, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const { products, categories, about } = useStore();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [user, loading, navigate]);

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

      <CategoriesSection categories={categories} />
      <ProductsSection products={products} categories={categories} />
      <AboutSection about={about} />
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

function CategoriesSection({ categories }: { categories: string[] }) {
  const [name, setName] = useState("");
  const [docs, setDocs] = useState<{ id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "categories"), (snap) => {
      setDocs(
        snap.docs.map((d) => ({ id: d.id, name: (d.data().name as string) ?? d.id }))
      );
    });
  }, []);

  async function add() {
    const n = name.trim();
    if (!n) return;
    if (categories.includes(n)) {
      toast.error("Category already exists");
      return;
    }
    try {
      await addDoc(collection(db, "categories"), { name: n });
      setName("");
      toast.success("Category added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add category");
    }
  }

  async function saveEdit(id: string) {
    const n = editingName.trim();
    if (!n) return;
    try {
      await updateDoc(doc(db, "categories", id), { name: n });
      setEditingId(null);
      toast.success("Category renamed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to rename");
    }
  }

  async function removeCat(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Category deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  return (
    <Section title="Categories" desc="Built-in categories are read-only. Add, rename, or delete your own below.">
      <div className="flex flex-wrap gap-2">
        {categories
          .filter((c) => !docs.some((d) => d.name === c))
          .map((c) => (
            <span key={c} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              {c} <span className="opacity-60">· built-in</span>
            </span>
          ))}
      </div>
      <div className="mt-3 space-y-2">
        {docs.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
            {editingId === c.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm"
                />
                <button onClick={() => saveEdit(c.id)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{c.name}</span>
                <button
                  onClick={() => { setEditingId(c.id); setEditingName(c.name); }}
                  className="grid h-8 w-8 place-items-center rounded hover:bg-accent"
                  aria-label="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeCat(c.id)}
                  className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-accent"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={add}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </Section>
  );
}

function ProductsSection({
  products,
  categories,
}: {
  products: ReturnType<typeof useStore>["products"];
  categories: string[];
}) {
  const [form, setForm] = useState({
    name: "",
    category: categories[0] ?? "",
    price: "",
    blurb: "",
    description: "",
    badge: "",
    imageUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

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
        price: Number(form.price) || 0,
        blurb: form.blurb.trim(),
        description: form.description.trim(),
        badge: form.badge.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
      });
      setForm({ name: "", category: categories[0] ?? "", price: "", blurb: "", description: "", badge: "", imageUrl: "" });
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

  function startEdit(p: any) {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      category: p.category,
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

  const firestoreProducts = products.filter((p) => p.source === "firestore");

  return (
    <Section title="Products" desc="Seed products are read-only. Manage your own products below.">
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
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
          <input
            placeholder="Image URL (e.g. https://images.unsplash.com/...)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
          />
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
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Price" />
                <input value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Badge (optional)" />
                <input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2" placeholder="Image URL" />
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
                  <div className="text-xs text-muted-foreground">{p.category} · ${p.price}{p.badge ? ` · ${p.badge}` : ""}</div>
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

function AboutSection({ about }: { about: ReturnType<typeof useStore>["about"] }) {
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