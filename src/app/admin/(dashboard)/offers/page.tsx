"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Search, Gift } from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    badge: "",
    isActive: true,
    isAutoApply: false
  });

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      setOffers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingOffer ? `/api/admin/offers/${editingOffer._id}` : "/api/admin/offers";
    const method = editingOffer ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setModalOpen(false);
      setEditingOffer(null);
      setFormData({
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        badge: "",
        isActive: true,
        isAutoApply: false
      });
      fetchOffers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this royal offer?")) return;
    const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    if (res.ok) fetchOffers();
  };

  const toggleActive = async (offer: any) => {
    const res = await fetch(`/api/admin/offers/${offer._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !offer.isActive })
    });
    if (res.ok) fetchOffers();
  };

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-[#f3e8c7]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl text-[#f5d79e]">Royal Offers Management</h1>
            <p className="mt-2 text-sm text-[#f3e8c7]/40 uppercase tracking-[0.2em]">Curate the finest benefits for your guests</p>
          </div>
          <button 
            onClick={() => {
              setEditingOffer(null);
              setFormData({
                title: "",
                description: "",
                discountType: "percentage",
                discountValue: 0,
                minOrderValue: 0,
                maxDiscount: 0,
                badge: "",
                isActive: true,
                isAutoApply: false
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-[#d5b16a] px-8 py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] hover:bg-[#f5d79e] transition"
          >
            <Plus size={18} /> Add New Offer
          </button>
        </div>

        {/* Stats & Search */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-[#111] border border-[#d5b16a]/10 rounded-2xl p-4">
            <div className="h-10 w-10 rounded-xl bg-[#d5b16a]/10 flex items-center justify-center">
              <Gift className="text-[#d5b16a]" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-[#f3e8c7]/40 uppercase tracking-widest">Total Active Offers</p>
              <p className="text-xl font-bold">{offers.filter(o => o.isActive).length}</p>
            </div>
          </div>
          
          <div className="relative group flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search offers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#d5b16a]/10 bg-[#111] py-3 pl-12 pr-6 text-sm text-[#f3e8c7] outline-none transition-all placeholder:text-[#f3e8c7]/20 focus:border-[#d5b16a]/40"
            />
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <div 
              key={offer._id} 
              className={`group relative rounded-3xl border border-[#d5b16a]/10 bg-gradient-to-br from-[#111] to-[#080808] p-6 transition-all hover:border-[#d5b16a]/30 ${!offer.isActive && 'opacity-60'}`}
            >
              <div className="absolute right-4 top-4 flex gap-2">
                <button 
                  onClick={() => {
                    setEditingOffer(offer);
                    setFormData({
                      title: offer.title,
                      description: offer.description,
                      discountType: offer.discountType,
                      discountValue: offer.discountValue,
                      minOrderValue: offer.minOrderValue || 0,
                      maxDiscount: offer.maxDiscount || 0,
                      badge: offer.badge || "",
                      isActive: offer.isActive,
                      isAutoApply: offer.isAutoApply || false
                    });
                    setModalOpen(true);
                  }}
                  className="rounded-full bg-[#111111]/5 p-2 text-[#f3e8c7]/40 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] transition"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(offer._id)}
                  className="rounded-full bg-[#111111]/5 p-2 text-[#f3e8c7]/40 hover:bg-rose-500/10 hover:text-rose-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-4">
                <span className={`inline-block rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${offer.isActive ? 'bg-[#d5b16a]/10 text-[#d5b16a]' : 'bg-[#111111]/5 text-white/20'}`}>
                  {offer.isActive ? 'Active' : 'Disabled'}
                </span>
                {offer.isAutoApply && (
                  <span className="ml-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                    Auto-Apply
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl text-[#f5d79e]">{offer.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#f3e8c7]/40">{offer.description}</p>

              <div className="mt-6 flex items-center justify-between border-t border-[#d5b16a]/5 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#f3e8c7]/20">Discount</p>
                  <p className="text-lg font-bold text-[#f3e8c7]">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#f3e8c7]/20 text-right">Min Order</p>
                  <p className="text-lg font-bold text-[#f3e8c7] text-right">₹{offer.minOrderValue || 0}</p>
                </div>
              </div>

              <button 
                onClick={() => toggleActive(offer)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d5b16a]/10 bg-[#111111]/5 py-2 text-[10px] font-bold uppercase tracking-widest transition hover:bg-[#111111]/10"
              >
                {offer.isActive ? <ToggleRight className="text-[#d5b16a]" /> : <ToggleLeft />}
                {offer.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-[#d5b16a]/20 bg-[#0a0a0a] p-8 shadow-[0_20px_100px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto">
            <h2 className="font-serif text-3xl text-[#f5d79e] mb-6">
              {editingOffer ? 'Edit Royal Offer' : 'Craft New Royal Offer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Offer Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                    placeholder="e.g. Royal Weekend Feast"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Description</label>
                  <textarea 
                    required
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                    placeholder="Describe the royal benefits..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40"
                  >
                    <option value="percentage" className="bg-[#111] text-white">Percentage (%)</option>
                    <option value="fixed" className="bg-[#111] text-white">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Value</label>
                  <input 
                    type="number" 
                    required
                    value={formData.discountValue}
                    onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Min Order (₹)</label>
                  <input 
                    type="number" 
                    value={formData.minOrderValue}
                    onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Max Discount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.maxDiscount}
                    onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Badge Text (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.badge}
                    onChange={e => setFormData({...formData, badge: e.target.value})}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111111]/5 p-3 text-sm text-white outline-none focus:border-[#d5b16a]/40" 
                    placeholder="e.g. LIMITED OFFER"
                  />
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.isActive ? 'bg-[#d5b16a] border-[#d5b16a]' : 'border-white/20 bg-[#111111]/5'}`}>
                      {formData.isActive && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f3e8c7]/60 group-hover:text-[#f3e8c7]">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isAutoApply}
                      onChange={e => setFormData({...formData, isAutoApply: e.target.checked})}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.isAutoApply ? 'bg-[#d5b16a] border-[#d5b16a]' : 'border-white/20 bg-[#111111]/5'}`}>
                      {formData.isAutoApply && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f3e8c7]/60 group-hover:text-[#f3e8c7]">Auto-Apply</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3 pt-6 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#111111]/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] rounded-xl bg-[#d5b16a] py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#f5d79e] transition shadow-[0_10px_20px_rgba(213,177,106,0.2)]"
                >
                  {editingOffer ? 'Save Changes' : 'Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
