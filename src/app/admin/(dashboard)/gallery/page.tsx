"use client";

import { useEffect, useState } from "react";
import { fetchGallery, updateGalleryAdmin } from "@/services/gallery";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setImages(await fetchGallery());
      } catch {
        setMsg("Could not load gallery.");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f5d79e]">Gallery</h1>
        <p className="text-sm text-[#f3e8c7]/70">Upload or remove public gallery image URLs.</p>
      </div>
      {msg ? <p className="rounded-xl bg-[#d5b16a]/10 border border-[#d5b16a]/20 px-4 py-3 text-sm text-[#d5b16a]">{msg}</p> : null}
      <div className="space-y-3 rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-5">
        {images.map((img, idx) => (
          <div key={`${img}-${idx}`} className="flex gap-2">
            <input
              value={img}
              onChange={(e) => {
                const next = [...images];
                next[idx] = e.target.value;
                setImages(next);
              }}
              className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
            />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
              className="rounded-xl border border-[#d5b16a]/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImages((prev) => [...prev, ""])}
          className="rounded-full border border-[#d5b16a]/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/80 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] transition-colors"
        >
          Add Image Row
        </button>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setMsg(null);
          try {
            const updated = await updateGalleryAdmin(images);
            setImages(updated);
            setMsg("Gallery updated.");
          } catch {
            setMsg("Failed to save gallery.");
          } finally {
            setSaving(false);
          }
        }}
        className="rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] hover:scale-[1.02] transition-transform"
      >
        {saving ? "Saving..." : "Save Gallery"}
      </button>
    </div>
  );
}
