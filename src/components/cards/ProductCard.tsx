"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@/types";
import { NonVegIcon, VegIcon } from "@/components/common/VegIcon";
import { ImageLightbox } from "@/components/modals/ImageLightbox";

type Props = {
  product: ProductDTO;
  onAdd: (product: ProductDTO) => void;
};

function resolveImage(url: string | undefined) {
  if (!url || url.length === 0) return "/placeholder-food.svg";
  if (url.startsWith("http") || url.startsWith("//")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

function cardPriceLabel(product: ProductDTO): { text: string; sub?: string } {
  const v = product.variants;
  if (v && v.length > 0) {
    const minP = Math.min(...v.map((x) => x.price));
    const maxP = Math.max(...v.map((x) => x.price));
    if (minP === maxP) {
      return { text: `₹ ${minP}`, sub: `${v.length} type` };
    }
    return { text: `₹ ${minP}`, sub: `${v.length} types` };
  }
  return { text: `₹ ${product.price}` };
}

export function ProductCard({ product, onAdd }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const src = resolveImage(product.image);
  const priceLine = cardPriceLabel(product);
  const imgUnopt =
    src.startsWith("http") || src.startsWith("//") || src.startsWith("/uploads");

  return (
    <>
      <article
        onClick={() => onAdd(product)}
        className="group relative flex cursor-pointer items-stretch overflow-hidden rounded-2xl border border-[#d5b16a]/20 bg-[#111111] transition-all duration-500 hover:border-[#d5b16a]/50 hover:shadow-[0_12px_24px_-10px_rgba(213,177,106,0.3)] active:scale-[0.98]"
      >
        {/* Left: Image */}
        <div className="relative w-[38%] shrink-0 overflow-hidden sm:w-[35%]">
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 140px, 200px"
            unoptimized={imgUnopt}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]/10" />
        </div>

        {/* Right: Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-bold leading-tight text-[#f5d79e] group-hover:text-white transition-colors sm:text-xl">
                {product.name}
              </h3>
              <span className="mt-1 shrink-0">
                {product.isVeg ? <VegIcon /> : <NonVegIcon />}
              </span>
            </div>
            <p className="line-clamp-2 text-[11px] leading-relaxed text-[#f3e8c7]/60 sm:text-xs">
              {product.description || "Preparation of royal delicacy."}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-[#f5d79e] sm:text-2xl">
                {priceLine.text}
              </span>
              {priceLine.sub && (
                <span className="text-[10px] uppercase tracking-widest text-[#d5b16a]/60">
                  {priceLine.sub}
                </span>
              )}
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d5b16a] text-black shadow-lg shadow-[#d5b16a]/20 transition-transform group-hover:scale-110 sm:h-11 sm:w-11"
            >
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Interaction Indicator */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-gradient-to-tr from-[#d5b16a]/5 to-transparent" />
      </article>

      <ImageLightbox
        open={lightboxOpen}
        src={src}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
