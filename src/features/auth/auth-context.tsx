"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { logoutCustomer } from "@/services/customer";
import { useSession, signOut } from "next-auth/react";

type UserProfile = {
  name: string;
  phone: string;
  address: string;
  email?: string;
  completionPercentage: number;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: UserProfile | null;
  loading: boolean;
  mustCompleteProfile: boolean;
  isLoginOpen: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setMustCompleteProfile: (val: boolean) => void;
  setIsLoginOpen: (val: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustCompleteProfile, setMustCompleteProfile] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { data: session, status } = useSession();

  const fetchProfile = async () => {
    console.log("[AUTH_CONTEXT] fetchProfile triggered. Status:", status, "Session:", !!session);
    try {
      const res = await fetch("/api/customer/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        console.log("[AUTH_CONTEXT] Dashboard API result:", !!data.profile);
        if (data.profile) {
          setUser(data.profile);
          // If address is "Pending details", user must complete profile
          if (data.profile.address === "Pending details") {
            setMustCompleteProfile(true);
          }
          return;
        } else {
          console.log("[AUTH_CONTEXT] Dashboard returned no profile. User record might be deleted.");
          setUser(null);
          setMustCompleteProfile(false);
          return;
        }
      } 
      
      // Fallback to NextAuth session ONLY if the API call itself failed or wasn't conclusive
      if (session?.user) {
        console.log("[AUTH_CONTEXT] Falling back to NextAuth session user data");
        const address = (session.user as any).address || "Pending details";
        setUser({
          name: session.user.name || "",
          email: session.user.email || "",
          phone: (session.user as any).phone || "",
          address,
          completionPercentage: 50,
        });
        if (address === "Pending details") {
          setMustCompleteProfile(true);
        }
      } else {
        setUser(null);
        setMustCompleteProfile(false);
      }
    } catch (e) {
      console.error("[AUTH_CONTEXT] fetchProfile error:", e);
      setUser(null);
      setMustCompleteProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchProfile();
    }
  }, [status, session]);

  const login = (userData: any) => {
    setUser(userData);
    if (userData.address === "Pending details") {
      setMustCompleteProfile(true);
    }
  };

  const logout = async () => {
    try {
      await logoutCustomer();
      // Ensure NextAuth session is also cleared
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      document.cookie = "customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      setUser(null);
      setMustCompleteProfile(false);
      window.location.href = "/home";
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: !!user, 
      user, 
      loading, 
      mustCompleteProfile, 
      login, 
      logout, 
      refresh,
      setMustCompleteProfile,
      isLoginOpen,
      setIsLoginOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
