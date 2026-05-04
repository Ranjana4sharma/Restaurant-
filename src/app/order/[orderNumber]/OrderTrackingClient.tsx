"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Download, Check, Clock, Loader2 } from "lucide-react";
import { fetchOrderByNumber } from "@/services/orders";
import {
  fetchSettings,
  type SiteSettingsDTO,
} from "@/services/settings";
import type { OrderDTO, OrderStatus, ProductDTO } from "@/types";
import { ScrollToTop } from "@/components/buttons/ScrollToTop";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchProducts } from "@/services/products";

const ENV_PHONE =
  process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "+919999999999";
const ENV_ADDRESS =
  process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ??
  "The Royal Platter — Premium Fine Dining";
const ENV_INSTRUCTION =
  process.env.NEXT_PUBLIC_RESTAURANT_INSTRUCTION ??
  "Thank you for ordering with us. For changes, call the restaurant.";

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function waLink(phone: string) {
  const d = digitsOnly(phone);
  const n = d.length >= 10 ? d.slice(-10) : d;
  return `https://wa.me/91${n}`;
}

function formatWhen(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEstimatedMinutes(status: OrderStatus): number {
  if (status === "rejected") return 0;
  if (status === "pending") return 15;
  if (status === "accepted") return 10;
  return 5; // completed
}

type Step = { id: string; label: string; done: boolean; current: boolean };

/** Matches admin “Progress (customer view)” mapping */
function stepsForStatus(status: OrderStatus): Step[] {
  const rejected = status === "rejected";
  if (rejected) {
    return [
      { id: "p", label: "Placed", done: false, current: false },
      { id: "c", label: "Preparing", done: false, current: false },
      { id: "d", label: "Completed", done: false, current: false },
    ];
  }
  if (status === "pending") {
    return [
      { id: "p", label: "Placed", done: true, current: false },
      { id: "c", label: "Preparing", done: false, current: true },
      { id: "d", label: "Completed", done: false, current: false },
    ];
  }
  if (status === "accepted") {
    return [
      { id: "p", label: "Placed", done: true, current: false },
      { id: "c", label: "Preparing", done: true, current: false },
      { id: "d", label: "Completed", done: false, current: true },
    ];
  }
  return [
    { id: "p", label: "Placed", done: true, current: false },
    { id: "c", label: "Preparing", done: true, current: false },
    { id: "d", label: "Completed", done: true, current: true },
  ];
}

function imgSrc(url?: string) {
  if (!url) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function OrderTrackingClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productById, setProductById] = useState<Map<string, ProductDTO>>(
    () => new Map(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    if (loading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErr(null);
    try {
      const o = await fetchOrderByNumber(orderNumber);
      setOrder(o);
    } catch {
      setErr("We couldn't find this order.");
      setOrder(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderNumber, loading]);

  useEffect(() => {
    loadOrder();
    const t = setInterval(loadOrder, 25_000);
    return () => clearInterval(t);
  }, [loadOrder]);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        const m = new Map<string, ProductDTO>();
        for (const p of list) m.set(p._id, p);
        setProductById(m);
      })
      .catch(() => {
        if (!cancelled) setProductById(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !order) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#070707] font-body text-[#f5d79e]">
        <Loader2 className="h-8 w-8 animate-spin text-[#d5b16a]" />
        <p className="text-[#f3e8c7]/70 text-sm tracking-widest uppercase font-bold">Loading your order…</p>
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#070707] px-4 text-center text-[#f5d79e]">
        <p className="font-serif text-2xl text-[#f3e8c7]/70">{err ?? "Order not found."}</p>
        <Link
          href="/home"
          className="rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#050505] shadow-[0_10px_20px_rgba(213,177,106,0.2)] hover:scale-105 transition-transform"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  const displayId = order.orderNumber
    ? `#${order.orderNumber}`
    : `#${order._id.slice(-8).toUpperCase()}`;
  const steps = stepsForStatus(order.status);
  const rejected = order.status === "rejected";

  const phone =
    settings?.restaurantPhone?.trim() || ENV_PHONE;
  const address =
    settings?.restaurantAddress?.trim() || ENV_ADDRESS;
  const instruction =
    settings?.restaurantInstruction?.trim() || ENV_INSTRUCTION;
  const qrUrl = settings?.paymentQrImage?.trim() ?? "";
  const qrUnopt =
    qrUrl.startsWith("http") ||
    qrUrl.startsWith("//") ||
    qrUrl.startsWith("/uploads");

  return (
    <div className="flex flex-col min-h-dvh bg-[#070707] font-body text-[#f3e8c7]">
      {/* Navbar */}
      <Navbar />

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-2 bg-[#d5b16a]/10 border-b border-[#d5b16a]/20 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-[#d5b16a]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#d5b16a]">Updating order status...</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-24 pt-6 sm:pb-32 sm:pt-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          {/* Success Banner */}
          {!rejected && order.status === "pending" && (
            <div className="mb-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-emerald-600 sm:text-4xl">Order Placed Successfully</h1>
              <p className="mt-2 text-sm text-emerald-600/70 font-medium">Your royal feast is being prepared with care</p>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          <div className="space-y-8">
            <article className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-5 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-[#d5b16a]">
                    {displayId}
                  </p>
                  <p className="mt-1 text-xs text-[#f3e8c7]/50">
                    Date {formatWhen(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-emerald-400">
                    <Clock className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Estimated time</p>
                  </div>
                  <p className="mt-1 font-serif text-2xl text-emerald-400">
                    {getEstimatedMinutes(order.status)} mins
                  </p>
                </div>
              </div>

              {rejected ? (
                <p className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-rose-400 text-center">
                  This order could not be accepted. Please call us if you were
                  charged.
                </p>
              ) : (
                <div className="relative mt-8 px-2 sm:px-4">
                  <div className="flex items-start justify-between gap-0">
                    {steps.map((st, i) => (
                      <div key={st.id} className="relative flex flex-1 flex-col items-center">
                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                            st.done
                              ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              : st.current
                                ? "border-[#d5b16a] bg-[#111111] text-[#d5b16a] shadow-[0_0_15px_rgba(213,177,106,0.3)]"
                                : "border-[#d5b16a]/20 bg-[#0a0a0a] text-[#d5b16a]/30"
                          }`}
                        >
                          {st.done ? <Check className="h-5 w-5 text-black" /> : i + 1}
                        </div>
                        <p
                          className={`mt-3 max-w-[80px] text-center text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 sm:max-w-none ${
                            st.current || st.done
                              ? "text-[#f5d79e]"
                              : "text-[#f3e8c7]/30"
                          }`}
                        >
                          {st.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Connect line background */}
                  <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-[#d5b16a]/10 -z-0" />
                  
                  {/* Active progress line */}
                  <div className="absolute top-5 left-[10%] right-[10%] h-0.5 -z-0 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-in-out"
                      style={{
                        width: `${Math.max(0, Math.min(100, (steps.filter((s) => s.done).length / (steps.length - 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-[#d5b16a]/10 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">
                  Restaurant Address:
                </p>
                <p className="mt-2 text-sm text-[#f3e8c7]">{address}</p>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]">
                  To know your order status call now
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={loadOrder}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d5b16a]/40 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a] hover:bg-[#d5b16a]/10 transition active:scale-95"
                  >
                    <Clock className="h-4 w-4" />
                    Track Order
                  </button>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] hover:scale-105 transition active:scale-95"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <a
                    href={waLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 transition active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Whatsapp
                  </a>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-5 shadow-2xl sm:p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]">
                Restaurant Instruction
              </h3>
              
              <div className="mt-4 grid gap-4 sm:gap-5 sm:grid-cols-[1fr_auto]">
                {/* Left side: Instructions and customer details */}
                <div className="min-w-0">
                  {(order.customerName || order.customerAddress) && (
                    <div className="rounded-xl border border-[#d5b16a]/10 bg-[#0a0a0a] p-4 mb-4">
                      {order.customerName ? (
                        <p className="text-sm font-bold text-[#f5d79e]">{order.customerName}</p>
                      ) : null}
                      {order.customerAddress ? (
                        <p className="mt-1 text-xs text-[#f3e8c7]/60 leading-relaxed">
                          {order.customerAddress}
                        </p>
                      ) : null}
                    </div>
                  )}
                  <p className="text-xs leading-relaxed text-[#f3e8c7]/70 italic">
                    {instruction}
                  </p>
                </div>
                
                {/* Right side: QR Code */}
                {qrUrl ? (
                  <div className="flex flex-col items-center gap-2 sm:border-l sm:border-[#d5b16a]/10 sm:pl-6">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#d5b16a]/20 bg-white sm:h-32 sm:w-32">
                      <Image
                        src={qrUrl}
                        alt="Payment QR"
                        fill
                        className="object-contain p-2"
                        unoptimized={qrUnopt}
                      />
                    </div>
                    <a
                      href={qrUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d5b16a]/40 bg-[#d5b16a]/10 text-[#d5b16a] hover:bg-[#d5b16a]/20 transition"
                      aria-label="Download QR"
                      title="Download QR Code"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-5 shadow-2xl sm:p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]">
                Order Items
              </h3>
              <ul className="mt-4 space-y-4 divide-y divide-[#d5b16a]/10">
                {order.items.map((it, i) => {
                  const pic = productById.get(it.productId)?.image;
                  const src = imgSrc(pic);
                  const unopt = src.startsWith("http");
                  return (
                    <li key={`${it.productId}-${i}`} className="flex gap-4 pt-4 first:pt-0 items-center">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a]">
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={unopt}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#f5d79e]">
                          {it.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-[#f3e8c7]/50 mt-1">
                          x{it.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#f5d79e]">
                        ₹ {it.price * it.quantity}
                      </p>
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-6 space-y-2 border-t border-[#d5b16a]/20 pt-5">
                <div className="flex justify-between text-xs text-[#f3e8c7]/70 font-medium tracking-wide">
                  <span>Sub Total:</span>
                  <span>₹ {order.totalAmount}</span>
                </div>
                <div className="flex justify-between font-serif text-2xl text-[#f5d79e] border-t border-[#d5b16a]/10 pt-4 mt-4">
                  <span>Total Paid</span>
                  <span>₹ {order.totalAmount}</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-3">
                <Link
                  href="/home"
                  className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#050505] shadow-[0_10px_20px_rgba(213,177,106,0.15)] hover:scale-[1.02] transition-transform"
                >
                  Order More
                </Link>

                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center rounded-full border border-[#d5b16a]/20 py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] transition-all"
                >
                  View Order History
                </Link>
              </div>
            </div>
          </aside>
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      
      <ScrollToTop />
    </div>
  );
}
