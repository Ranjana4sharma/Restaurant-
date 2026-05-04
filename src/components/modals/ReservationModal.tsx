"use client";

import { useState } from "react";
import { X, Calendar, Clock, Users, Phone, User, CheckCircle } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    guests: 2,
    reservationDate: "",
    reservationTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [trackId, setTrackId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setTrackId(data.trackId);
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

        {trackId ? (
          <div className="py-10 text-center animate-[fadeUp_0.4s_ease-out]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={40} />
            </div>
            <h2 className="font-serif text-3xl text-[#f5d79e]">Request Submitted</h2>
            <p className="mt-4 text-[#f3e8c7]/60 leading-relaxed">
              Your royal table request has been received. We will notify you once it's approved.
            </p>
            <div className="mt-8 rounded-2xl bg-[#d5b16a]/10 p-6 border border-[#d5b16a]/20">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#d5b16a] mb-1">Track ID</p>
              <p className="font-serif text-4xl text-[#f5d79e] tracking-widest">{trackId}</p>
            </div>
            <button 
              onClick={onClose}
              className="mt-10 w-full rounded-2xl bg-[#d5b16a] py-4 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-lg shadow-[#d5b16a]/20"
            >
              Close Window
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
                    <User size={12} /> Full Name
                  </label>
                  <input 
                    required
                    value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})}
                    placeholder="e.g. Maharajah Singh"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input 
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40"
                  />
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
                    onChange={e => setForm({...form, reservationDate: e.target.value})}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40 [color-scheme:dark]"
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
                    onChange={e => setForm({...form, reservationTime: e.target.value})}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40 [color-scheme:dark]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 mb-2">
                    <Users size={12} /> Number of Guests
                  </label>
                  <select 
                    value={form.guests}
                    onChange={e => setForm({...form, guests: Number(e.target.value)})}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40"
                  >
                    {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                      <option key={n} value={n} className="bg-[#111]">{n} {n===1?'Guest':'Guests'}</option>
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
