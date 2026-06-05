import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useStore } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
  head: () => ({ meta: [{ title: "Reviews — MedClub Admin" }] }),
});

interface ReviewDoc {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  name: string;
  approved: boolean;
  createdAt: number;
}

function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const { products } = useStore();

  useEffect(() => {
    return onSnapshot(collection(db, "reviews"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReviewDoc, "id">) }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setReviews(list);
    });
  }, []);

  async function approve(id: string) {
    try {
      await updateDoc(doc(db, "reviews", id), { approved: true });
      toast.success("Review approved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  const visible = reviews.filter((r) =>
    filter === "all" ? true : filter === "pending" ? !r.approved : r.approved,
  );

  return (
    <AdminLayout title="Reviews" description="Moderate student reviews. New reviews appear here until approved.">
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              filter === f
                ? "border-brand-red bg-brand-red text-white"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            {f} ({reviews.filter((r) => (f === "all" ? true : f === "pending" ? !r.approved : r.approved)).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews here.</p>
        )}
        {visible.map((r) => {
          const product = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {product?.name ?? `Product ${r.productId}`}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-amber-500">
                      {"★".repeat(r.rating)}
                      <span className="text-muted-foreground">{"★".repeat(5 - r.rating)}</span>
                    </span>
                    <span className="text-sm font-medium">{r.name}</span>
                    {r.approved ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground">{r.comment}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {!r.approved && (
                    <button
                      onClick={() => approve(r.id)}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-green-600 px-3 text-xs text-white hover:bg-green-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs text-destructive hover:bg-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}