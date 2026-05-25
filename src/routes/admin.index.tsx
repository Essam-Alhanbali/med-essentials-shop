import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/price";
import { statusBadgeClasses } from "@/lib/orderStatus";
import type { OrderDoc } from "@/lib/orderTypes";
import { categories as seedCategories } from "@/data/products";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — MedClub Admin" }] }),
});

function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);

  // Auto-seed default categories on first admin visit.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        if (snap.empty) {
          await Promise.all(
            seedCategories.map((name) =>
              addDoc(collection(db, "categories"), {
                name,
                subcategories: [],
                emoji: "📦",
              })
            )
          );
        }
      } catch {}
    })();
  }, [user]);

  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderDoc, "id">) }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(list);
    });
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const revenue = orders
    .filter((o) => o.status === "Completed")
    .reduce((s, o) => s + (Number(o.total) || 0), 0);

  const recent = orders.slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      description={user?.email ? `Signed in as ${user.email}` : undefined}
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={totalOrders.toString()} />
        <StatCard label="Pending orders" value={pendingOrders.toString()} />
        <StatCard label="Revenue (completed)" value={formatPrice(revenue)} />
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{o.fullName}</td>
                  <td className="px-4 py-2">{formatPrice(o.total)}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusBadgeClasses(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}