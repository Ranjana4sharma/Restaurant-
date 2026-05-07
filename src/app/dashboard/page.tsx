"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useCart } from "@/features/cart/cart-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { isLoggedIn, user, loading: authLoading, logout, refresh } = useAuth();
  const { addLine, clear } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    email: "",
    gender: "",
    birthDate: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/home");
    }
  }, [authLoading, isLoggedIn, router]);

  const fetchData = async () => {
    if (isLoggedIn) {
      try {
        const [dashRes, reservRes] = await Promise.all([
          fetch("/api/customer/dashboard", { credentials: "include" }),
          fetch("/api/customer/reservations", { credentials: "include" })
        ]);

        if (dashRes.ok) {
          const data = await dashRes.json();
          if (data.profile) {
            setOrders(data.orders || []);
            setDashboardData(data);
            setEditForm({
              name: data.profile.name || "",
              address: data.profile.address || "",
              email: data.profile.email || "",
              gender: data.profile.gender || "",
              birthDate: data.profile.birthDate || "",
            });
          }
        }

        if (reservRes.ok) {
          const resvData = await reservRes.json();
          setReservations(resvData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedOrders(prev => 
      prev.length === orders.length ? [] : orders.map(o => o._id)
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/customer/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedOrders }),
      });
      if (res.ok) {
        setSelectedOrders([]);
        await fetchData();
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const [reorderItemData, setReorderItemData] = useState<any>(null);
  const [reorderProcessing, setReorderProcessing] = useState(false);

  const handleReorder = async (order: any, addToCartOnly: boolean) => {
    setReorderProcessing(true);
    if (addToCartOnly) {
      clear();
      order.items.forEach((item: any) => {
        addLine({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      });
      setReorderItemData(null);
      router.push("/home?cart=open");
    } else {
      try {
        const payload: any = {
          items: order.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          password: "ALREADY_LOGGED_IN",
        };
        
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
          const data = await res.json();
          setReorderItemData(null);
          router.push(`/order/${data.order.orderNumber}`);
        } else {
          const d = await res.json();
          alert(d.error || "Failed to reorder");
          setReorderProcessing(false);
        }
      } catch (e) {
        alert("Something went wrong");
        setReorderProcessing(false);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await refresh();
        await fetchData();
        setIsEditing(false);
      } else {
        const d = await res.json();
        alert(d.error || "Update failed");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setUpdateLoading(false);
    }
  };

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to remove this order from your history?")) return;
    try {
      const res = await fetch(`/api/customer/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok || res.status === 404) {
        await fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete order");
      }
    } catch (e) {
      alert("Something went wrong");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#d5b16a]">
        <p className="animate-pulse font-serif text-2xl">Loading Royalty...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const missingFields = dashboardData?.profile?.missingFields || [];

  return (
    <main className="min-h-screen bg-[#050505] text-[#f3e8c7] selection:bg-[#d5b16a]/30">
      {/* Header */}
      <nav className="border-b border-[#d5b16a]/15 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/home" className="font-serif text-xl tracking-tighter text-[#f5d79e]">
            The Royal <span className="text-[#d5b16a]">Platter</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/home" className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:text-[#d5b16a]">Home</Link>
            <button onClick={logout} className="text-[10px] font-bold uppercase tracking-widest text-rose-400/70 hover:text-rose-400">Logout</button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Sidebar / Profile */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-3xl border border-[#d5b16a]/20 bg-[#0a0a0a] p-8">
              {!isEditing ? (
                <div className="text-center">
                  <div className="relative mx-auto h-28 w-28">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <path className="text-[#d5b16a]/10" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path className="text-[#d5b16a]" strokeDasharray={`${dashboardData?.profile?.completionPercentage || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-serif font-bold text-[#f5d79e] leading-none mb-1">{dashboardData?.profile?.initials}</span>
                      <span className="text-[10px] font-bold text-[#d5b16a]">{dashboardData?.profile?.completionPercentage || 0}%</span>
                    </div>
                  </div>
                  <h2 className="mt-6 font-serif text-3xl text-[#f5d79e]">{user?.name}</h2>
                  <p className="text-xs text-[#d5b16a]/60 uppercase tracking-widest mt-1">{user?.phone}</p>
                  
                  <div className="mt-8 pt-8 border-t border-[#d5b16a]/10 text-left space-y-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-[#d5b16a]/40 mb-1">Default Address</p>
                      <p className="text-xs text-[#f3e8c7]/70 leading-relaxed">{user?.address}</p>
                    </div>
                    {user?.email && (
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#d5b16a]/40 mb-1">Email Address</p>
                        <p className="text-xs text-[#f3e8c7]/70">{user?.email}</p>
                      </div>
                    )}
                    
                    {missingFields.length > 0 && (
                      <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/10">
                        <p className="text-[9px] uppercase tracking-widest text-amber-500 mb-2">Incomplete Profile</p>
                        <div className="flex flex-wrap gap-2">
                          {missingFields.map((f: string) => (
                            <button key={f} onClick={() => setIsEditing(true)} className="text-[10px] text-amber-200/50 hover:text-amber-200 transition">+ Add {f}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full rounded-full border border-[#d5b16a]/30 py-3 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a] hover:bg-[#d5b16a]/10 transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <h3 className="font-serif text-xl text-[#f5d79e] mb-6">Update Details</h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-[#111] border border-[#d5b16a]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d5b16a]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50">Delivery Address</label>
                    <textarea 
                      value={editForm.address} 
                      onChange={e => setEditForm({...editForm, address: e.target.value})}
                      className="w-full bg-[#111] border border-[#d5b16a]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d5b16a] h-20 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50">Email Address</label>
                    <input 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="w-full bg-[#111] border border-[#d5b16a]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d5b16a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50">Gender</label>
                      <select 
                        value={editForm.gender} 
                        onChange={e => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full bg-[#111] border border-[#d5b16a]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d5b16a]"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50">Birth Date</label>
                      <input 
                        type="date" 
                        value={editForm.birthDate} 
                        onChange={e => setEditForm({...editForm, birthDate: e.target.value})}
                        className="w-full bg-[#111] border border-[#d5b16a]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d5b16a]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={updateLoading}
                      className="flex-1 rounded-full bg-[#d5b16a] py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#f5d79e] transition disabled:opacity-50"
                    >
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-full border border-[#d5b16a]/20 py-3 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:bg-[#d5b16a]/5 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Main Content / History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#d5b16a]/10 pb-6">
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`relative pb-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'text-[#f5d79e]' : 'text-[#f3e8c7]/30 hover:text-[#f3e8c7]/60'}`}
                >
                  Royal Orders
                  {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d5b16a]" />}
                </button>
                <button 
                  onClick={() => setActiveTab("reservations")}
                  className={`relative pb-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'reservations' ? 'text-[#f5d79e]' : 'text-[#f3e8c7]/30 hover:text-[#f3e8c7]/60'}`}
                >
                  Table Reservations
                  {activeTab === 'reservations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d5b16a]" />}
                </button>
              </div>
              
              {activeTab === "orders" && orders.length > 0 && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:text-[#d5b16a] transition"
                  >
                    {selectedOrders.length === orders.length ? "Deselect All" : "Select All"}
                  </button>
                  {selectedOrders.length > 0 && (
                    <button 
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="rounded-full bg-rose-500 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_5px_15px_rgba(244,63,94,0.3)] hover:bg-rose-600 transition disabled:opacity-50"
                    >
                      {isBulkDeleting ? "Deleting..." : `Delete (${selectedOrders.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {activeTab === "orders" ? (
              orders.length === 0 ? (
              <div className="rounded-3xl border border-[#d5b16a]/10 bg-[#0a0a0a] p-24 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#d5b16a]/5 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#d5b16a]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-[#d5b16a]/30 italic font-serif text-lg">Your royal feasts will appear here...</p>
                <Link href="/home" className="mt-8 inline-block rounded-full bg-[#d5b16a] px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(213,177,106,0.2)] hover:bg-[#f5d79e] transition">Start Ordering</Link>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div key={order._id} className={`group rounded-[2rem] border transition-all overflow-hidden ${
                    selectedOrders.includes(order._id) 
                      ? 'border-[#d5b16a] bg-[#111] shadow-[0_0_30px_rgba(213,177,106,0.1)]' 
                      : 'border-[#d5b16a]/10 bg-[#0a0a0a] hover:border-[#d5b16a]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
                  }`}>
                    {/* Card Header */}
                    <div className="bg-white/5 px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#d5b16a]/5">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleSelect(order._id); }}
                          className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                            selectedOrders.includes(order._id)
                              ? 'bg-[#d5b16a] border-[#d5b16a]'
                              : 'border-[#d5b16a]/30 bg-transparent hover:border-[#d5b16a]'
                          }`}
                        >
                          {selectedOrders.includes(order._id) && (
                            <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          )}
                        </button>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-[#d5b16a]/10 flex items-center justify-center border border-[#d5b16a]/20">
                            <svg className="w-5 h-5 text-[#d5b16a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]">Order #{order.orderNumber || order._id.slice(-6)}</p>
                            <p className="text-[10px] text-[#f3e8c7]/40 font-medium">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] border ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-[#b38a46]/10 text-[#d5b16a] border-[#d5b16a]/20 animate-pulse'
                        }`}>
                          {order.status}
                        </span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                          className="p-2 rounded-full text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Order"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid md:grid-cols-2 gap-12">
                        {/* Left Side: Items & Summary */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40">Items Ordered</p>
                            <div className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.05]">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-[#d5b16a] w-5">x{item.quantity}</span>
                                    <span className="text-sm text-[#f3e8c7]/80">{item.name}</span>
                                  </div>
                                  <span className="text-sm font-medium text-[#f3e8c7]/60">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        {order.appliedOffer && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3">
                              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-7 7a1 1 0 000 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414zM9 11a1 1 0 110-2 1 1 0 010 2z" /></svg>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{order.appliedOffer.title}</p>
                                <p className="text-[9px] text-emerald-400/60 uppercase tracking-tighter">You saved ₹{order.appliedOffer.discountAmount || 0}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        </div>

                        {/* Right Side: Delivery & Payment */}
                        <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40">Ordered By</p>
                              <p className="text-xs text-[#f3e8c7]/80 font-medium">{order.customerName}</p>
                              <p className="text-[10px] text-[#f3e8c7]/40 leading-relaxed line-clamp-1">{order.customerAddress}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40">Payment</p>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#d5b16a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <p className="text-xs text-[#f3e8c7]/80">Cash on Delivery</p>
                              </div>
                            </div>
                          </div>

                          {/* Status Progress */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40">Status Progress</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]">
                                {order.status === 'delivered' ? '100%' : order.status === 'accepted' ? '60%' : '20%'}
                              </p>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] transition-all duration-1000"
                                style={{ width: order.status === 'delivered' ? '100%' : order.status === 'accepted' ? '60%' : order.status === 'rejected' ? '0%' : '20%' }}
                              ></div>
                            </div>
                          </div>

                          {/* Order Footer */}
                          <div className="pt-6 border-t border-[#d5b16a]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-[#d5b16a]/40 mb-0.5">Final Amount</p>
                              <p className="font-serif text-3xl text-[#f5d79e]">₹{order.totalAmount}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3 sm:justify-end">
                              <Link 
                                href={`/order/${order.orderNumber || order._id}`}
                                className="flex-1 sm:flex-none rounded-full border border-[#d5b16a]/20 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] transition text-center"
                              >
                                View Details
                              </Link>
                              <button 
                                onClick={() => setReorderItemData(order)}
                                className="flex-1 sm:flex-none rounded-full bg-[#d5b16a] px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest text-black hover:bg-[#f5d79e] transition shadow-[0_10px_20px_rgba(213,177,106,0.1)] whitespace-nowrap"
                              >
                                Reorder
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )) : (
              /* Reservations View */
              reservations.length === 0 ? (
                <div className="rounded-3xl border border-[#d5b16a]/10 bg-[#0a0a0a] p-24 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#d5b16a]/5 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-[#d5b16a]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#d5b16a]/30 italic font-serif text-lg">No table reservations found...</p>
                  <Link href="/home" className="mt-8 inline-block rounded-full bg-[#d5b16a] px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(213,177,106,0.2)] hover:bg-[#f5d79e] transition">Book a Table</Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {reservations.map((r) => (
                    <div key={r._id} className="rounded-[2rem] border border-[#d5b16a]/10 bg-[#0a0a0a] p-6 hover:border-[#d5b16a]/30 transition-all">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#d5b16a]/40">{r.trackId}</span>
                        <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                          r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                          r.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 
                          'bg-[#d5b16a]/10 text-[#d5b16a]'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-[#d5b16a]/5 flex items-center justify-center border border-[#d5b16a]/10">
                            <svg className="w-5 h-5 text-[#d5b16a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#f5d79e]">{r.reservationDate}</p>
                            <p className="text-[10px] text-[#f3e8c7]/40 uppercase tracking-widest">{r.reservationTime} • {r.guests} Guests</p>
                          </div>
                        </div>

                        {r.adminNote && (
                          <div className={`rounded-xl p-3 border ${r.status === 'rejected' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-white/5 border-white/5'}`}>
                            <p className="text-[9px] uppercase tracking-widest text-[#d5b16a]/40 mb-1">Message from Royal Platter</p>
                            <p className="text-[11px] text-[#f3e8c7]/70 italic leading-relaxed">"{r.adminNote}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#0a0a0a] border border-[#d5b16a]/30 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,1)] scrollbar-hide">
            <button onClick={() => setSelectedOrderDetails(null)} className="absolute right-8 top-8 text-[#d5b16a]/40 hover:text-[#d5b16a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5b16a] mb-2">Order Summary</p>
                <h2 className="font-serif text-4xl text-[#f5d79e]">#{selectedOrderDetails.orderNumber || selectedOrderDetails._id.slice(-6)}</h2>
                <p className="text-xs text-[#f3e8c7]/40 mt-2 font-medium">Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-12 border-y border-[#d5b16a]/10 py-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40 mb-3">Customer Details</p>
                    <p className="text-sm font-bold text-[#f5d79e]">{selectedOrderDetails.customerName}</p>
                    <p className="text-xs text-[#f3e8c7]/60 mt-1">{selectedOrderDetails.customerPhone}</p>
                    <p className="text-xs text-[#f3e8c7]/60 mt-3 leading-relaxed">{selectedOrderDetails.customerAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40 mb-3">Payment Method</p>
                    <div className="flex items-center gap-3 text-[#f3e8c7]/80">
                      <svg className="w-4 h-4 text-[#d5b16a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      <span className="text-xs font-medium uppercase tracking-wider">Cash on Delivery</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/40 mb-3">Bill Breakdown</p>
                  <div className="space-y-3">
                    {selectedOrderDetails.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-[#f3e8c7]/60">x{item.quantity} {item.name}</span>
                        <span className="text-[#f5d79e] font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    {selectedOrderDetails.appliedOffer && (
                      <div className="flex justify-between text-xs text-emerald-400 pt-2 border-t border-[#d5b16a]/5">
                        <span className="font-bold uppercase tracking-tighter">Discount ({selectedOrderDetails.appliedOffer.title})</span>
                        <span className="font-bold">- ₹{selectedOrderDetails.appliedOffer.discountAmount || 0}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-[#f3e8c7]/40 pt-2">
                      <span>GST (5%)</span>
                      <span>₹{Math.round(selectedOrderDetails.totalAmount * 0.05 / 1.05)}</span>
                    </div>
                    <div className="flex justify-between text-lg text-[#f5d79e] pt-4 border-t border-[#d5b16a]/20">
                      <span className="font-serif">Total Paid</span>
                      <span className="font-bold">₹{selectedOrderDetails.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setReorderItemData(selectedOrderDetails)}
                  className="flex-1 rounded-full bg-[#d5b16a] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-[#f5d79e] transition shadow-[0_10px_20px_rgba(213,177,106,0.2)]"
                >
                  Repeat Order
                </button>
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="flex-1 rounded-full border border-[#d5b16a]/20 py-4 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:bg-[#d5b16a]/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reorder Confirmation Modal */}
      {reorderItemData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative w-full max-w-sm rounded-[2rem] border border-[#d5b16a]/30 bg-[#0a0a0a] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d5b16a]/10 border border-[#d5b16a]/20">
              <svg className="h-8 w-8 text-[#d5b16a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="font-serif text-2xl text-[#f5d79e] mb-2">Reorder Items</h3>
            <p className="text-xs text-[#f3e8c7]/60 leading-relaxed mb-8">Would you like to add more dishes to this order or place it exactly as before?</p>
            
            <div className="space-y-3">
              <button
                disabled={reorderProcessing}
                onClick={() => handleReorder(reorderItemData, true)}
                className="w-full rounded-full bg-[#d5b16a] py-4 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#f5d79e] transition disabled:opacity-50"
              >
                Yes, add more items
              </button>
              <button
                disabled={reorderProcessing}
                onClick={() => handleReorder(reorderItemData, false)}
                className="w-full rounded-full border border-[#d5b16a]/20 py-4 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60 hover:bg-[#d5b16a]/5 transition disabled:opacity-50"
              >
                {reorderProcessing ? "Placing Order..." : "No, place exactly as before"}
              </button>
              <button
                disabled={reorderProcessing}
                onClick={() => setReorderItemData(null)}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
