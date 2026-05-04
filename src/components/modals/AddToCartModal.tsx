"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import type { ProductDTO, ProductVariant } from "@/types";
import { useCart } from "@/features/cart/cart-context";

type Props = {
  open: boolean;
  product: ProductDTO | null;
  onClose: () => void;
};

function resolveImage(url: string | undefined) {
  if (!url || url.length === 0) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function AddToCartModal({ open, product, onClose }: Props) {
  const { addLine } = useCart();
  const options = useMemo<ProductVariant[]>(() => {
    const Variants = product?.variants;
    if (Variants && Variants.length > 0) {
      return Variants.map((v, i) => ({
        id: `v-${i}`,
        label: v.label,
        price: v.price,
      }));
    }
    if (!product) return [];
    return [
      {
        id: "default",
        label: product.name,
        price: product.price,
      },
    ];
  }, [product]);

  const [quantity, setQuantity] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (options.length > 0) {
      setSelectedId(options[0].id);
    }
  }, [options]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const active =
    options.find((o) => o.id === selectedId) ?? options[0] ?? null;
  const unit = active?.price ?? product.price;
  const lineTotal = unit * quantity;
  const hasDbVariants = (product.variants?.length ?? 0) > 0;

  const src = resolveImage(product.image);

  const lineName = (() => {
    if (hasDbVariants && active) {
      return active.label;
    }
    if (active && active.id !== "default") {
      return `${product.name} (${active.label})`;
    }
    return product.name;
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(94dvh,800px)] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-[#d5b16a]/30 bg-[#070707] shadow-2xl animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 rounded-full bg-black/40 p-2 text-[#d5b16a]/50 backdrop-blur-md transition hover:bg-[#d5b16a]/10 hover:text-[#f5d79e]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Section: Image */}
        <div className="relative h-64 w-full shrink-0 overflow-hidden sm:h-80">
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
            unoptimized={src.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#d5b16a] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                {product.category}
              </span>
              {product.isVeg && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Pure Veg
                </span>
              )}
            </div>
            <h2 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">
              {product.name}
            </h2>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-8">
            {/* Description */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]/60">Description</p>
              <p className="mt-2 text-sm leading-relaxed text-[#f3e8c7]/70">
                {product.description || "An exquisite royal delicacy prepared with the finest ingredients and traditional culinary techniques."}
              </p>
            </div>

            {/* Variants/Types */}
            {options.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]/60">Select Type</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {options.map((o) => {
                    const selected = o.id === selectedId;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedId(o.id)}
                        className={`group relative flex flex-col items-start rounded-2xl border p-4 transition-all duration-300 ${
                          selected
                            ? "border-[#d5b16a] bg-[#b38a46]/10 shadow-[0_0_20px_rgba(213,177,106,0.1)]"
                            : "border-[#d5b16a]/10 bg-white/5 hover:border-[#d5b16a]/30"
                        }`}
                      >
                        <span className={`text-sm font-semibold tracking-wide ${selected ? "text-[#f5d79e]" : "text-[#f3e8c7]/80"}`}>
                          {o.label}
                        </span>
                        <span className="mt-1 text-xs text-[#d5b16a]">₹ {o.price}</span>
                        {selected && (
                          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#d5b16a]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]/60">Quantity</p>
              <div className="mt-3 flex items-center gap-6">
                <div className="flex items-center rounded-xl border border-[#d5b16a]/20 bg-black/40 p-1">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#d5b16a] transition hover:bg-[#d5b16a]/10 disabled:opacity-30"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-serif text-lg text-[#f5d79e]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#d5b16a] transition hover:bg-[#d5b16a]/10"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#d5b16a]/10 bg-[#0a0a0a] px-8 py-6">
          <button
            type="button"
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-4 shadow-xl shadow-[#d5b16a]/10 transition-transform active:scale-95"
            onClick={() => {
              addLine({
                productId: product._id,
                name: lineName,
                price: unit,
                quantity,
                image: product.image,
                isVeg: product.isVeg,
              });
              onClose();
            }}
          >
            <div className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Cart - ₹ {lineTotal}</span>
            </div>
            <div className="absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
          </button>
        </div>
      </div>
    </div>
  );
}
