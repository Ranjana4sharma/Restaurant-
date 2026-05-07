"use client";

import { X } from "lucide-react";
import { AuthFlow } from "@/components/auth/AuthFlow";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-500">
      {/* Backdrop Area */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="min-h-full flex justify-center p-4 sm:p-12">
        {/* Modal Container */}
        <div className="relative w-full max-w-[550px] bg-[#050505] border border-[#d5b16a]/20 rounded-[3rem] shadow-[0_0_120px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 my-auto">
          {/* Glow Effect */}
          <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-[#d5b16a]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-[100px] -right-[100px] w-[300px] h-[300px] bg-[#d5b16a]/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute right-10 top-10 z-[150] p-2 rounded-full bg-white/5 text-[#d5b16a]/50 hover:text-[#d5b16a] hover:bg-white/10 transition-all border border-white/5 shadow-lg"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-8 pt-12 pb-10 sm:px-12">
            <AuthFlow onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
