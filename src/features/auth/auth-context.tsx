"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UserProfile = {
  name: string;
  phone: string;
  address: string;
  completionPercentage: number;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = () => {
    document.cookie = "customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
  };

  const refresh = async () => {
    setLoading(true);
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
