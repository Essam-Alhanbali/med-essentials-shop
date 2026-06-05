import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/price";
import { ORDER_STATUSES, statusBadgeClasses } from "@/lib/orderStatus";
import type { OrderDoc } from "@/lib/orderTypes";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Orders — MedClub Admin" }] }),
});

function OrdersPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderDoc, "id">) }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(list);
    });
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  const visible = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <AdminLayout title="Orders" description="Newest orders first. Expand a row for full details.">
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              statusFilter === s
                ? "border-brand-red bg-brand-red text-white"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            {s === "all" ? "All" : s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"></th>
              <th className="px-3 py-2">Order #</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
            {visible.map((o) => (
              <Row
                key={o.id}
                order={o}
                open={open === o.id}
                onToggle={() => setOpen(open === o.id ? null : o.id)}
                onStatus={(s) => setStatus(o.id, s)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function Row({
  order,
  open,
  onToggle,
  onStatus,
}: {
  order: OrderDoc;
  open: boolean;
  onToggle: () => void;
  onStatus: (s: string) => void;
}) {
  return (
    <>
      <tr className="hover:bg-muted/30">
        <td className="px-2 py-2">
          <button onClick={onToggle} aria-label="Toggle details" className="grid h-7 w-7 place-items-center rounded hover:bg-accent">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        <td className="px-3 py-2 font-mono text-xs">{(order as any).orderNumber || order.id.slice(0, 8)}</td>
        <td className="px-3 py-2">{order.fullName}</td>
        <td className="px-3 py-2">{order.phone}</td>
        <td className="px-3 py-2">{order.academicYear}</td>
        <td className="px-3 py-2 max-w-[200px] truncate" title={order.address}>{order.address}</td>
        <td className="px-3 py-2 font-semibold">{formatPrice(order.total)}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusBadgeClasses(order.status)}`}>
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => onStatus(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </td>
        <td className="px-3 py-2 text-muted-foreground">
          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/20">
          <td></td>
          <td colSpan={8} className="px-3 py-4">
            {order.status === "Ready for Pickup" && (
              <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                📱 WhatsApp / email pickup notification — integration coming soon.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
                <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-background">
                  {order.items?.map((it, i) => (
                    <li key={i} className="flex justify-between px-3 py-2 text-sm">
                      <span>{it.quantity} × {it.name}</span>
                      <span className="font-medium">{formatPrice(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-border px-3 py-2 text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="text-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h4>
                <dl className="mt-2 space-y-1">
                  <Info label="Name" value={order.fullName} />
                  <Info label="Email" value={order.email} />
                  <Info label="Phone" value={order.phone} />
                  <Info label="Academic year" value={order.academicYear} />
                  <Info label="Address" value={order.address} />
                  {order.notes && <Info label="Notes" value={order.notes} />}
                </dl>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 text-xs text-muted-foreground">{label}</dt>
      <dd className="flex-1">{value}</dd>
    </div>
  );
}