"use client";

import { useState } from "react";
import { X, Phone, Lock, Loader2, User } from "lucide-react";
import { loginCustomer } from "@/services/customer";
import { useAuth } from "@/features/auth/auth-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginCustomer(identifier, password);
      await refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid name or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto rounded-[2rem] bg-[#0a0a0a] border border-[#d5b16a]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 scrollbar-hide">
        {/* Header with Background Pattern */}
        <div className="relative bg-gradient-to-br from-[#1a150c] to-[#0c0a05] p-8 text-[#f3e8c7] border-b border-[#d5b16a]/20">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #d5b16a 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10 text-[#d5b16a] z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d5b16a]/10 border border-[#d5b16a]/30 backdrop-blur-md">
              <User className="h-8 w-8 text-[#d5b16a]" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#f5d79e]">Welcome Back</h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-[#d5b16a]/60 text-center">Login to your royal account</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 p-4 text-xs font-bold uppercase tracking-widest text-rose-400 border border-rose-500/20 text-center">
                {error.includes("401") ? "Invalid name or password" : error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/60 font-bold ml-1">Full Name</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#d5b16a]/40 group-focus-within:text-[#d5b16a] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 py-4 pl-12 pr-4 text-[#f3e8c7] transition-all focus:bg-white/10 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/60 font-bold ml-1">Password</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#d5b16a]/40 group-focus-within:text-[#d5b16a] transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 py-4 pl-12 pr-4 text-[#f3e8c7] transition-all focus:bg-white/10 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d5b16a] py-4 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_10px_30px_rgba(213,177,106,0.2)] transition-all hover:bg-[#f5d79e] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Enter Restaurant"
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-[#d5b16a]/20 py-4 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:bg-white/5 hover:text-[#d5b16a] transition-all"
              >
                Back to Menu
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-[#d5b16a]/40 font-medium">
            Don't have an account? <br />
            <span className="font-bold text-[#d5b16a] mt-1 inline-block">Create one during checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
