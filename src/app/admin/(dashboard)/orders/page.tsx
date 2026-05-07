"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { fetchOrdersAdmin, updateOrderStatus, deleteOrder } from "@/services/orders";
import type { OrderDTO, OrderStatus } from "@/types";

const statuses: OrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "delivered",
];

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  delivered: "Delivered",
};

function stepperDots(status: OrderStatus) {
  const rejected = status === "rejected";
  if (rejected) {
    return { a: false, b: false, c: false };
  }
  if (status === "pending") {
    return { a: true, b: false, c: false };
  }
  if (status === "accepted") {
    return { a: true, b: true, c: false };
  }
  return { a: true, b: true, c: true };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      setOrders(await fetchOrdersAdmin());
    } catch {
      setMsg("Unauthorized — sign in again at /admin/login.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      load();
    } catch {
      setMsg("Update failed.");
    }
  };

  const onDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      setMsg(null);
      await deleteOrder(id);
      setMsg("Order deleted successfully.");
      load();
    } catch {
      setMsg("Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f5d79e]">Orders</h1>
        <p className="text-sm text-[#f3e8c7]/70">
          Update status — customers see the same steps on their order tracking
          page (Placed → Preparing → Completed).
        </p>
      </div>
      {msg && (
        <div className="rounded-xl bg-[#d5b16a]/10 border border-[#d5b16a]/20 px-4 py-3 text-sm">{msg}</div>
      )}
      {loading ? (
        <p className="text-[#d5b16a]/70">Loading…</p>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          {orders.map((o) => {
            const dots = stepperDots(o.status);
            const displayId = o.orderNumber
              ? `#${o.orderNumber}`
              : `#${o._id.slice(-8).toUpperCase()}`;
            return (
              <article
                key={o._id}
                className="overflow-hidden rounded-xl sm:rounded-2xl border border-[#d5b16a]/20 bg-[#111111] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)] sm:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.08)]"
              >
                <div className="border-b border-[#d5b16a]/10 bg-[#faf8f5] px-3 sm:px-5 py-3 sm:py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-[#e60000]">
                        {displayId}
                      </p>
                      <p className="text-xs text-[#d5b16a]/70">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <p className="text-lg sm:text-xl font-extrabold tabular-nums text-[#e60000]">
                      ₹ {o.totalAmount}
                    </p>
                  </div>
                  {(o.customerName || o.customerAddress) && (
                    <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl border border-[#d5b16a]/20/80 bg-[#111111] px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm">
                      {o.customerName && (
                        <p>
                          <span className="font-semibold text-[#d5b16a]/70">
                            Name:{" "}
                          </span>
                          {o.customerName}
                        </p>
                      )}

                      {o.customerAddress && (
                        <p className="mt-1 text-[#f3e8c7]">
                          <span className="font-semibold text-[#d5b16a]/70">
                            Address:{" "}
                          </span>
                          {o.customerAddress}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#d5b16a]/70">
                    Progress (customer view)
                  </p>
                  <div className="mt-3 flex max-w-md items-center justify-between gap-2">
                    {[
                      { key: "a", label: "Placed", on: dots.a },
                      { key: "b", label: "Preparing", on: dots.b },
                      { key: "c", label: "Completed", on: dots.c },
                    ].map((s, i) => (
                      <div
                        key={s.key}
                        className="flex flex-1 flex-col items-center gap-1.5 text-center"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                            s.on
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-[#d5b16a]/20 bg-[#d5b16a]/10 text-[#d5b16a]/40"
                          }`}
                        >
                          {s.on ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-[#f3e8c7]/70">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="space-y-2 border-t border-[#d5b16a]/10 px-5 py-4 text-sm">
                  {o.items.map((it, i) => (
                    <li
                      key={`${it.productId}-${i}`}
                      className="flex justify-between gap-2"
                    >
                      <span>
                        {it.name}{" "}
                        <span className="text-[#d5b16a]/70">×{it.quantity}</span>
                      </span>
                      <span className="tabular-nums text-[#f3e8c7]">
                        ₹ {it.price * it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 border-t border-[#d5b16a]/10 bg-[#0a0a0a]/80 px-5 py-4">
                  <span
                    className={`mr-auto rounded-full px-3 py-1 text-xs font-bold ${
                      o.status === "pending"
                        ? "bg-amber-100 text-[#d5b16a]"
                        : o.status === "accepted"
                          ? "bg-sky-100 text-sky-900"
                          : o.status === "delivered"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-red-100 text-red-900"
                    }`}
                  >
                    {labels[o.status]}
                  </span>
                  {statuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={o.status === s}
                      onClick={() => onStatus(o._id, s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                        s === "rejected"
                          ? "border border-red-200 bg-red-50 text-red-800"
                          : "border border-[#d5b16a]/20 bg-[#111111] text-[#f5d79e] hover:bg-[#fdf6e8]"
                      }`}
                    >
                      {labels[s]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onDelete(o._id, displayId)}
                    className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100"
                    title="Delete order"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
          {orders.length === 0 && !msg && (
            <p className="text-[#d5b16a]/70">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
