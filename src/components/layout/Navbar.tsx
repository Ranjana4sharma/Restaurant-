"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Phone, User, LogOut } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";
import { useAuth } from "@/features/auth/auth-context";
import { fetchNavbar, type NavbarDTO } from "@/services/navbar";
import { WavySeparator } from "./WavySeparator";

export function Navbar({ onCartClick }: { onCartClick?: () => void }) {
  const { itemCount } = useCart();
  const { isLoggedIn, user, logout, refresh, setIsLoginOpen } = useAuth();
  const displayCount = itemCount > 99 ? "99+" : String(itemCount);

  const [data, setData] = useState<NavbarDTO | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    return fetchNavbar()
      .then(setData)
      .catch(() => setData({ logoUrl: "", brand: "", tagline: "", phone: "" }))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const logoUrl = data?.logoUrl.trim() ?? "";
  const brand = data?.brand.trim() ?? "";
  const taglineText = data?.tagline.trim() ?? "";
  const callPhone = data?.phone.trim() ?? "";

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const logoUnopt =
    logoUrl &&
    (logoUrl.startsWith("http") ||
      logoUrl.startsWith("//") ||
      logoUrl.startsWith("/uploads"));

  return (
    <>
    <header className="sticky top-0 z-50 bg-[#070707] border-b border-[#d5b16a]/10 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-1 sm:gap-3 sm:px-5 sm:py-2">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#d5b16a]/35 focus-visible:ring-offset-2 sm:gap-2.5"
          aria-label={brand ? brand : "Home"}
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#111111] ring-2 ring-[#d5b16a]/20 sm:h-10 sm:w-10">
            {!ready ? (
              <span className="absolute inset-0 animate-pulse bg-neutral-200" />
            ) : logoUrl ? (
              <Image
                key={logoUrl}
                src={logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                priority
                unoptimized={Boolean(logoUnopt)}
              />
            ) : (
              <span className="absolute inset-0 bg-neutral-100" aria-hidden />
            )}
          </span>
          <span className="min-w-0">
            {!ready ? (
              <>
                <span className="block h-[1.1rem] w-36 max-w-[55vw] animate-pulse rounded bg-neutral-200 sm:h-7 sm:w-44" />
                <span className="mt-1 block h-2.5 w-28 max-w-[45vw] animate-pulse rounded bg-neutral-100 sm:mt-1.5" />
              </>
            ) : (
              <>
                {brand ? (
                  <p className="font-serif text-[clamp(1.05rem,3.4vw,1.45rem)] font-bold leading-none tracking-tight text-[#f5d79e] transition-transform duration-200 group-hover:scale-[1.02] sm:text-[clamp(1.15rem,3.6vw,1.6rem)]">
                    {brand}
                  </p>
                ) : (
                  <span className="block min-h-[1.1rem] sm:min-h-7" aria-hidden />
                )}
                {taglineText ? (
                  <p className="font-body mt-px max-w-52.5 text-[9px] font-bold uppercase tracking-widest leading-tight text-[#d5b16a]/60 sm:mt-0.5 sm:max-w-none sm:text-[10px]">
                    {taglineText}
                  </p>
                ) : null}
              </>
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {ready && (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {isLoggedIn && user && (
                <Link
                  href="/dashboard"
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-[#111111] px-2.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.09em] text-[#d5b16a] ring-1 ring-[#d5b16a]/20 transition hover:bg-[#d5b16a]/10 active:translate-y-px sm:h-9 sm:gap-2 sm:px-4 sm:text-[0.65rem] sm:tracking-widest md:h-10 md:px-5 md:text-xs"
                >
                  <User className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[2.5] sm:h-4 sm:w-4 md:h-[1.1rem] md:w-[1.1rem]" />
                  <span className="hidden sm:inline">Orders</span>
                  <div className="flex items-center gap-1 bg-[#d5b16a]/10 px-1.5 py-0.5 rounded-full border border-[#d5b16a]/20">
                    <span className="text-[8px] sm:text-[10px] text-[#f5d79e]">{user.completionPercentage}%</span>
                  </div>
                </Link>
              )}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-[#111111] px-2.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.09em] text-[#d5b16a]/60 ring-1 ring-[#d5b16a]/20 transition hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] active:translate-y-px sm:h-9 sm:gap-1.5 sm:px-4 sm:text-[0.65rem] sm:tracking-widest md:h-10 md:px-5 md:text-xs"
                >
                  <LogOut className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[2.5] sm:h-4 sm:w-4 md:h-[1.1rem] md:w-[1.1rem]" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-[#111111] px-2.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.09em] text-[#d5b16a] ring-1 ring-[#d5b16a]/20 transition hover:bg-[#d5b16a]/10 active:translate-y-px sm:h-9 sm:gap-1.5 sm:px-4 sm:text-[0.65rem] sm:tracking-widest md:h-10 md:px-5 md:text-xs"
                >
                  <User className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[2.5] sm:h-4 sm:w-4 md:h-[1.1rem] md:w-[1.1rem]" />
                  Login
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d5b16a] text-[#050505] shadow-lg shadow-[#d5b16a]/20 transition hover:brightness-110 active:translate-y-px active:brightness-95 sm:h-10 sm:w-10 md:h-11 md:w-11"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingCart
              className="h-3.5 w-3.5 sm:h-[1.05rem] sm:w-[1.05rem] md:h-5 md:w-5"
              strokeWidth={2.5}
            />
            <span className="font-body absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#070707] bg-[#b38a46] px-0.5 text-[9px] font-bold leading-none text-white sm:h-[1.05rem] sm:min-w-[1.05rem] sm:text-[10px]">
              {displayCount}
            </span>
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
