import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";
import { useStore } from "@/context/StoreContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [{ title: "Cart — MedClub Store" }],
  }),
});

function CartPage() {
  const { detailed, setQty, remove, subtotal, clear } = useCart();
  const { getCategoryEmoji } = useStore();
  const total = subtotal;
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and add a few essentials to get started.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {detailed.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 p-5">
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-md bg-secondary text-3xl"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-md object-cover" />
                ) : (
                  getCategoryEmoji(product.category)
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </div>
                    <Link
                      to="/product/$id"
                      params={{ id: product.id }}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex h-9 items-center rounded-md border border-border">
                    <button
                      onClick={() => setQty(product.id, quantity - 1)}
                      className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => setQty(product.id, quantity + 1)}
                      className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-sm font-semibold">{formatPrice(product.price * quantity)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium text-foreground">To be determined</dd>
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery cost will be confirmed after you place your order.
            </p>
            <div className="my-3 border-t border-border" />
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatPrice(total)}</dd>
            </div>
          </dl>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Checkout
          </button>
          <button
            onClick={clear}
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear cart
          </button>
        </aside>
      </div>
      {checkoutOpen && (
        <CheckoutDialog
          total={total}
          items={detailed.map(({ product, quantity }) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
          }))}
          onClose={() => setCheckoutOpen(false)}
          onSubmitted={() => {
            clear();
            setCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
}

const ENGLISH_ONLY = /^[A-Za-z0-9\s.,'\-+/#()]+$/;

const ACADEMIC_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Sixth Year",
  "Intern",
  "Other",
] as const;

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100)
    .regex(ENGLISH_ONLY, "English characters only"),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Digits and + - ( ) only"),
  academicYear: z.enum(ACADEMIC_YEARS, { message: "Please select your academic year" }),
  residence: z
    .string()
    .trim()
    .min(2, "Please enter your residence location")
    .max(150)
    .regex(ENGLISH_ONLY, "English characters only"),
});

function CheckoutDialog({
  total,
  items,
  onClose,
  onSubmitted,
}: {
  total: number;
  items: { productId: string; name: string; price: number; quantity: number }[];
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    academicYear: "",
    residence: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        fullName: result.data.fullName,
        email: result.data.email,
        phone: result.data.phone,
        academicYear: result.data.academicYear,
        address: result.data.residence,
        items,
        total,
        status: "Pending",
        createdAt: Date.now(),
        createdAtServer: serverTimestamp(),
      });
      toast.success(`Thanks, ${result.data.fullName}! Your order was placed.`);
      onSubmitted();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Complete your order</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Total: <span className="font-medium text-foreground">{formatPrice(total)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
            error={errors.fullName}
            placeholder="Jane Doe"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            error={errors.email}
            placeholder="you@example.com"
            inputMode="email"
          />
          <Field
            label="Phone number"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            error={errors.phone}
            placeholder="+1 555 123 4567"
            inputMode="tel"
          />
          <div>
            <label className="block text-xs font-medium text-foreground">Academic year</label>
            <select
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select…</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.academicYear && (
              <p className="mt-1 text-xs text-destructive">{errors.academicYear}</p>
            )}
          </div>
          <Field
            label="Residence location"
            value={form.residence}
            onChange={(v) => setForm((f) => ({ ...f, residence: v }))}
            error={errors.residence}
            placeholder="City, neighborhood"
          />
          <p className="text-xs text-muted-foreground">
            Note: please fill out all information in English.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}