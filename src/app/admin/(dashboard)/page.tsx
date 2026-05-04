"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProducts } from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { fetchOrdersAdmin } from "@/services/orders";
import { fetchReservationsAdmin } from "@/services/reservations";

export default function AdminHomePage() {
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pending: 0,
    reservations: 0,
    pendingReservations: 0,
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        let o: Awaited<ReturnType<typeof fetchOrdersAdmin>> = [];
        let r: Awaited<ReturnType<typeof fetchReservationsAdmin>> = [];
        try {
          [o, r] = await Promise.all([fetchOrdersAdmin(), fetchReservationsAdmin()]);
        } catch {
          setErr("Could not load orders/reservations. Sign in again if your session expired.");
        }
        setCounts({
          products: p.length,
          categories: c.length,
          orders: o.length,
          pending: o.filter((x) => x.status === "pending").length,
          reservations: r.length,
          pendingReservations: r.filter((x) => x.status === "pending").length,
        });
      } catch {
        setErr("Could not load data. Check MongoDB and network.");
      }
    })();
  }, []);

  const cards = [
    { label: "Products", value: counts.products, href: "/admin/products" },
    {
      label: "Categories",
      value: counts.categories,
      href: "/admin/categories",
    },
    { label: "Orders", value: counts.orders, href: "/admin/orders" },
    {
      label: "Pending orders",
      value: counts.pending,
      href: "/admin/orders",
    },
    {
      label: "Reservations",
      value: counts.reservations,
      href: "/admin/reservations",
    },
    {
      label: "Pending reservations",
      value: counts.pendingReservations,
      href: "/admin/reservations",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#f5d79e]">Dashboard</h1>
      <p className="mt-1 text-sm font-bold uppercase tracking-widest text-[#d5b16a]/50">
        Manage catalogue and fulfil orders in one place.
      </p>
      {err && (
        <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-rose-400">
          {err}{" "}
          <Link href="/admin/login" className="font-semibold underline text-[#d5b16a]">
            Login
          </Link>
        </p>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl sm:rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-3 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 hover:border-[#d5b16a]/40 hover:shadow-[0_15px_40px_rgba(213,177,106,0.15)] group"
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#d5b16a]/60 group-hover:text-[#d5b16a] transition-colors">{c.label}</p>
            <p className="mt-2 font-serif text-2xl sm:text-4xl tabular-nums text-[#f5d79e]">
              {c.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
