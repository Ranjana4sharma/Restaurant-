"use client";

import { X, Plus, Minus, Trash2, Utensils } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/features/cart/cart-context";
import {
  MIN_ORDER_AMOUNT,
  PREMIUM_ORDER_THRESHOLD,
} from "@/lib/order-constants";

type Props = {
  open: boolean;
  onClose: () => void;
  onRequestCheckout: () => void;
  onOrderNow: () => void;
};

function imgSrc(url?: string) {
  if (!url) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function CartDrawer({
  open,
  onClose,
  onRequestCheckout,
  onOrderNow,
}: Props) {
  const { lines, inc, dec, remove, subtotal } = useCart();

  if (!open) return null;

  const belowMin = lines.length > 0 && subtotal < MIN_ORDER_AMOUNT;
  const premium = lines.length > 0 && subtotal > PREMIUM_ORDER_THRESHOLD;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        aria-label="Close cart"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-[#0a0a0a] border-l border-[#d5b16a]/10 shadow-[0_0_50px_rgba(0,0,0,1)] animate-in slide-in-from-right duration-500"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* HEADER - FIXED */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#d5b16a]/10 bg-[#0a0a0a] px-6 py-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#f5d79e]">
              My Selection
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[#d5b16a]/40">
              {lines.length} royal items in cart
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#d5b16a]/40 transition-colors hover:bg-[#d5b16a]/10 hover:text-[#d5b16a]"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="px-5 py-6 pb-44"> {/* Significant padding to prevent overlap with fixed footer */}
            {lines.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="relative mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-[#d5b16a]/5">
                  <Utensils className="h-20 w-20 text-[#d5b16a]/20" strokeWidth={1} />
                </div>
                <h3 className="font-serif text-xl text-[#f3e8c7]">Your cart is empty</h3>
                <p className="mt-3 max-w-[240px] text-xs leading-relaxed text-[#f3e8c7]/40 uppercase tracking-wider">
                  Our chef's finest creations are waiting to be added to your plate.
                </p>
                <button
                  type="button"
                  onClick={onOrderNow}
                  className="mt-10 rounded-full bg-[#d5b16a] px-10 py-4 font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-xl shadow-[#d5b16a]/10 transition hover:brightness-110 active:scale-95"
                >
                  View Menu
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="group relative flex gap-4 rounded-2xl border border-[#d5b16a]/5 bg-[#111111] p-4 transition-colors hover:border-[#d5b16a]/20"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0a0a0a] ring-1 ring-[#d5b16a]/10">
                      <Image
                        src={imgSrc(line.image)}
                        alt=""
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        sizes="80px"
                        unoptimized={imgSrc(line.image).startsWith("http")}
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 font-serif text-base font-semibold text-[#f5d79e]">
                            {line.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => remove(line.key)}
                            className="text-[#d5b16a]/20 transition-colors hover:text-rose-500"
                            aria-label="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-1 text-xs font-bold tabular-nums text-[#d5b16a]">
                          ₹ {line.price}
                        </p>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 ring-1 ring-[#d5b16a]/10">
                          <button
                            type="button"
                            onClick={() => dec(line.key)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111] text-[#d5b16a] hover:bg-[#d5b16a]/10 transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#f3e8c7]">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => inc(line.key)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111] text-[#d5b16a] hover:bg-[#d5b16a]/10 transition-colors"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-black tabular-nums text-[#f5d79e]">
                          ₹ {line.price * line.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* FOOTER - FIXED */}
        {lines.length > 0 && (
          <div className="shrink-0 border-t border-[#d5b16a]/15 bg-[#0a0a0a] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
            <div className="space-y-4 mb-6">
              {premium && !belowMin && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  ✨ Royal Priority Order: Top Kitchen Queue
                </div>
              )}
              {belowMin && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-rose-400">
                  Minimum Order Value: ₹ {MIN_ORDER_AMOUNT}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]/40">Subtotal</span>
                <span className="font-serif text-2xl font-black tabular-nums text-[#f5d79e]">
                  ₹ {subtotal}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onRequestCheckout}
              disabled={belowMin}
              className="w-full rounded-2xl bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-5 text-center text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d5b16a]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              Secure Checkout — ₹ {subtotal}
            </button>
            <p className="mt-4 text-center text-[8px] uppercase tracking-widest text-[#d5b16a]/30">
              Tax & Delivery calculated at the next royal step
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
