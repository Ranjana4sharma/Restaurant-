"use client";

import Image from "next/image";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ open, src, alt, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-60 rounded-full bg-black/40 p-2 text-[#d5b16a] backdrop-blur-md transition hover:bg-[#d5b16a]/10"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={800}
          className="h-auto w-auto object-contain"
          unoptimized={src.startsWith("http") || src.startsWith("//") || src.startsWith("/uploads")}
        />
      </div>
    </div>
  );
}
