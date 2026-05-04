"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { http } from "@/services/http";

type Mode = "login" | "register";

function errMsg(e: unknown, fallback: string) {
  if (isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
    const d = e.response.data as { error?: string };
    if (d.error) return d.error;
  }
  return fallback;
}

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [canRegister, setCanRegister] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get<{ canRegister: boolean }>(
          "/api/admin/register-status"
        );
        setCanRegister(data.canRegister);
        if (data.canRegister) setMode("register");
      } catch {
        setCanRegister(false);
      } finally {
        setStatusLoaded(true);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#070707] p-4 font-body text-[#f3e8c7]">
      <div className="w-full max-w-md rounded-3xl border border-[#d5b16a]/20 bg-[#111111] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h1 className="font-serif text-4xl text-[#f5d79e]">Admin</h1>
        {/* <p className="mt-2 text-sm text-neutral-600">
          <code className="rounded bg-neutral-100 px-1">MONGODB_URI</code> aur{" "}
          <code className="rounded bg-neutral-100 px-1">JWT_SECRET</code>{" "}
          <code className="rounded bg-neutral-100 px-1">.env</code> ya{" "}
          <code className="rounded bg-neutral-100 px-1">.env.local</code> mein hon —
          <span className="font-medium text-amber-800"> = ke baad space mat rakho</span>.
          Naya setup: pehle <span className="font-semibold">Register</span> se admin banao (jab tak DB khali ho).
        </p> */}

        {!statusLoaded && (
          <p className="mt-6 text-center text-sm font-bold uppercase tracking-widest text-[#d5b16a]/50">Loading…</p>
        )}

        {statusLoaded && mode === "login" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                await http.post("/api/admin/login", { email, password });
                router.push("/admin");
                router.refresh();
              } catch (e) {
                setMsg(errMsg(e, "Invalid username or password."));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70">
                Email
              </label>
              <input
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5d79e] outline-none ring-[#d5b16a]/30 focus:ring-2 focus:border-[#d5b16a]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70">
                Password
              </label>
              <input
                required
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5d79e] outline-none ring-[#d5b16a]/30 focus:ring-2 focus:border-[#d5b16a]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-3 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] disabled:opacity-60 hover:scale-[1.02] transition-transform"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : statusLoaded ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                await http.post("/api/admin/register", {
                  email,
                  password,
                  confirmPassword,
                });
                router.push("/admin");
                router.refresh();
              } catch (e) {
                setMsg(errMsg(e, "Register failed."));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70">
                Email
              </label>
              <input
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5d79e] outline-none ring-[#d5b16a]/30 focus:ring-2 focus:border-[#d5b16a]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70">
                Password
              </label>
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5d79e] outline-none ring-[#d5b16a]/30 focus:ring-2 focus:border-[#d5b16a]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70">
                Confirm password
              </label>
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5d79e] outline-none ring-[#d5b16a]/30 focus:ring-2 focus:border-[#d5b16a]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !canRegister}
              className="w-full rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-3 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] disabled:opacity-60 hover:scale-[1.02] transition-transform"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        ) : null}

        {msg && <p className="mt-4 text-xs font-bold uppercase tracking-widest text-rose-400 text-center">{msg}</p>}
      </div>
    </div>
  );
}
