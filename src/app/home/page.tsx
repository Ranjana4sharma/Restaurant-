"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { fetchApprovedReviews } from "@/services/reviews";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/features/cart/cart-context";
import type { CategoryDTO, ProductDTO, ReviewDTO } from "@/types";

const dummyCategories: CategoryDTO[] = [
  { _id: "663248658823548548548541", name: "Pizza", sortOrder: 1, image: "" },
  { _id: "663248658823548548548542", name: "Burger", sortOrder: 2, image: "" },
  { _id: "663248658823548548548543", name: "Chinese", sortOrder: 3, image: "" },
  { _id: "663248658823548548548544", name: "Beverages", sortOrder: 4, image: "" },
  { _id: "663248658823548548548545", name: "International", sortOrder: 5, image: "" },
];

const dummyProducts: ProductDTO[] = [
  {
    _id: "663248658823548548548511",
    name: "Truffle Gold Pizza",
    description: "Wood-fired signature pizza with truffle aroma",
    price: 499,
    categoryId: "663248658823548548548541",
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?auto=format&fit=crop&w=1200&q=80",
    isVeg: true,
    isBestseller: true,
    isChefSpecial: true,
  },
  {
    _id: "663248658823548548548512",
    name: "Garden Royale Burger",
    description: "Grilled veg patty with house cheese sauce",
    price: 299,
    categoryId: "663248658823548548548542",
    category: "Burger",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80",
    isVeg: true,
    isBestseller: true,
  },
  {
    _id: "663248658823548548548513",
    name: "Imperial Hakka Noodles",
    description: "Wok tossed noodles with aromatic spices",
    price: 289,
    categoryId: "663248658823548548548543",
    category: "Chinese",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80",
    isVeg: true,
  },
  {
    _id: "663248658823548548548514",
    name: "Saffron Cold Brew",
    description: "Premium cold coffee with saffron notes",
    price: 219,
    categoryId: "663248658823548548548544",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
    isVeg: true,
  },
  {
    _id: "663248658823548548548515",
    name: "Mediterranean Veg Platter",
    description: "Curated international tasting plate",
    price: 599,
    categoryId: "663248658823548548548545",
    category: "International",
    image: "https://images.unsplash.com/photo-1543332164-6e82f355badb?auto=format&fit=crop&w=1200&q=80",
    isVeg: true,
    isChefSpecial: true,
  },
  {
    _id: "663248658823548548548516",
    name: "Chef's Royale Pizza",
    description: "Special chef creation with rich toppings",
    price: 549,
    categoryId: "663248658823548548548541",
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1200&q=80",
    isChefSpecial: true,
    isVeg: true,
  },
];

const dummyReviews: ReviewDTO[] = [
  { _id: "r1", customerName: "Aarav Sharma", rating: 5, comment: "Absolutely divine! The truffle pizza is a must-try.", approved: true },
  { _id: "r2", customerName: "Neha Gupta", rating: 5, comment: "Best pure veg fine dining experience in the city. The service is top-notch.", approved: true },
  { _id: "r3", customerName: "Vikram Singh", rating: 4, comment: "Loved the Mediterranean platter. Ambience is very royal.", approved: true },
];

const dummyOffers: OfferDTO[] = [
  {
    _id: "o1",
    title: "Royal Welcome",
    description: "Get 20% off on your first order above ₹999",
    discountValue: 20,
    discountType: "percentage",
    minOrderValue: 999,
    isActive: true,
    isAutoApply: true,
    badge: "20% OFF"
  },
  {
    _id: "o2",
    title: "Weekend Feast",
    description: "Flat ₹200 off on all orders above ₹1499",
    discountValue: 200,
    discountType: "fixed",
    minOrderValue: 1499,
    isActive: true,
    isAutoApply: false,
    badge: "₹200 OFF"
  }
];

function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

import { useAuth } from "@/features/auth/auth-context";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { CheckoutAuthOverlay } from "@/components/auth/CheckoutAuthOverlay";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { fetchOffers, type OfferDTO } from "@/services/offers";
import { LoginModal } from "@/components/modals/LoginModal";
import { logoutCustomer } from "@/services/customer";
import { Navbar } from "@/components/layout/Navbar";
import { AddToCartModal } from "@/components/modals/AddToCartModal";
import { CheckoutDetailsModal } from "@/components/modals/CheckoutDetailsModal";
import ReservationModal from "@/components/modals/ReservationModal";
import { Footer } from "@/components/layout/Footer";

