"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { fetchLanding, type LandingPayload } from "@/services/landing";
import { fetchCategories } from "@/services/categories";
import { createReservation } from "@/services/reservations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryDTO } from "@/types";
import toast from "react-hot-toast";
import { Footer } from "@/components/layout/Footer";

const fallbackLanding: LandingPayload = {
  brandName: "The Royal Platter",
  mottoLine: "Where every plate tells a royal story.",
  heroImage: "",
  heroTitle: "",
  heroSubtitle: "",
  visionTitle: "",
  visionDescription: "",
  experienceCards: ["", "", ""],
  landingGalleryImages: [],
  chefSpecials: [],
  signatureDishes: [],
  mostFamousDishes: [],
  categories: [],
};

const staticGalleryFallback = [
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80",
];

export default function HomePage() {
  const [data, setData] = useState<LandingPayload>(fallbackLanding);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");
  const [reservationSaving, setReservationSaving] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (dir: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 300;
    categoryScrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    void fetchLanding()
      .then(setData)
      .catch(() => setData(fallbackLanding));
    void fetchCategories()
      .then(setCategories)
      .catch(() => {});

    // Cleanup reservation reload flag on mount
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("reservation_reloaded");
    }
  }, []);

  const displayCategories = useMemo(() => {
    const list = categories.length > 0 ? categories.filter(c => !c.parentId) : data.categories;
    return list;
  }, [categories, data.categories]);

  const signaturePreview = useMemo(() => {
    const selected = data.signatureDishes.slice(0, 2);
    const specials = data.chefSpecials.slice(0, 2);
    const merged = [...selected, ...specials];
    const unique = merged.filter((dish, idx, arr) => arr.findIndex((x) => x._id === dish._id) === idx);
    return unique.slice(0, 4);
  }, [data.signatureDishes, data.chefSpecials]);

  const galleryImages = useMemo(() => {
    const dynamic = data.landingGalleryImages.filter(Boolean).slice(0, 6);
    return dynamic.length > 0 ? dynamic : staticGalleryFallback;
  }, [data.landingGalleryImages]);

  const heroImage =
    data.heroImage.trim() ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=80";

  return (
    <main className="min-h-dvh bg-[#070707] text-[#f3e8c7]">
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,146,63,0.16),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(194,146,63,0.12),transparent_40%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/90" aria-hidden />

        <div className="relative mx-auto w-full max-w-5xl px-6 text-center">
          <p className="animate-[fadeUp_0.8s_ease-out] text-[11px] uppercase tracking-[0.35em] text-[#d5b16a]">
            Luxury Dining
          </p>
          <h1 className="animate-[fadeUp_1s_ease-out] font-serif text-5xl font-semibold tracking-wide text-[#f5d79e] sm:text-7xl">
            The Royal Platter
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-[fadeUp_1.2s_ease-out] text-sm text-[#f3e8c7]/85 sm:text-lg">
            Where every plate tells a royal story
          </p>
          <Link
            href="/home"
            className="mt-10 inline-flex animate-[fadeUp_1.4s_ease-out] rounded-full border border-[#d5b16a]/70 bg-[#b38a46]/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5d79e] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b38a46]/35"
          >
            Enter Experience
          </Link>
          <button
            type="button"
            onClick={() => {
              document.getElementById("reservation-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-4 inline-flex animate-[fadeUp_1.45s_ease-out] rounded-full border border-[#d5b16a]/55 bg-black/35 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5d79e] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b38a46]/20"
          >
            Reserve Table
          </button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-18 sm:py-22">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#d5b16a]/90">Signature Dishes</p>
            <h2 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">Curated Highlights</h2>
          </div>
          <Link
            href="/home"
            className="rounded-full border border-[#d5b16a]/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5d79e] transition hover:bg-[#b38a46]/20"
          >
            View Menu
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {signaturePreview.length > 0
            ? signaturePreview.map((dish, idx) => (
                <Link
                   href={`/home?productId=${dish._id}`}
                   key={dish._id}
                  className="group block overflow-hidden rounded-2xl border border-[#d5b16a]/20 bg-[#111111]/80 transition duration-500 hover:border-[#d5b16a]/45 hover:shadow-[0_18px_40px_-20px_rgba(213,177,106,0.65)]"
                >
                  <div
                    className="h-52 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${dish.image || "/placeholder-food.svg"}')` }}
                  />
                  <div className="space-y-2 p-4">
                    <span className="inline-flex rounded-full border border-[#d5b16a]/35 bg-[#b38a46]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f5d79e]">
                      {idx % 2 === 0 ? "Chef's Choice" : "Bestseller"}
                    </span>
                    <h3 className="font-serif text-lg text-[#f7e6bd]">{dish.name}</h3>
                  </div>
                </Link>
              ))
            : [0, 1, 2, 3].map((card) => (
                <article
                  key={`placeholder-${card}`}
                  className="overflow-hidden rounded-2xl border border-[#d5b16a]/20 bg-[#111111]/80"
                >
                  <div
                    className="h-52 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${
                        staticGalleryFallback[card] || "/placeholder-food.svg"
                      }')`,
                    }}
                  />
                  <div className="space-y-2 p-4">
                    <span className="inline-flex rounded-full border border-[#d5b16a]/35 bg-[#b38a46]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f5d79e]">
                      {card % 2 === 0 ? "Chef's Choice" : "Bestseller"}
                    </span>
                    <h3 className="font-serif text-lg text-[#f7e6bd]">Royal Signature Dish</h3>
                  </div>
                </article>
              ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-18 sm:pb-22">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#d5b16a]/90">Explore our Menu</p>
          <h2 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">Browse by Category</h2>
        </div>
        
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollCategories("left")}
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d5b16a]/30 bg-[#070707]/80 text-[#d5b16a] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#b38a46]/20 sm:flex"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollCategories("right")}
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d5b16a]/30 bg-[#070707]/80 text-[#d5b16a] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#b38a46]/20 sm:flex"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={categoryScrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2"
          >
            {displayCategories.map((cat, idx) => (
              <Link
                key={cat._id || idx}
                href={`/home?category=${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group/item relative h-48 w-40 sm:w-48 lg:w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-[#d5b16a]/20 bg-[#111111] transition-all duration-500 hover:border-[#d5b16a]/60 hover:shadow-[0_15px_30px_-10px_rgba(213,177,106,0.4)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-item:scale-110"
                  style={{ backgroundImage: `url('${cat.image || "/placeholder-food.svg"}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <p className="font-serif text-lg text-[#f5d79e] transition duration-300 group-hover/item:text-white">{cat.name}</p>
                  <div className="mx-auto mt-2 h-0.5 w-0 bg-[#d5b16a] transition-all duration-500 group-hover/item:w-12" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-18 sm:pb-22">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#d5b16a]/90">Gallery</p>
          <h2 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">Ambience & Flavor</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {galleryImages.map((image, idx) => (
            <div
              key={`${image}-${idx}`}
              className="group relative h-40 overflow-hidden rounded-xl border border-[#d5b16a]/15 sm:h-56"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${image}')` }}
              />
              <div className="absolute inset-0 bg-black/25 transition duration-500 group-hover:bg-black/10" />
            </div>
          ))}
        </div>
      </section>

      <section
        id="reservation-section"
        className="mx-auto w-full max-w-6xl px-6 pb-18 sm:pb-22 scroll-mt-20"
      >
        <div className="rounded-3xl border border-[#d5b16a]/25 bg-[#0f0f0f]/80 p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#d5b16a]/90">Reservations</p>
          <h2 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">Reserve Your Table</h2>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setReservationSaving(true);
              try {
                const em = email.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(em)) {
                  toast.error("Please enter a valid email address.");
                  setReservationSaving(false);
                  return;
                }
                await createReservation({
                  fullName: fullName.trim(),
                  phone: em, // Send email in the phone field to avoid backend API changes
                  reservationDate,
                  reservationTime,
                  guests: Number(guests),
                  notes: notes.trim(),
                });
                
                toast.success("Reservation request received. We’ll contact you shortly.");
                
                setFullName("");
                setEmail("");
                setReservationDate("");
                setReservationTime("");
                setGuests("2");
                setNotes("");

                // One-time refresh logic
                setTimeout(() => {
                  const hasReloaded = sessionStorage.getItem("reservation_reloaded");
                  if (!hasReloaded) {
                    sessionStorage.setItem("reservation_reloaded", "true");
                    window.location.reload();
                  }
                }, 2500);
              } catch {
                toast.error("Unable to submit reservation. Please try again.");
              } finally {
                setReservationSaving(false);
              }
            }}
          >
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Name"
              className="rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/30 focus:ring-2"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/30 focus:ring-2"
            />
            <input
              required
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              className="rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] [color-scheme:dark] outline-none ring-[#d5b16a]/30 focus:ring-2"
            />
            <input
              required
              type="time"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              className="rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] [color-scheme:dark] outline-none ring-[#d5b16a]/30 focus:ring-2"
            />
            <input
              required
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Guests"
              className="rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/30 focus:ring-2"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special Requests (Optional)"
              className="rounded-xl border border-[#d5b16a]/30 bg-black/35 px-3 py-2.5 text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/30 focus:ring-2 sm:col-span-2 lg:col-span-5 h-20 resize-none"
            />
            <div className="sm:col-span-2 lg:col-span-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={reservationSaving}
                className="rounded-full border border-[#d5b16a]/70 bg-[#b38a46]/20 px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5d79e] transition hover:bg-[#b38a46]/35 disabled:opacity-60"
              >
                {reservationSaving ? "Submitting..." : "Reserve Table"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-t border-[#d5b16a]/20 bg-gradient-to-b from-[#090909] to-[#050505] px-6 py-18 text-center sm:py-24">
        <p className="mx-auto max-w-3xl font-serif text-3xl text-[#f5d79e] sm:text-5xl">
          Step into a world of flavor and elegance
        </p>
        <Link
          href="/home"
          className="mt-10 inline-flex rounded-full border border-[#d5b16a]/70 bg-[#b38a46]/20 px-9 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5d79e] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b38a46]/35"
        >
          Enter Restaurant
        </Link>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
