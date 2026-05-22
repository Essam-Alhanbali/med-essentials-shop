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
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { db, storage } from "@/lib/firebase";

export const Route = createFileRoute("/admin")({
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

  async function add() {
    const n = name.trim();
    if (!n) return;
    if (categories.includes(n)) {
      toast.error("Category already exists");
      return;
    }
    await addDoc(collection(db, "categories"), { name: n });
    setName("");
    toast.success("Category added");
  }

  return (
    <Section title="Categories" desc="Seed categories are read-only. Add custom categories below.">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c} className="rounded-full border border-border bg-card px-3 py-1 text-xs">
            {c}
          </span>
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
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function uploadImage(productId: string, f: File): Promise<string> {
    const r = storageRef(storage, `products/${productId}/${Date.now()}-${f.name}`);
    await uploadBytes(r, f);
    return await getDownloadURL(r);
  }

  async function create() {
    if (!form.name.trim() || !form.category) {
      toast.error("Name and category are required");
      return;
    }
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "products"), {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        blurb: form.blurb.trim(),
        description: form.description.trim(),
      });
      if (file) {
        const url = await uploadImage(ref.id, file);
        await updateDoc(ref, { imageUrl: url });
      }
      setForm({ name: "", category: categories[0] ?? "", price: "", blurb: "", description: "" });
      setFile(null);
      toast.success("Product added");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add product");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    toast.success("Deleted");
  }

  async function replaceImage(id: string, f: File) {
    try {
      const url = await uploadImage(id, f);
      await updateDoc(doc(db, "products", id), { imageUrl: url });
      toast.success("Image updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
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
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-sm"
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
          <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.category} · ${p.price}</div>
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-accent">
              <Upload className="h-3.5 w-3.5" /> Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) replaceImage(p.id, f);
                }}
              />
            </label>
            <button
              onClick={() => remove(p.id)}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs text-destructive hover:bg-accent"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
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