function HomeContent() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("cart") === "open") {
      setCartOpen(true);
    }
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
      setTimeout(() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }

    const productId = searchParams.get("productId");
    if (productId && products.length > 0) {
      const p = products.find(x => x._id === productId);
      if (p) {
        setModalProduct(p);
        setTimeout(() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }, 600);
      }
    }

    // Cleanup reservation success reload flag
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("reservation_reloaded");
    }
  }, [searchParams, products]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [allOffers, setOffers] = useState<OfferDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [reservationOpen, setReservationOpen] = useState(false);
  const [topFilter, setTopFilter] = useState<"all" | "bestseller" | "chef-special">("all");

  useEffect(() => {
    setSelectedSubCategory("all");
  }, [selectedCategory]);

  const getAllDescendantIds = (parentId: string, allCats: CategoryDTO[]): string[] => {
    const children = allCats.filter(c => c.parentId === parentId);
    let ids = children.map(c => c._id);
    children.forEach(child => {
      ids = [...ids, ...getAllDescendantIds(child._id, allCats)];
    });
    return ids;
  };

  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalProduct, setModalProduct] = useState<ProductDTO | null>(null);
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { isLoggedIn, user, refresh, logout, setIsLoginOpen } = useAuth();
  const { lines, subtotal, itemCount, appliedOffer, setOffer, removeOffer, clear, addLine, inc, dec, remove } = useCart();


  // Auto-apply offer
  useEffect(() => {
    const autoApply = allOffers.find(o => o.isAutoApply && subtotal >= (o.minOrderValue || 0));
    if (autoApply && !appliedOffer) {
      setOffer(autoApply);
    } else if (appliedOffer && subtotal < (appliedOffer.minOrderValue || 0)) {
      removeOffer();
    }
  }, [subtotal, allOffers, appliedOffer, setOffer, removeOffer]);

  const handleCheckout = async (formData: { customerName: string; customerEmail: string; customerAddress: string }) => {
    setCheckoutLoading(true);
    try {
      const payload: any = {
        items: lines.map(l => ({ productId: l.productId, name: l.name, quantity: l.quantity, price: l.price })),
        offerId: appliedOffer?._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        password: "ALREADY_LOGGED_IN", // Required by older API fallback
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Your order has been placed successfully!");
        clear();
        setCheckoutOpen(false);
        setCartOpen(false);
        await refresh();
        router.push(`/order/${data.order.orderNumber}`);
      } else {
        toast.error(data.error || "Checkout failed. Please check your details.");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      logout();
      await refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const handleSeeMore = (sectionTitle: string) => {
    const slug = slugifyCategory(sectionTitle);
    if (selectedCategory === "all") {
      setSelectedCategory(slug);
    } else if (selectedSubCategory === "all") {
      setSelectedSubCategory(slug);
    }
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const activeCategories = categories.length > 0 ? categories : dummyCategories;
  const activeProducts = (products.length > 0 ? products : dummyProducts).filter((p) => p.isVeg);
  const activeReviews = reviews.length > 0 ? reviews : dummyReviews;
  const activeOffers = useMemo(() => {
    const list = allOffers.length > 0 ? allOffers : dummyOffers;
    return list.filter((o) => o.isActive);
  }, [allOffers]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, r, o] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchApprovedReviews().catch(() => []),
          fetchOffers().catch(() => [])
        ]);
        setProducts(p);
        setCategories(c);
        setReviews(r);
        setOffers(o);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mainCategories = useMemo(
    () => activeCategories.filter((c) => !c.parentId),
    [activeCategories]
  );

  const categoryTabs = useMemo(
    () => [
      { slug: "all", label: "All" },
      ...mainCategories.map((c) => ({ slug: slugifyCategory(c.name), label: c.name })),
    ],
    [mainCategories]
  );

  const currentSubCategories = useMemo(() => {
    if (selectedCategory === "all") return [];

    const selectedDoc = activeCategories.find((c) => slugifyCategory(c.name) === selectedCategory);
    if (!selectedDoc) return [];

    // If a subcategory is selected, check if it has children (sub-subcategories/types)
    if (selectedSubCategory !== "all") {
      const subDoc = activeCategories.find((c) => slugifyCategory(c.name) === selectedSubCategory);
      if (subDoc) {
        const subSubs = activeCategories.filter((c) => c.parentId === subDoc._id);
        if (subSubs.length > 0) return subSubs;
      }
    }

    return activeCategories.filter((c) => c.parentId === selectedDoc._id);
  }, [activeCategories, selectedCategory, selectedSubCategory]);

  const filteredMenuProducts = useMemo(() => {
    let list = activeProducts;
    if (selectedCategory !== "all") {
      const selectedDoc = activeCategories.find((c) => slugifyCategory(c.name) === selectedCategory);
      if (selectedDoc) {
        if (selectedSubCategory !== "all") {
          const subDoc = activeCategories.find((c) => slugifyCategory(c.name) === selectedSubCategory);
          if (subDoc) {
            const descendantIds = new Set([subDoc._id, ...getAllDescendantIds(subDoc._id, activeCategories)]);
            list = list.filter(
              (p) => (p.categoryId && descendantIds.has(p.categoryId)) ||
                slugifyCategory(p.category) === selectedSubCategory
            );
          }
        } else {
          const mainDoc = activeCategories.find((c) => slugifyCategory(c.name) === selectedCategory);
          if (mainDoc) {
            const descendantIds = new Set([mainDoc._id, ...getAllDescendantIds(mainDoc._id, activeCategories)]);
            list = list.filter(
              (p) => (p.categoryId && descendantIds.has(p.categoryId)) ||
                slugifyCategory(p.category) === selectedCategory
            );
          }
        }
      } else {
        list = list.filter((p) => slugifyCategory(p.category) === selectedCategory);
      }
    }
    if (topFilter === "bestseller") {
      list = list.filter((p) => p.isBestseller);
    } else if (topFilter === "chef-special") {
      list = list.filter((p) => p.isChefSpecial);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return list;
  }, [activeProducts, selectedCategory, selectedSubCategory, topFilter, searchQuery, activeCategories]);

  const menuSections = useMemo(() => {
    if (selectedCategory === "all" && searchQuery.trim() === "" && topFilter === "all") {
      // Show all main categories grouped
      return mainCategories.map(cat => {
        const descendantIds = new Set([cat._id, ...getAllDescendantIds(cat._id, activeCategories)]);
        return {
          id: cat._id,
          title: cat.name,
          items: filteredMenuProducts.filter(p => (p.categoryId && descendantIds.has(p.categoryId)) || slugifyCategory(p.category) === slugifyCategory(cat.name))
        };
      }).filter(s => s.items.length > 0);
    }

    if (selectedCategory !== "all" && selectedSubCategory === "all") {
      // Show all sub-categories of the selected main category
      const selectedDoc = activeCategories.find(c => slugifyCategory(c.name) === selectedCategory);
      if (!selectedDoc) return [{ id: "none", title: "Results", items: filteredMenuProducts }];

      const subs = activeCategories.filter(c => c.parentId === selectedDoc._id);
      if (subs.length === 0) return [{ id: selectedDoc._id, title: selectedDoc.name, items: filteredMenuProducts }];

      const sections = subs.map(sub => {
        const descendantIds = new Set([sub._id, ...getAllDescendantIds(sub._id, activeCategories)]);
        return {
          id: sub._id,
          title: sub.name,
          items: filteredMenuProducts.filter(p => (p.categoryId && descendantIds.has(p.categoryId)) || slugifyCategory(p.category) === slugifyCategory(sub.name))
        };
      }).filter(s => s.items.length > 0);

      // Add products that are in the main category but not in any sub-category
      const orphanItems = filteredMenuProducts.filter(p => {
        if (p.categoryId === selectedDoc._id || slugifyCategory(p.category) === selectedCategory) return true;
        const isInAnySection = subs.some(sub => {
          const descendantIds = new Set([sub._id, ...getAllDescendantIds(sub._id, activeCategories)]);
          return (p.categoryId && descendantIds.has(p.categoryId)) || slugifyCategory(p.category) === slugifyCategory(sub.name);
        });
        return !isInAnySection;
      });

      if (orphanItems.length > 0) {
        sections.unshift({ id: selectedDoc._id, title: "Classic " + selectedDoc.name, items: orphanItems });
      }

      return sections;
    }

    if (selectedCategory !== "all" && selectedSubCategory !== "all") {
      const selectedSubDoc = activeCategories.find(c => slugifyCategory(c.name) === selectedSubCategory);
      if (!selectedSubDoc) return [{ id: "none", title: "Results", items: filteredMenuProducts }];

      const subSubs = activeCategories.filter(c => c.parentId === selectedSubDoc._id);
      if (subSubs.length === 0) return [{ id: selectedSubDoc._id, title: selectedSubDoc.name, items: filteredMenuProducts }];

      const sections = subSubs.map(sub => {
        const descendantIds = new Set([sub._id, ...getAllDescendantIds(sub._id, activeCategories)]);
        return {
          id: sub._id,
          title: sub.name,
          items: filteredMenuProducts.filter(p => (p.categoryId && descendantIds.has(p.categoryId)) || slugifyCategory(p.category) === slugifyCategory(sub.name))
        };
      }).filter(s => s.items.length > 0);

      const orphanItems = filteredMenuProducts.filter(p => {
        if (p.categoryId === selectedSubDoc._id || slugifyCategory(p.category) === selectedSubCategory) return true;
        // Also include if it's NOT in any of the listed sub-sections
        const isInAnySection = subSubs.some(sub => {
          const descendantIds = new Set([sub._id, ...getAllDescendantIds(sub._id, activeCategories)]);
          return (p.categoryId && descendantIds.has(p.categoryId)) || slugifyCategory(p.category) === slugifyCategory(sub.name);
        });
        return !isInAnySection;
      });

      if (orphanItems.length > 0) {
        sections.unshift({ id: selectedSubDoc._id, title: "Classic " + selectedSubDoc.name, items: orphanItems });
      }

      return sections;
    }

    return [{ id: "results", title: "Search Results", items: filteredMenuProducts }];
  }, [filteredMenuProducts, selectedCategory, selectedSubCategory, mainCategories, activeCategories, topFilter, searchQuery]);

  const chefSpecial = useMemo(
    () => activeProducts.filter((p) => p.isChefSpecial).slice(0, 8),
    [activeProducts]
  );

  return (
    <main className="min-h-dvh bg-[#070707] text-[#f3e8c7]">
      {/* 1. NAVBAR */}
      <Navbar onCartClick={() => setCartOpen(true)} />

      {/* 2. HERO SECTION */}
      <section className="relative mx-auto w-full px-6 py-8 sm:py-12 flex items-center justify-center overflow-hidden min-h-[160px] sm:min-h-[200px]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#070707]" />
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d5b16a]">Pure Veg Excellence</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5d79e] sm:text-4xl">The Royal Platter</h1>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => { document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }}
              className="flex items-center gap-2 rounded-full border border-[#d5b16a]/40 bg-transparent px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#d5b16a] transition-all hover:bg-[#d5b16a]/10"
            >
              Order Online
            </button>
            <button
              onClick={() => setReservationOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#d5b16a] px-8 py-3 text-xs font-bold uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(213,177,106,0.3)] transition-all hover:bg-[#f5d79e]"
            >
              Book a Table
            </button>
          </div>
        </div>
      </section>

      {/* 3. SEARCH BAR (FULL WIDTH BELOW HERO) */}
      <div className="mx-auto mb-16 max-w-4xl px-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#d5b16a]/50 group-focus-within:text-[#d5b16a] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search our royal menu (e.g. Truffle Pizza, Pasta...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-[#d5b16a]/20 bg-[#111111] py-4 pl-14 pr-6 text-sm text-[#f3e8c7] outline-none transition-all placeholder:text-[#f3e8c7]/30 focus:border-[#d5b16a]/60 focus:bg-[#151515] focus:shadow-[0_0_30px_rgba(213,177,106,0.1)]"
          />
        </div>
      </div>



      <section className="mx-auto max-w-6xl px-6 mb-6">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categoryTabs.slice(0, 7).map((tab) => {
            const active = selectedCategory === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => { setSelectedCategory(tab.slug); setShowMoreCats(false); }}
                className={`shrink-0 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${active
                  ? "border-[#d5b16a] bg-[#b38a46]/25 text-[#f7e6bd] shadow-[0_0_15px_rgba(213,177,106,0.2)]"
                  : "border-[#d5b16a]/20 bg-[#111111] text-[#f3e8c7]/70 hover:bg-[#b38a46]/10 hover:text-[#f3e8c7]"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
          {categoryTabs.length > 7 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMoreCats(!showMoreCats)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${showMoreCats ? 'border-[#d5b16a] bg-[#b38a46]/10 text-[#d5b16a]' : 'border-[#d5b16a]/20 bg-[#111111] text-[#d5b16a]'}`}
              >
                More
                <svg className={`w-3 h-3 transition-transform ${showMoreCats ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showMoreCats && (
                <div className="absolute top-full right-0 mt-3 z-50 w-56 overflow-hidden rounded-2xl border border-[#d5b16a]/30 bg-[#111111] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-[fadeUp_0.2s_ease-out]">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {categoryTabs.slice(7).map((tab) => {
                      const active = selectedCategory === tab.slug;
                      return (
                        <button
                          key={tab.slug}
                          onClick={() => {
                            setSelectedCategory(tab.slug);
                            setShowMoreCats(false);
                          }}
                          className={`w-full rounded-xl px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-[#b38a46]/20 text-[#f5d79e]' : 'text-[#f3e8c7]/60 hover:bg-white/5 hover:text-[#f3e8c7]'}`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {currentSubCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
            <button
              onClick={() => setSelectedSubCategory("all")}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedSubCategory === "all"
                ? "border-[#d5b16a] bg-[#d5b16a] text-[#050505] shadow-[0_0_10px_rgba(213,177,106,0.3)]"
                : "border-[#d5b16a]/30 bg-transparent text-[#d5b16a] hover:bg-[#d5b16a]/10"
                }`}
            >
              All {categoryTabs.find((t) => t.slug === selectedCategory)?.label}
            </button>
            {currentSubCategories.map((sub) => {
              const subSlug = slugifyCategory(sub.name);
              const active = selectedSubCategory === subSlug;
              return (
                <button
                  key={sub._id}
                  onClick={() => setSelectedSubCategory(subSlug)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${active
                    ? "border-[#d5b16a] bg-[#d5b16a] text-[#050505] shadow-[0_0_10px_rgba(213,177,106,0.3)]"
                    : "border-[#d5b16a]/30 bg-transparent text-[#d5b16a] hover:bg-[#d5b16a]/10"
                    }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. FILTER BAR */}
      <section className="mx-auto max-w-6xl px-6 mb-8 flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d5b16a]/60">Filter:</span>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTopFilter("all")}
            className={`rounded-md border-b-2 px-2 py-1 text-xs uppercase tracking-wider transition-all duration-300 ${topFilter === "all"
              ? "border-[#d5b16a] text-[#f5d79e]"
              : "border-transparent text-[#f3e8c7]/50 hover:text-[#f3e8c7]/80"
              }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTopFilter("bestseller")}
            className={`rounded-md border-b-2 px-2 py-1 text-xs uppercase tracking-wider transition-all duration-300 ${topFilter === "bestseller"
              ? "border-[#d5b16a] text-[#f5d79e]"
              : "border-transparent text-[#f3e8c7]/50 hover:text-[#f3e8c7]/80"
              }`}
          >
            Bestseller
          </button>
          <button
            type="button"
            onClick={() => setTopFilter("chef-special")}
            className={`rounded-md border-b-2 px-2 py-1 text-xs uppercase tracking-wider transition-all duration-300 ${topFilter === "chef-special"
              ? "border-[#d5b16a] text-[#f5d79e]"
              : "border-transparent text-[#f3e8c7]/50 hover:text-[#f3e8c7]/80"
              }`}
          >
            Chef Special
          </button>
        </div>
      </section>

      {/* 6. MENU GRID */}
      <section id="menu" className="mx-auto w-full max-w-6xl px-6 pb-20">
        {menuSections.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#f3e8c7]/40">No royal delicacies found matching your selection.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {menuSections.map((section) => {
              const isOverview = selectedCategory === "all" || (selectedSubCategory === "all" && section.title !== "Search Results");
              const displayItems = isOverview ? section.items.slice(0, 3) : section.items;
              const hasMore = isOverview && section.items.length > 3;

              return (
                <div key={section.id} className="animate-[fadeUp_0.4s_ease-out]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <h2 className="font-serif text-2xl text-[#f5d79e] whitespace-nowrap">{section.title}</h2>
                      <div className="h-px w-full bg-gradient-to-r from-[#d5b16a]/30 to-transparent" />
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => handleSeeMore(section.title)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a] hover:text-[#f5d79e] transition-colors shrink-0 group/more"
                      >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transition-transform group-hover/more:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayItems.map((p) => (
                      <article
                        key={p._id}
                        onClick={() => setModalProduct(p)}
                        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#d5b16a]/20 bg-[#111111] transition-all duration-500 hover:border-[#d5b16a]/50 hover:shadow-[0_20px_40px_-20px_rgba(213,177,106,0.3)]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-[#0a0a0a]">
                          <img
                            src={p.image || "/placeholder-food.svg"}
                            alt={p.name}
                            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-md">
                              <div className={`h-2 w-2 rounded-full ${p.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-white">{p.isVeg ? "Veg" : "Non-Veg"}</span>
                            </div>
                            {p.isBestseller && (
                              <span className="rounded-full bg-[#d5b16a] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black">Hot</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-serif text-xl font-bold text-[#f5d79e] transition-colors group-hover:text-white line-clamp-1">{p.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#f3e8c7]/60">{p.description || "A royal delicacy prepared with passion."}</p>

                          <div className="mt-5 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                              <span className="font-serif text-xl font-bold text-[#f5d79e]">₹ {p.price}</span>
                              {(p.variants?.length ?? 0) > 0 && (
                                <span className="text-[9px] uppercase tracking-widest text-[#d5b16a]/60">{p.variants?.length} Types</span>
                              )}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d5b16a] text-black shadow-lg shadow-[#d5b16a]/10 transition-transform group-hover:scale-110">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* 7. OFFERS SECTION (Placed after menu) */}
      {activeOffers.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-14">
          <h2 className="font-serif text-3xl text-[#f5d79e]">Exclusive Offers</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {activeOffers.map((offer) => (
              <div key={offer._id} className="relative overflow-hidden rounded-2xl border border-[#d5b16a]/40 bg-[#0f0c07] p-8 transition-all hover:border-[#d5b16a]/70 hover:shadow-[0_0_30px_rgba(213,177,106,0.15)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b38a46]/10 blur-2xl"></div>
                <span className="inline-block rounded-full bg-[#d5b16a] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#050505]">{offer.badge || (offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : 'LIMITED')}</span>
                <h3 className="mt-4 font-serif text-3xl text-[#f5d79e]">{offer.title}</h3>
                <p className="mt-2 text-[#f3e8c7]/80">{offer.description}</p>
                <button onClick={() => { document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#d5b16a] hover:text-[#f5d79e]">
                  Order Now &rarr;
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <h2 className="font-serif text-3xl text-[#f5d79e]">Chef Special</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {chefSpecial.slice(0, 3).map((p) => (
            <article
              key={p._id}
              onClick={() => setModalProduct(p)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#d5b16a]/30 bg-gradient-to-br from-[#1a150c] to-[#0c0a05] transition-all duration-500 hover:-translate-y-2 hover:border-[#d5b16a]/60 hover:shadow-[0_20px_40px_-20px_rgba(213,177,106,0.5)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl relative bg-[#0a0a0a]">
                <img src={p.image || "/placeholder-food.svg"} alt={p.name} className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#b38a46]/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#d5b16a]">Signature</span>
                  <p className="font-serif text-xl text-[#f5d79e]">₹ {p.price}</p>
                </div>
                <h3 className="font-serif text-2xl text-[#f5d79e]">{p.name}</h3>
                <p className="mt-2 text-sm text-[#f3e8c7]/70 line-clamp-2">{p.description || "An exclusive creation by our master chef, featuring premium hand-picked ingredients."}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/60">Click for details</div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b38a46] text-black shadow-lg shadow-[#b38a46]/20 transition-transform group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {!loading && chefSpecial.length === 0 ? <p className="text-sm text-[#f3e8c7]/70">No chef special items available.</p> : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <h2 className="font-serif text-3xl text-[#f5d79e]">Guest Experiences</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {activeReviews.slice(0, 3).map((review) => (
            <div key={review._id} className="rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-6 transition-all hover:-translate-y-1 hover:border-[#d5b16a]/40">
              <div className="flex text-[#d5b16a]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "fill-[#d5b16a]/20"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#f3e8c7]/80 italic">"{review.comment}"</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#d5b16a]">- {review.customerName}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fixed inset-y-4 right-4 z-[100] flex justify-end pointer-events-none">
        {cartOpen ? (
          <div className="pointer-events-auto rounded-[3rem] border border-[#d5b16a]/30 bg-[#0a0a0a]/98 px-6 py-7 shadow-[0_40px_120px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(213,177,106,0.03)] backdrop-blur-2xl w-full max-w-[30rem] h-full grid grid-rows-[auto_1fr_auto] animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
            <div className="mb-6 flex items-center justify-between shrink-0 px-1">
              <div className="flex flex-col">
                <p className="font-serif text-2xl tracking-tight text-[#f5d79e]">{checkoutOpen ? "Royal Checkout" : "Your Royal Feast"}</p>
                <div className="h-0.5 w-12 bg-gradient-to-r from-[#d5b16a] to-transparent mt-1 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                {!checkoutOpen && <span className="rounded-full bg-[#d5b16a]/10 border border-[#d5b16a]/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]">{itemCount} items</span>}
                <button type="button" onClick={() => { setCartOpen(false); setCheckoutOpen(false); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#f3e8c7]/50 hover:bg-white/10 hover:text-[#f3e8c7] transition-all hover:rotate-90">✕</button>
              </div>
            </div>
            {!checkoutOpen ? (
              <>
                {/* Main Scrollable Content: Items + Offers + Bill Detail */}
                <div className="overflow-y-auto pr-1 custom-scrollbar min-h-0 py-2 space-y-8">
                  {/* Section 1: Items */}
                  <div className="space-y-4 px-1">
                    {lines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#d5b16a]/5 border border-[#d5b16a]/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#d5b16a]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#f3e8c7]/30">Your feast is waiting to begin</p>
                      </div>
                    ) : (
                      lines.map((line) => (
                        <div key={line.key} className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-base font-serif text-[#f7e6bd] leading-snug">{line.name}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-widest text-[#f3e8c7]/30">₹ {line.price} per portion</p>
                            </div>
                            <p className="text-base font-serif text-[#f5d79e]">₹ {line.price * line.quantity}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                              <button type="button" onClick={() => dec(line.key)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#d5b16a]/10 text-[#d5b16a] transition-all">-</button>
                              <span className="w-8 text-center text-xs font-bold text-[#f3e8c7]">{line.quantity}</span>
                              <button type="button" onClick={() => inc(line.key)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#d5b16a]/10 text-[#d5b16a] transition-all">+</button>
                            </div>
                            <button type="button" onClick={() => remove(line.key)} className="text-[10px] font-bold uppercase tracking-widest text-rose-400/40 hover:text-rose-400 transition-colors">Remove Item</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section 2: Offers */}
                  {activeOffers.length > 0 && (
                    <div className="space-y-3 px-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d5b16a]">Royal Offers</p>
                        {appliedOffer && <button onClick={removeOffer} className="text-[10px] font-bold uppercase tracking-widest text-rose-400/60">Remove Applied</button>}
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {activeOffers.map(o => (
                          <button
                            key={o._id}
                            onClick={() => subtotal >= (o.minOrderValue || 0) ? setOffer(o) : null}
                            className={`shrink-0 w-44 rounded-2xl border p-4 transition-all ${appliedOffer?._id === o._id ? 'border-[#d5b16a] bg-[#b38a46]/10 shadow-[0_10px_20px_rgba(213,177,106,0.05)]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
                          >
                            <p className="text-[11px] font-bold text-[#f3e8c7] truncate">{o.title}</p>
                            <p className="text-[9px] text-[#f3e8c7]/40 leading-tight mt-1 line-clamp-1">{o.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Bill Detail */}
                  <div className="space-y-5 px-1 pb-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#f3e8c7]/40">Bill Details</p>
                    <div className="space-y-3 px-1">
                      <div className="flex justify-between text-xs tracking-wide text-[#f3e8c7]/60">
                        <p>Subtotal</p>
                        <p>₹ {subtotal}</p>
                      </div>
                      {appliedOffer && (
                        <div className="flex justify-between text-xs tracking-wide text-emerald-400 font-bold">
                          <p>Offer Discount ({appliedOffer.title})</p>
                          <p>- ₹ {appliedOffer.discountType === "percentage" ? Math.min(appliedOffer.maxDiscount || Infinity, Math.round((subtotal * appliedOffer.discountValue) / 100)) : appliedOffer.discountValue}</p>
                        </div>
                      )}
                      <div className="flex justify-between text-xs tracking-wide text-[#f3e8c7]/60">
                        <p>Service & Govt. Taxes (5%)</p>
                        <p>₹ {Math.round((subtotal - (appliedOffer ? (appliedOffer.discountType === "percentage" ? Math.min(appliedOffer.maxDiscount || Infinity, Math.round((subtotal * appliedOffer.discountValue) / 100)) : appliedOffer.discountValue) : 0)) * 0.05)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Fixed Action Bar: Just Total and Button */}
                <div className="pt-4 border-t border-white/5 bg-[#0a0a0a] flex flex-col gap-4">
                  <div className="flex items-end justify-between px-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d5b16a]">To Pay</p>
                      <p className="text-[8px] text-[#f3e8c7]/20 uppercase tracking-widest mt-1">Inclusive of all charges</p>
                    </div>
                    <p className="font-serif text-4xl text-[#f5d79e] drop-shadow-[0_0_15px_rgba(245,215,158,0.25)]">
                      ₹ {Math.round((subtotal - (appliedOffer ? (appliedOffer.discountType === "percentage" ? Math.min(appliedOffer.maxDiscount || Infinity, Math.round((subtotal * appliedOffer.discountValue) / 100)) : appliedOffer.discountValue) : 0)) * 1.05)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    disabled={checkoutLoading || lines.length === 0}
                    className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-4.5 text-xs font-bold uppercase tracking-[0.3em] text-[#050505] shadow-[0_20px_40px_rgba(179,138,70,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span className="relative z-10">{checkoutLoading ? "Preparing Order..." : "Proceed to Checkout"}</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {itemCount > 0 && !cartOpen ? (
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="absolute bottom-0 right-0 pointer-events-auto flex items-center gap-3 rounded-full border border-[#d5b16a]/70 bg-[#111111] px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition hover:scale-105"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#b38a46]/20 text-[#d5b16a]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#d5b16a] text-[9px] font-bold text-[#050505]">
                {itemCount}
              </span>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#f5d79e]">View Cart</span>
          </button>
        ) : null}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-14 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#d5b16a]/30 bg-gradient-to-b from-[#141009] to-[#0a0804] p-8 lg:col-span-1">
          <h3 className="font-serif text-3xl text-[#f5d79e]">Visit Us</h3>
          <p className="mt-2 text-sm text-[#f3e8c7]/70">Experience royal dining at our pure veg fine dine restaurant.</p>
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b38a46]/20 text-[#d5b16a]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#d5b16a]/80">Address</p>
                <p className="mt-1 text-sm text-[#f3e8c7]">123 Royal Street, Downtown Area<br />New Delhi, 110001</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b38a46]/20 text-[#d5b16a]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#d5b16a]/80">Phone</p>
                <p className="mt-1 text-sm text-[#f3e8c7]">+91 99999 88888</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b38a46]/20 text-[#d5b16a]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#d5b16a]/80">Timings</p>
                <p className="mt-1 text-sm text-[#f3e8c7]">Mon - Sun: 11:00 AM - 11:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#d5b16a]/30 bg-[#111111] lg:col-span-2 relative min-h-[350px]">
          <iframe
            title="The Royal Platter Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114827184427!2d77.2066114!3d28.6289016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xc46188cb612f42be!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            className="absolute inset-0 h-full w-full border-0 grayscale invert opacity-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <AddToCartModal
        key={modalProduct ? modalProduct._id : "closed"}
        open={!!modalProduct}
        product={modalProduct}
        onClose={() => {
          setModalProduct(null);
          // If we came from the landing page via productId, return back
          if (searchParams.get("productId")) {
            router.push("/");
          }
        }}
      />

      <Footer />
      <CheckoutDetailsModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />
      <ReservationModal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-[#d5b16a]/20"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-[#d5b16a] animate-spin"></div>
        </div>
        <p className="font-serif text-[#f5d79e] animate-pulse">Preparing the Royal Experience...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
