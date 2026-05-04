"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Receipt,
  Images,
  PanelTop,
  MessageSquareText,
  CalendarClock,
  Gift,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/layout/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/navbar", label: "Navbar", icon: PanelTop },
  { href: "/admin/settings", label: "Site", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/offers", label: "Offers", icon: Gift },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarClock },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#070707] font-body text-[#f3e8c7]">
      <div className="flex flex-col md:flex-row">
        <aside className="border-b border-[#d5b16a]/20 bg-[#111111] md:min-h-dvh md:w-64 md:border-b-0 md:border-r md:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="border-b border-[#d5b16a]/20 p-6">
            <Link
              href="/home"
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-[#d5b16a]/70 hover:text-[#d5b16a] transition"
            >
              ← Back to Menu
            </Link>
            <p className="mt-4 font-serif text-3xl font-bold text-[#f5d79e]">Admin</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest font-bold text-[#d5b16a]/50">The Royal Platter</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-row gap-2 overflow-x-auto px-3 py-3 md:flex-col md:space-y-1 md:px-3 md:py-4">
            {nav.map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" || pathname === "/admin/(dashboard)"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? "bg-[#d5b16a]/10 text-[#d5b16a] shadow-[inset_4px_0_0_0_#d5b16a]"
                      : "text-[#f3e8c7]/50 hover:bg-[#d5b16a]/5 hover:text-[#f3e8c7]"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="hidden flex-1 md:block" />

          {/* Logout Button */}
          <div className="border-t border-[#d5b16a]/20 p-3 md:border-t md:p-4">
            <AdminLogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
