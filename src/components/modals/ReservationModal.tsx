"use client";

import { useState } from "react";
import { X, Calendar, Clock, Users, Mail, User, CheckCircle } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    guests: 2,
    reservationDate: "",
    reservationTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, email: e.target.value });
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(form.email)) return;

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.email, // Send email in the phone field to avoid backend API changes
        guests: form.guests,
        reservationDate: form.reservationDate,
        reservationTime: form.reservationTime,
      };

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert(data.error || "Failed to book");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[2.5rem] border border-[#d5b16a]/20 bg-[#0a0a0a] p-8 shadow-[0_20px_100px_rgba(0,0,0,0.8)] sm:p-12">
        <button onClick={onClose} className="absolute right-8 top-8 text-[#d5b16a]/40 hover:text-[#d5b16a]">
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-10 mb-8">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle size={48} strokeWidth={2.5} />
              </div>
              <h2 className="font-serif text-4xl text-emerald-400 mb-4">Request Submitted</h2>
              <p className="text-[#f3e8c7]/80 text-lg font-medium">Your royal table is being prepared.</p>
            </div>

            <p className="text-[#f3e8c7]/60 leading-relaxed max-w-sm mx-auto">
              Thank you! Your reservation request has been received.<br />
              A confirmation will be sent to your royal email shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-10 w-full rounded-full bg-[#d5b16a] py-5 text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d5b16a]/20 transition-transform active:scale-95"
            >
              Back to Menu
            </button>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="font-serif text-4xl text-[#f5d79e]">Book a Table</h2>
              <p className="mt-2 text-sm text-[#f3e8c7]/40 uppercase tracking-[0.2em]">Secure your royal dining experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <User size={12} /> Name
                  </label>
                  <input
                    required
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Maharajah Singh"
                    className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Mail size={12} /> Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={handleEmailChange}
                    placeholder="e.g. example@email.com"
                    className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a]"
                  />
                  {emailError && <p className="text-xs text-rose-400 mt-1 ml-1">{emailError}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Calendar size={12} /> Date
                  </label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.reservationDate}
                    onChange={e => setForm({ ...form, reservationDate: e.target.value })}
                    className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Clock size={12} /> Time
                  </label>
                  <input
                    required
                    type="time"
                    value={form.reservationTime}
                    onChange={e => setForm({ ...form, reservationTime: e.target.value })}
                    className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a] [color-scheme:dark]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Users size={12} /> Number of Guests
                  </label>
                  <select
                    value={form.guests}
                    onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#d5b16a]/20 bg-white/5 p-4 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => (
                      <option key={n} value={n} className="bg-[#111]">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-5 text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d5b16a]/20 transition-transform active:scale-95"
              >
                {loading ? "Processing..." : "Confirm Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
