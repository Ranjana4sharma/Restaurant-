"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, Users, Calendar, MessageSquare, Search } from "lucide-react";
import type { ReservationDTO } from "@/types";

export default function AdminReservationsPage() {
  const [list, setList] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [noteModal, setNoteModal] = useState<{ id: string; status: "approved" | "rejected" } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchList = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Failed to load reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleUpdate = async () => {
    if (!noteModal) return;
    try {
      const res = await fetch(`/api/admin/reservations/${noteModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: noteModal.status, adminNote }),
      });
      if (res.ok) {
        setNoteModal(null);
        setAdminNote("");
        fetchList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = list.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    r.trackId.includes(searchTerm.toUpperCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-[#f3e8c7]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl text-[#f5d79e]">Table Reservations</h1>
            <p className="mt-2 text-sm text-[#f3e8c7]/40 uppercase tracking-[0.2em]">Manage your royal guest list</p>
          </div>
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Track ID, Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#d5b16a]/10 bg-[#111] py-3 pl-12 pr-6 text-sm text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a]/40"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center py-20 text-[#f3e8c7]/40 uppercase tracking-widest">Loading reservations...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center py-20 text-[#f3e8c7]/40 uppercase tracking-widest">No reservations found</p>
          ) : (
            filtered.map((r) => (
              <div key={r._id} className={`group relative rounded-3xl border border-[#d5b16a]/10 bg-gradient-to-br from-[#111] to-[#080808] p-6 transition-all hover:border-[#d5b16a]/30 ${r.status === 'rejected' ? 'opacity-60' : ''}`}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#d5b16a]">
                    {r.trackId}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                    r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                    r.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 
                    'bg-[#d5b16a]/10 text-[#d5b16a]'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#f5d79e]">{r.fullName}</h3>
                <p className="mt-1 text-sm text-[#f3e8c7]/60">{r.phone}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#d5b16a]/5 pt-6">
                  <div className="flex items-center gap-2 text-[#f3e8c7]/40">
                    <Calendar size={14} className="text-[#d5b16a]" />
                    <span className="text-xs">{r.reservationDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#f3e8c7]/40">
                    <Clock size={14} className="text-[#d5b16a]" />
                    <span className="text-xs">{r.reservationTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#f3e8c7]/40">
                    <Users size={14} className="text-[#d5b16a]" />
                    <span className="text-xs">{r.guests} Guests</span>
                  </div>
                </div>

                {r.notes && (
                  <div className="mt-4 flex gap-2 rounded-xl bg-black/40 p-3">
                    <MessageSquare size={14} className="shrink-0 text-[#d5b16a]/40" />
                    <p className="text-[11px] text-[#f3e8c7]/60 italic line-clamp-2">{r.notes}</p>
                  </div>
                )}

                {r.adminNote && (
                  <div className="mt-3 text-[10px] text-rose-400/80">
                    <span className="font-bold uppercase">Admin Note:</span> {r.adminNote}
                  </div>
                )}

                {r.status === 'pending' && (
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => { setNoteModal({ id: r._id, status: 'approved' }); setAdminNote(""); }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => { setNoteModal({ id: r._id, status: 'rejected' }); setAdminNote(""); }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-[#d5b16a]/20 bg-[#0a0a0a] p-8 shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
            <h2 className="font-serif text-2xl text-[#f5d79e] mb-2 capitalize">
              {noteModal.status} Reservation
            </h2>
            <p className="text-xs text-[#f3e8c7]/40 mb-6 uppercase tracking-widest">
              {noteModal.status === 'rejected' ? 'Please provide a reason for the guest' : 'Any special message for the guest? (Optional)'}
            </p>
            
            <textarea 
              autoFocus
              required={noteModal.status === 'rejected'}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={noteModal.status === 'rejected' ? "e.g. Sorry, we are fully booked for this slot." : "e.g. Welcome! We look forward to serving you."}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-[#111] p-4 text-sm text-white outline-none focus:border-[#d5b16a]/40 resize-none"
            />

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setNoteModal(null)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={noteModal.status === 'rejected' && !adminNote.trim()}
                className="flex-[2] rounded-xl bg-[#d5b16a] py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#f5d79e] transition disabled:opacity-50"
              >
                Confirm {noteModal.status}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
