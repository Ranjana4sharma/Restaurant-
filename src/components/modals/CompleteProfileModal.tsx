"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useCart } from "@/features/cart/cart-context";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, LocateFixed, Loader2, User, Sparkles, ShoppingBag, X } from "lucide-react";
import toast from "react-hot-toast";

export function CompleteProfileModal() {
  const { user, mustCompleteProfile, setMustCompleteProfile, refresh } = useAuth();
  const { lines, clear, appliedOffer } = useCart();
  const router = useRouter();
  
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [step, setStep] = useState(1);
  const [autoOrderMsg, setAutoOrderMsg] = useState("");

  useEffect(() => {
    if (user?.address && user.address !== "Pending details") {
      setAddress(user.address);
    }
  }, [user]);

  const fetchCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            toast.success("Location found successfully");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || address === "Pending details") {
      toast.error("Please enter a valid address");
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile Address
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          address,
          name: user?.name,
          email: user?.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update address");
      }

      // 2. Refresh Auth State
      await refresh();

      // 3. Check if cart has items for auto-order
      if (lines.length > 0) {
        setAutoOrderMsg("Placing your royal order...");
        const checkoutRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lines,
            customerName: user?.name,
            customerEmail: user?.email,
            customerAddress: address,
            offerId: appliedOffer?._id,
          }),
        });

        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          clear();
          setStep(2);
          setTimeout(() => {
            setMustCompleteProfile(false);
            router.push(`/order/${checkoutData.order.orderNumber}`);
          }, 2000);
          return;
        }
      }

      // Normal path if no items in cart
      setStep(2);
      setTimeout(() => {
        setMustCompleteProfile(false);
      }, 2000);
      
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!mustCompleteProfile) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/95 backdrop-blur-2xl transition-opacity animate-in fade-in duration-700">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={() => setMustCompleteProfile(false)}
      />

      <div className="min-h-full flex justify-center p-4 sm:p-12">
        {/* Modal Container */}
        <div className="relative w-full max-w-[500px] bg-[#050505] border border-[#d5b16a]/30 rounded-[3rem] shadow-[0_0_150px_rgba(213,177,106,0.15)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 my-auto">
          
          {/* Close Button */}
          <button 
            onClick={() => setMustCompleteProfile(false)}
            className="absolute right-10 top-10 z-[210] p-2 rounded-full bg-white/5 text-[#d5b16a]/50 hover:text-[#d5b16a] hover:bg-white/10 transition-all border border-white/5 shadow-lg"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Subtle background glow */}
          <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-[#d5b16a]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="px-8 pt-12 pb-10 sm:px-12">
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-3xl bg-[#d5b16a]/10 border border-[#d5b16a]/30 flex items-center justify-center shadow-inner relative group">
                    <div className="absolute inset-0 bg-[#d5b16a]/20 blur-2xl group-hover:blur-3xl transition-all rounded-full opacity-50" />
                    <Sparkles className="w-10 h-10 text-[#d5b16a] relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-3xl font-bold text-[#f5d79e] tracking-tight">Your account is created!</h2>
                    <p className="text-[#d5b16a]/60 text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed max-w-[280px] mx-auto">
                      Please fill address to complete order process
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-[#d5b16a]/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d5b16a]/10 flex items-center justify-center border border-[#d5b16a]/20">
                    <User className="w-5 h-5 text-[#d5b16a]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold">Welcome,</p>
                    <p className="text-sm font-serif text-[#f3e8c7]">{user?.name}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold flex items-center gap-2">
                        <MapPin size={12} /> Delivery Address
                      </label>
                      <button 
                        type="button"
                        onClick={fetchCurrentLocation}
                        disabled={locating}
                        className="text-[10px] uppercase tracking-widest text-[#d5b16a] font-bold hover:text-[#f5d79e] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                        Use GPS
                      </button>
                    </div>
                    <div className="relative group">
                      <textarea
                        required
                        placeholder="e.g. House No. 42, Royal Residency, Palace Road..."
                        value={address === "Pending details" ? "" : address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all min-h-[120px] resize-none text-sm leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-5 text-sm font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d5b16a]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {autoOrderMsg || "Saving Address..."}
                        </>
                      ) : (
                        <>
                          {lines.length > 0 ? "Complete Order" : "Complete Setup"}
                          {lines.length > 0 ? <ShoppingBag className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-serif text-3xl font-bold text-emerald-400">{lines.length > 0 ? "Order Placed!" : "All Set!"}</h3>
                  <p className="text-[#d5b16a]/60 text-[10px] font-bold uppercase tracking-[0.3em]">{lines.length > 0 ? "Royal Feast Incoming" : "Profile Completed"}</p>
                </div>
                <p className="text-[#f3e8c7]/40 text-xs text-center leading-relaxed">
                  {lines.length > 0 
                    ? "Your order has been placed successfully using your new address. Redirecting to tracking..." 
                    : "Your royal profile is now complete. Redirecting you to the menu..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
