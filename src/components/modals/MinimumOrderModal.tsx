"use client";

import { X, ShoppingCart } from "lucide-react";
import { MIN_ORDER_AMOUNT } from "@/lib/order-constants";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddItem: () => void;
};

export function MinimumOrderModal({ open, onClose, onAddItem }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[22rem] overflow-hidden rounded-[2.5rem] border border-[#d5b16a]/30 bg-[#0a0a0a] shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="min-order-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-[#d5b16a]/50 transition hover:bg-[#d5b16a]/10 hover:text-[#d5b16a]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Panel */}
        <div className="relative rounded-t-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#070707] px-4 pb-0 pt-8 text-center border-b border-[#d5b16a]/10">
          <p
            id="min-order-title"
            className="font-serif text-[1.125rem] font-bold text-[#f5d79e]"
          >
            Minimum Order Amount
          </p>

          <div className="relative mx-auto mt-4 flex h-[7.5rem] w-full max-w-[17rem] items-end justify-center">
            <span
              className="absolute left-0 top-[42%] text-lg font-bold text-[#d5b16a]/40"
              aria-hidden
            >
              −
            </span>
            <span
              className="absolute right-0 top-[42%] text-lg font-bold text-[#d5b16a]/40"
              aria-hidden
            >
              +
            </span>

            {/* Semicircle progress: gold left, dark right */}
            <svg
              className="absolute bottom-13 left-1/2 w-44 -translate-x-1/2"
              viewBox="0 0 200 78"
              aria-hidden
            >
              <path
                d="M 38 70 A 62 62 0 0 1 100 8"
                fill="none"
                stroke="#d5b16a"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 100 8 A 62 62 0 0 1 162 70"
                fill="none"
                stroke="#111111"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>

            {/* Cart + colourful boxes -> gold accents */}
            <div className="relative flex flex-col items-center">
              <div className="relative flex items-end justify-center gap-1 pb-1">
                <span
                  className="mb-2 h-3 w-3 rounded-[2px] bg-[#d5b16a]/60 shadow-[0_0_8px_rgba(213,177,106,0.3)]"
                  aria-hidden
                />
                <span
                  className="mb-3 h-3 w-3 rounded-[2px] bg-[#d5b16a]/80 shadow-[0_0_8px_rgba(213,177,106,0.4)]"
                  aria-hidden
                />
                <span
                  className="mb-1.5 h-3 w-3 rounded-[2px] bg-[#f5d79e] shadow-[0_0_8px_rgba(245,215,158,0.5)]"
                  aria-hidden
                />
              </div>
              <div className="flex items-center justify-center text-[#d5b16a] drop-shadow-[0_0_10px_rgba(213,177,106,0.3)]">
                <ShoppingCart className="h-10 w-10" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 pt-6">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#d5b16a]/80">
            Important Notice
          </h2>
          <p className="mt-4 text-center text-sm leading-relaxed text-[#f3e8c7]/70">
            Minimum royal order value is <span className="font-bold text-[#f5d79e]">₹ {MIN_ORDER_AMOUNT}</span>. Please add more delicacies to checkout.
          </p>
          <button
            type="button"
            onClick={() => {
              onAddItem();
              onClose();
            }}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-4 text-center text-[12px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#d5b16a]/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Add Items
          </button>
        </div>
      </div>
    </div>
  );
}
