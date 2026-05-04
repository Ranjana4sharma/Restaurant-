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
});

export const metadata: Metadata = {
  title: "The Royal Platter",
  description: "Experience pure veg excellence with our curated fine dining menu.",
};

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
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
