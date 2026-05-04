"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  fetchSettings,
  updateSettings,
  type SiteSettingsDTO,
} from "@/services/settings";
import { uploadImage } from "@/services/products";

const BANNER_LABELS = [
  "Banner 1 (left / top on mobile)",
  "Banner 2 (center)",
  "Banner 3 (right)",
] as const;

const emptySettings = (): SiteSettingsDTO => ({
  heroImages: ["", "", ""],
  restaurantAddress: "",
  restaurantInstruction: "",
  restaurantPhone: "",
  paymentQrImage: "",
  landingHeroImage: "",
  landingHeroTitle: "",
  landingHeroSubtitle: "",
  visionTitle: "",
  visionDescription: "",
  experienceCards: ["", "", ""],
  landingGalleryImages: ["", "", "", ""],
});

export default function AdminSettingsPage() {
  const [s, setS] = useState<SiteSettingsDTO>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef0 = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const galleryRef0 = useRef<HTMLInputElement>(null);
  const galleryRef1 = useRef<HTMLInputElement>(null);
  const galleryRef2 = useRef<HTMLInputElement>(null);
  const galleryRef3 = useRef<HTMLInputElement>(null);
  const fileRefs = [fileRef0, fileRef1, fileRef2] as const;
  const galleryRefs = [galleryRef0, galleryRef1, galleryRef2, galleryRef3] as const;
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);

  const setSlot = (index: number, value: string) => {
    setS((prev) => {
      const heroImages: [string, string, string] = [...prev.heroImages];
      heroImages[index] = value;
      return { ...prev, heroImages };
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setS(await fetchSettings());
    } catch {
      setMsg("Failed to load settings — check your login and database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIdx(index);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setSlot(index, url);
    } catch {
      setMsg("Upload failed — try again.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const onQrUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingQr(true);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setS((p) => ({ ...p, paymentQrImage: url }));
    } catch {
      setMsg("QR upload failed — try again.");
    } finally {
      setUploadingQr(false);
    }
  };

  const onGalleryUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingGalleryIdx(index);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setS((p) => {
        const next = [...p.landingGalleryImages];
        next[index] = url;
        return { ...p, landingGalleryImages: next };
      });
    } catch {
      setMsg("Gallery upload failed — try again.");
    } finally {
      setUploadingGalleryIdx(null);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateSettings(s);
      setMsg("Settings saved — refresh the homepage and order tracking to see changes.");
    } catch {
      setMsg("Save fail — try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Site settings</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#f3e8c7]/70">
          Hero banners, outlet details, and payment QR. The menu navbar is edited under{" "}
          <span className="font-semibold text-[#f5d79e]">Navbar</span> in the sidebar.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl bg-[#d5b16a]/10 border border-[#d5b16a]/20 px-4 py-3 text-sm text-[#d5b16a]">
          {msg}
        </div>
      )}

      {loading ? (
        <p className="text-[#d5b16a]/70">Loading…</p>
      ) : (
        <>
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-4 shadow-sm sm:p-6"
              >
                <p className="text-sm font-semibold text-[#f5d79e]">
                  {BANNER_LABELS[i]}
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    onClick={() =>
                      uploadingIdx === null && fileRefs[i].current?.click()
                    }
                    disabled={uploadingIdx !== null}
                    className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d5b16a]/40 bg-gradient-to-br from-[#111111] to-[#0a0a0a] px-4 py-4 text-center transition hover:border-[#d5b16a]/70 disabled:opacity-50 sm:w-40"
                  >
                    <Upload className="h-7 w-7 text-[#e60000]" />
                    <span className="mt-1.5 text-xs font-medium text-[#f3e8c7]">
                      Upload
                    </span>
                    <input
                      ref={fileRefs[i]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        onUpload(i, e.target.files?.[0] ?? null)
                      }
                    />
                    {uploadingIdx === i && (
                      <span className="mt-2 text-xs text-[#e60000]">
                        Upload…
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1 space-y-2">
                    <label className="block text-xs font-semibold uppercase text-[#d5b16a]/70">
                      Image URL (you can paste directly)
                      <input
                        className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                        value={s.heroImages[i]}
                        onChange={(e) => setSlot(i, e.target.value)}
                        placeholder="/uploads/banner1.jpg"
                      />
                    </label>
                    {s.heroImages[i].trim() ? (
                      <div className="relative mt-2 aspect-21/9 w-full max-w-xl overflow-hidden rounded-xl bg-[#d5b16a]/10">
                        <Image
                          src={s.heroImages[i].trim()}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={
                            s.heroImages[i].startsWith("http") ||
                            s.heroImages[i].startsWith("//")
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-[#d5b16a]/40">
                        No image yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[#f5d79e]">Landing page content</h2>
            <p className="mt-1 text-xs text-[#d5b16a]/70">
              All public landing sections are dynamic from here.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Landing hero image
                </span>
                <input
                  className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                  value={s.landingHeroImage}
                  onChange={(e) =>
                    setS((p) => ({ ...p, landingHeroImage: e.target.value }))
                  }
                  placeholder="/uploads/landing-hero.jpg"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Landing hero title
                </span>
                <input
                  className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                  value={s.landingHeroTitle}
                  onChange={(e) =>
                    setS((p) => ({ ...p, landingHeroTitle: e.target.value }))
                  }
                  placeholder="A refined restaurant experience"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Landing hero subtitle
                </span>
                <textarea
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.landingHeroSubtitle}
                  onChange={(e) =>
                    setS((p) => ({ ...p, landingHeroSubtitle: e.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Our vision title
                </span>
                <input
                  className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                  value={s.visionTitle}
                  onChange={(e) =>
                    setS((p) => ({ ...p, visionTitle: e.target.value }))
                  }
                  placeholder="Our Vision"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Our vision description
                </span>
                <textarea
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.visionDescription}
                  onChange={(e) =>
                    setS((p) => ({ ...p, visionDescription: e.target.value }))
                  }
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <label key={i} className="block">
                    <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                      Highlight card {i + 1}
                    </span>
                    <textarea
                      rows={3}
                      className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                      value={s.experienceCards[i]}
                      onChange={(e) =>
                        setS((p) => {
                          const next: [string, string, string] = [...p.experienceCards];
                          next[i] = e.target.value;
                          return { ...p, experienceCards: next };
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Landing restaurant gallery images
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-[#d5b16a]/20 p-3">
                      <p className="text-xs text-[#d5b16a]/70">Gallery image {i + 1}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            uploadingGalleryIdx === null && galleryRefs[i].current?.click()
                          }
                          disabled={uploadingGalleryIdx !== null}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d5b16a]/35 px-3 py-2 text-xs font-semibold text-[#e60000] disabled:opacity-60"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingGalleryIdx === i ? "Uploading…" : "Upload"}
                        </button>
                        <input
                          ref={galleryRefs[i]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            onGalleryUpload(i, e.target.files?.[0] ?? null)
                          }
                        />
                        <input
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          value={s.landingGalleryImages[i] ?? ""}
                          onChange={(e) =>
                            setS((p) => {
                              const next = [...p.landingGalleryImages];
                              next[i] = e.target.value;
                              return { ...p, landingGalleryImages: next };
                            })
                          }
                          placeholder="/uploads/restaurant-gallery.jpg"
                        />
                      </div>
                      {s.landingGalleryImages[i]?.trim() ? (
                        <div className="relative mt-2 h-28 overflow-hidden rounded-lg border bg-[#d5b16a]/10">
                          <Image
                            src={s.landingGalleryImages[i].trim()}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={
                              s.landingGalleryImages[i].startsWith("http") ||
                              s.landingGalleryImages[i].startsWith("//")
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[#f5d79e]">
              Outlet & order tracking
            </h2>
            <p className="mt-1 text-xs text-[#d5b16a]/70">
              Customers will see the address, instructions, and QR code on their order tracking page.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Restaurant phone (Call / WhatsApp)
                </span>
                <input
                  className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                  value={s.restaurantPhone}
                  onChange={(e) =>
                    setS((p) => ({ ...p, restaurantPhone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Restaurant address
                </span>
                <textarea
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.restaurantAddress}
                  onChange={(e) =>
                    setS((p) => ({ ...p, restaurantAddress: e.target.value }))
                  }
                  placeholder="Full outlet address…"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Restaurant instruction (UPI / owner note)
                </span>
                <textarea
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.restaurantInstruction}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      restaurantInstruction: e.target.value,
                    }))
                  }
                  placeholder="Short payment note or UPI instructions…"
                />
              </label>

              <div>
                <p className="text-xs font-semibold uppercase text-[#d5b16a]/70">
                  Payment QR image
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    onClick={() =>
                      !uploadingQr && qrFileRef.current?.click()
                    }
                    disabled={uploadingQr}
                    className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d5b16a]/30 bg-[#0a0a0a] px-4 py-4 text-center text-sm disabled:opacity-50 sm:w-40"
                  >
                    <Upload className="mx-auto h-7 w-7 text-[#e60000]" />
                    <span className="mt-1.5 text-xs font-medium">
                      {uploadingQr ? "Upload…" : "Upload QR"}
                    </span>
                    <input
                      ref={qrFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        onQrUpload(e.target.files?.[0] ?? null)
                      }
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <input
                      className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
                      value={s.paymentQrImage}
                      onChange={(e) =>
                        setS((p) => ({
                          ...p,
                          paymentQrImage: e.target.value,
                        }))
                      }
                      placeholder="/uploads/qr.png"
                    />
                    {s.paymentQrImage.trim() ? (
                      <div className="relative mt-2 h-36 w-36 overflow-hidden rounded-xl border bg-[#111111]">
                        <Image
                          src={s.paymentQrImage.trim()}
                          alt=""
                          fill
                          className="object-contain p-2"
                          unoptimized={
                            s.paymentQrImage.startsWith("http") ||
                            s.paymentQrImage.startsWith("//")
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={saveAll}
              className="rounded-full bg-[#e60000] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save all settings"}
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-[#d5b16a]/30 px-6 py-3 text-sm font-semibold"
            >
              Reload from server
            </button>
          </div>
        </>
      )}
    </div>
  );
}
