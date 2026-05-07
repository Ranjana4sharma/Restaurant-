import type { Metadata } from "next";
import { Pacifico, DM_Sans, Fredoka, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/cart-context";
import { AuthProvider } from "@/features/auth/auth-context";
import { Toaster } from "react-hot-toast";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "600"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "The Royal Platter",
  description: "Experience pure veg excellence with our curated fine dining menu.",
};

import { NextAuthProvider } from "@/providers/next-auth-provider";
import { GlobalModals } from "@/components/modals/GlobalModals";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pacifico.variable} ${dmSans.variable} ${fredoka.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-body">
        <Toaster position="top-center" toastOptions={{
          duration: 4000,
          style: {
            background: '#0a0a0a',
            color: '#f5d79e',
            border: '1px solid rgba(213, 177, 106, 0.3)',
            borderRadius: '16px',
            fontSize: '14px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          },
          success: {
            iconTheme: {
              primary: '#d5b16a',
              secondary: '#0a0a0a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0a0a',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }
          }
        }} />
        <NextAuthProvider>
          <AuthProvider>
            <CartProvider>
              <GlobalModals />
              {children}
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
