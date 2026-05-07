"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Mail, User } from "lucide-react";

type Props = {
  open: boolean;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  onClose?: () => void;
};

export function OrderConfirmationModal({
  open,
  orderNumber,
  customerName,
  customerEmail,
  customerAddress,
  onClose,
}: Props) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowContent(false);
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <button
        type="button"
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-[#d5b16a]/30 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Header Background */}
        <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#070707] px-6 pt-10 pb-16 border-b border-[#d5b16a]/15">
          {/* Checkmark Animation */}
          <div
            className={`flex justify-center transition-all duration-1000 ${
              showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-[#d5b16a]/20 scale-150"></div>
              <CheckCircle2 className="relative h-20 w-20 text-[#d5b16a] drop-shadow-[0_0_15px_rgba(213,177,106,0.5)]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-8">
          {/* Main Message */}
          <div
            className={`space-y-2 text-center transition-all duration-700 delay-200 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="font-serif text-2xl font-bold text-[#f5d79e]">
              Order Confirmed!
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]/60">
              Reference #{orderNumber}
            </p>
          </div>

          {/* Delivery Details */}
          <div
            className={`space-y-4 rounded-2xl bg-white/5 border border-[#d5b16a]/10 p-5 transition-all duration-700 delay-300 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {/* Name */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#d5b16a]/10 p-2">
                <User className="h-4 w-4 text-[#d5b16a]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#d5b16a]/50">
                  Recipient
                </p>
                <p className="mt-0.5 text-[14px] font-bold text-[#f3e8c7]">
                  {customerName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#d5b16a]/10 p-2">
                <Mail className="h-4 w-4 text-[#d5b16a]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#d5b16a]/50">
                  Confirmation
                </p>
                <p className="mt-0.5 text-[14px] font-bold text-[#f3e8c7]">
                  {customerEmail}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#d5b16a]/10 p-2">
                <MapPin className="h-4 w-4 text-[#d5b16a]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#d5b16a]/50">
                  Destination
                </p>
                <p className="mt-0.5 text-[14px] font-bold text-[#f3e8c7] line-clamp-2 leading-snug">
                  {customerAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Wait Message */}
          <div
            className={`space-y-2 rounded-2xl bg-[#d5b16a]/5 border border-[#d5b16a]/10 p-5 transition-all duration-700 delay-400 ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#d5b16a] animate-pulse"></div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#d5b16a]">
                Preparation Phase
              </p>
            </div>
            <p className="text-[13px] leading-relaxed text-[#f3e8c7]/70">
              Your royal feast will be ready in <span className="font-bold text-[#f5d79e]">15 to 25 minutes</span>.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] px-4 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#d5b16a]/20 transition-all duration-700 delay-500 hover:brightness-110 active:scale-[0.98] ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Track Royal Order
          </button>
        </div>
      </div>
    </div>
  );
}
