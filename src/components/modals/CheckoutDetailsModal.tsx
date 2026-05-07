"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2, KeyRound, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { signIn } from "next-auth/react";
import { loginCustomer } from "@/services/customer";
import toast from "react-hot-toast";

import { AuthFlow } from "@/components/auth/AuthFlow";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerEmail: string;
    customerAddress: string;
  }) => Promise<void>;
};

export function CheckoutDetailsModal({ open, onClose, onSubmit }: Props) {
  // --- Checkout Form State ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- Auth Flow State ---
  const { isLoggedIn, user } = useAuth();

  // Autofill when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.address) setAddress(user.address);
    }
  }, [isLoggedIn, user]);

  const fetchAddressFromPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setAddress(prev => prev ? `${prev}, ${postOffice.Name}, ${postOffice.District}, ${postOffice.State}` : `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            if (data.address && data.address.postcode) {
              setPincode(data.address.postcode);
            }
          }
        } catch (e) {
          console.error(e);
          toast.error("Could not fetch address");
        } finally {
          setLocating(false);
        }
      }, () => {
        toast.error("Location permission denied");
        setLocating(false);
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return; 
    setErr(null);
    const n = name.trim();
    const em = email.trim();
    const a = address.trim();
    if (!n || !em || !a) {
      setErr("Please fill all fields.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ 
        customerName: n, 
        customerEmail: em, 
        customerAddress: `${a}${pincode ? ` - ${pincode}` : ''}` 
      });
    } catch {
      setErr("Could not place order. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[min(95dvh,850px)] w-full flex-col overflow-hidden rounded-t-[3rem] border border-[#d5b16a]/30 bg-[#070707] shadow-2xl animate-in slide-in-from-bottom duration-500 sm:rounded-[3rem] ${isLoggedIn ? 'max-w-3xl' : 'max-w-[550px]'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d5b16a]/15 px-6 py-5 sm:px-8 sm:py-6 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-2xl font-bold text-[#f5d79e]">
              {isLoggedIn ? "Finalize Your Feast" : "Secure Checkout"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-[#d5b16a] transition-colors hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 custom-scrollbar">
          {!isLoggedIn ? (
            <AuthFlow onSuccess={() => {}} />
          ) : (
            <div className="animate-in zoom-in-95 duration-500">
              <form id="checkout-finalize-form" onSubmit={handleCheckoutSubmit} className="space-y-8">
                <div className="rounded-3xl border border-[#d5b16a]/20 bg-[#d5b16a]/5 p-6 flex items-center justify-between shadow-lg">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a]/70">Logged in as</p>
                    <p className="font-serif text-[20px] font-bold text-[#f5d79e] leading-tight">{user?.name || user?.email?.split('@')[0] || "Guest"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-[#d5b16a]/10 rounded-full overflow-hidden w-24">
                        <div className="h-full bg-[#d5b16a]" style={{ width: `${user?.completionPercentage || 0}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-[#d5b16a]/60 uppercase tracking-tighter">{user?.completionPercentage || 0}% Complete</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-[#d5b16a]/10 border border-[#d5b16a]/20 flex items-center justify-center shadow-inner">
                    <UserPlus size={24} className="text-[#d5b16a]" />
                  </div>
                </div>

                <div className="space-y-6 mt-8">
                  {(!isLoggedIn || !user?.name) && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a]/70 ml-1">Delivery Name</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Who should we address?"
                        className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-[15px] text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a] focus:bg-white/10"
                        required
                      />
                    </div>
                  )}
                  
                  {(!isLoggedIn || !user?.email) && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a]/70 ml-1">Contact Email</span>
                      <input
                        value={email}
                        readOnly={isLoggedIn}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full rounded-2xl border border-[#d5b16a]/10 bg-[#0a0a0a] p-4 text-[15px] text-[#f3e8c7] outline-none ${isLoggedIn ? 'cursor-not-allowed opacity-50' : 'focus:border-[#d5b16a] focus:bg-white/10'}`}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a]/70">Delivery Address</span>
                      <button
                        type="button"
                        disabled={locating}
                        onClick={fetchCurrentLocation}
                        className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a] hover:text-[#f5d79e] transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                        GPS Autofill
                      </button>
                    </div>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      placeholder="Enter your full street address with landmarks"
                      className="w-full resize-none rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-[15px] text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a] focus:bg-white/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#d5b16a]/70 ml-1">Pincode</span>
                    <input
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPincode(val);
                        if (val.length === 6) fetchAddressFromPincode(val);
                      }}
                      placeholder="e.g. 110001"
                      className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-[15px] text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a] focus:bg-white/10"
                    />
                  </div>
                </div>

                {err && (
                  <p className="text-center text-[13px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 py-3 rounded-xl border border-rose-500/20" role="alert">
                    {err}
                  </p>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={busy || !isLoggedIn}
                    className="w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-5 text-center text-[15px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#d5b16a]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="mx-auto animate-spin" /> : "Place Royal Order"}
                  </button>
                  <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-[#d5b16a]/40 font-bold">Fastest delivery within 45 mins guaranteed</p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
