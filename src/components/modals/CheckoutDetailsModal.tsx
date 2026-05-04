"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }) => Promise<void>;
};

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const r = await fetch(
    `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
  );
  if (!r.ok) return null;
  const j = (await r.json()) as { address?: string | null };
  const a = j.address?.trim();
  return a || null;
}

export function CheckoutDetailsModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const autoFetchDoneRef = useRef(false);

  const fillAddressFromLocation = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!navigator.geolocation) {
        if (!silent) setErr("Location is not supported on this device.");
        return;
      }
      setLocating(true);
      if (!silent) setErr(null);
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 60_000,
          });
        });
        const line = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (line) {
          setAddress(line);
          if (!silent) setErr(null);
        } else if (!silent) {
          setErr("Could not resolve address. Type it manually.");
        }
      } catch {
        if (!silent) {
          setErr(
            "Location permission denied or unavailable. Allow location or enter address manually."
          );
        }
      } finally {
        setLocating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!open) {
      autoFetchDoneRef.current = false;
      return;
    }
    if (autoFetchDoneRef.current) return;
    if (address.trim()) return;

    autoFetchDoneRef.current = true;
    const t = window.setTimeout(() => {
      void fillAddressFromLocation({ silent: true });
    }, 400);

    return () => window.clearTimeout(t);
  }, [open, address, fillAddressFromLocation]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const p = phone.trim();
    const a = address.trim();
    if (!n || !p || !a) {
      setErr("Please fill all fields.");
      return;
    }
    if (p.length !== 10) {
      setErr("Please enter a valid 10-digit phone number.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        customerName: n,
        customerPhone: "+91" + p,
        customerAddress: a,
      });
    } catch {
      setErr("Could not place order. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[4px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-[#d5b16a]/30 bg-[#070707] shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-3xl sm:animate-in sm:fade-in sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="flex items-center justify-between border-b border-[#d5b16a]/15 px-5 py-4 bg-[#0a0a0a]">
          <h2
            id="checkout-title"
            className="font-serif text-xl font-bold text-[#f5d79e]"
          >
            Delivery Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#d5b16a]/50 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5"
        >
          <label className="block">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">
              Full Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your name"
              className="mt-1.5 w-full rounded-xl border border-[#d5b16a]/20 bg-[#111111] px-4 py-3 font-body text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/20 focus:border-[#d5b16a]/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">
              Mobile Number
            </span>
            <div className="relative mt-1.5 flex items-center">
              <span className="absolute left-4 text-sm font-semibold text-[#d5b16a]/60">+91</span>
              <input
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                }}
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit number"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#111111] pl-12 pr-4 py-3 font-body text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/20 focus:border-[#d5b16a]/40 focus:ring-2"
              />
            </div>
          </label>
          <label className="block">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">
                Delivery Address
              </span>
              <button
                type="button"
                onClick={() => void fillAddressFromLocation({ silent: false })}
                disabled={locating || busy}
                className="font-body text-[10px] font-bold uppercase tracking-widest text-[#d5b16a] hover:text-[#f5d79e] transition-colors disabled:opacity-50"
              >
                {locating ? "Locating…" : "Use GPS"}
              </button>
            </div>
            <div className="relative mt-1.5">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                autoComplete="street-address"
                placeholder="Door no, Street, Landmark..."
                className="w-full resize-none rounded-xl border border-[#d5b16a]/20 bg-[#111111] px-4 py-3 pr-12 font-body text-sm text-[#f3e8c7] outline-none ring-[#d5b16a]/20 focus:border-[#d5b16a]/40 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void fillAddressFromLocation({ silent: false })}
                disabled={locating || busy}
                className="absolute right-2 top-2 rounded-lg p-2 text-[#d5b16a] transition hover:bg-[#d5b16a]/10 disabled:opacity-50"
                aria-label="Fill address from current location"
              >
                {locating ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <MapPin className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </label>

          {err && (
            <p className="text-center text-xs font-bold uppercase tracking-widest text-rose-400" role="alert">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || locating}
            className="w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-4 font-serif text-sm font-bold uppercase tracking-[0.2em] text-black shadow-lg shadow-[#d5b16a]/20 transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Processing…" : "Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
