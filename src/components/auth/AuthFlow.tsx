"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, UserPlus, Eye, EyeOff, MapPin, LocateFixed } from "lucide-react";
import { loginCustomer } from "@/services/customer";
import { useAuth } from "@/features/auth/auth-context";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

interface AuthFlowProps {
  onSuccess: () => void;
  initialMode?: "login" | "signup" | "forgot";
}

type AuthMode = "login" | "signup" | "forgot";

export function AuthFlow({ onSuccess, initialMode = "login" }: AuthFlowProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { refresh } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const fetchCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            toast.success("Location found successfully");
          }
        } catch (e) {
          console.error(e);
          toast.error("Could not fetch address");
        } finally {
          setLocating(false);
        }
      }, () => {
        toast.error("Location permission denied");
        setLocating(false);
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      console.log("[AUTH_FLOW_LOGIN] Attempting login for:", email);
      const res = await loginCustomer(email.toLowerCase().trim(), password);
      console.log("[AUTH_FLOW_LOGIN] Response:", res);
      if (res.success) {
        toast.success("Welcome back to Royal Platter!");
        await refresh();
        onSuccess();
      } else {
        const msg = res.error || "Invalid email or password";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Authentication failed";
      if (err.response?.status !== 401 && err.response?.status !== 400) {
        console.error("[AUTH_FLOW_LOGIN] Unexpected Error:", err);
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      if (!address.trim()) { setError("Please enter your delivery address"); return; }

      setLoading(true);
      setError(null);
      try {
        console.log("[AUTH_FLOW_SIGNUP] Creating account for:", email);
        const res = await fetch("/api/customer/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
            name,
            address
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        toast.success("Account created successfully!");
        await refresh();
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Signup failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Forgot Password Flow
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const type = "forgot_password";
      console.log("[AUTH_FLOW_OTP_SEND] Payload:", { email: normalizedEmail, type });

      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, type }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const type = "forgot_password";
      console.log("[AUTH_FLOW_OTP_VERIFY] Payload:", { email: normalizedEmail, otp, type });

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp: otp.trim(), type }),
      });
      const data = await res.json();
      console.log("[AUTH_FLOW_OTP_VERIFY] Response:", data);

      if (!res.ok) throw new Error(data.error || "Invalid verification code");

      setStep(3); // Move to set new password step
    } catch (err: any) {
      console.error("[AUTH_FLOW_VERIFY] Error:", err);
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      toast.success("Password reset successful! Logging you in...");

      // Auto-login
      const loginRes = await loginCustomer(email.toLowerCase().trim(), newPassword);
      if (loginRes.success) {
        await refresh();
        onSuccess();
      } else {
        // If auto-login fails for some reason, go back to login form
        setMode("login");
        setStep(1);
        setError("Password reset successful. Please login with your new password.");
      }
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    let title = "Welcome Back";
    let subtitle = "Login to your royal account";
    let Icon = Mail;

    if (mode === "signup") {
      title = "Create Account";
      subtitle = "Join the Royal Platter family";
      Icon = UserPlus;
    } else if (mode === "forgot") {
      title = "Reset Password";
      subtitle = "Securely recover your account";
      Icon = KeyRound;
    }

    return (
      <div className="text-center space-y-3 mb-8 relative">
        {/* Back Button */}
        {(mode !== "login" || step !== 1) && (
          <button
            type="button"
            onClick={() => {
              if (step > 1) {
                setStep((s) => (s - 1) as any);
              } else {
                setMode("login");
                setError(null);
              }
            }}
            className="absolute left-0 top-0 p-2 rounded-xl bg-white/5 text-[#d5b16a]/50 hover:text-[#d5b16a] hover:bg-white/10 transition-all border border-white/5"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d5b16a]/20 to-[#d5b16a]/5 border border-[#d5b16a]/30 flex items-center justify-center shadow-inner relative group">
          <div className="absolute inset-0 bg-[#d5b16a]/10 blur-xl group-hover:blur-2xl transition-all rounded-full opacity-50" />
          <Icon className="w-8 h-8 text-[#d5b16a] relative z-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#f5d79e] tracking-tight">{title}</h2>
        <p className="text-[#d5b16a]/60 text-xs font-bold uppercase tracking-[0.2em]">{subtitle}</p>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      {renderHeader()}

      {/* Social Auth - Always visible for login/signup step 1 */}
      {(mode !== "forgot" || (mode === "forgot" && step === 1)) && step === 1 && !isSuccess && (
        <div className="space-y-6 mb-8">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-[#d5b16a]/20 hover:border-[#d5b16a]/40 text-white py-5 rounded-2xl font-bold text-sm tracking-[0.1em] transition-all group active:scale-[0.98] shadow-lg shadow-black/20"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#d5b16a]/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-bold"><span className="bg-[#050505] px-4 text-[#d5b16a]/30">or email</span></div>
          </div>
        </div>
      )}

      {/* Form Area */}
      <div className="min-h-[280px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Success!</h3>
            <p className="text-[#d5b16a]/60 text-center">Your password has been reset.<br />Redirecting to login...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={
              mode === "login" ? handleLogin :
                step === 1 ? handleAuthAction :
                  step === 2 ? handleVerifyOtp :
                    handleFinalSubmit
            } className="space-y-5">

              {/* Step 1: Initial Form */}
              {step === 1 && (
                <div className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {(mode === "login" || mode === "signup") && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold">Password</label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => { setMode("forgot"); setStep(1); setError(null); }}
                            className="text-[10px] uppercase tracking-widest text-[#d5b16a] font-bold hover:underline"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={mode === "signup" ? "Minimum 6 characters" : "••••••••"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-4 pl-14 pr-12 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d5b16a]/30 hover:text-[#d5b16a] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold">Delivery Address</label>
                        <button
                          type="button"
                          onClick={fetchCurrentLocation}
                          disabled={locating}
                          className="text-[10px] uppercase tracking-widest text-[#d5b16a] font-bold hover:text-[#f5d79e] transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                          Use GPS
                        </button>
                      </div>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-5 w-5 h-5 text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors" />
                        <textarea
                          placeholder="House no, Street name, Landmark..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all min-h-[100px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-[#f5d79e]/80">We've sent a 6-digit code to</p>
                    <p className="text-sm font-bold text-[#d5b16a]">{email}</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="0 0 0 0 0 0"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-5 text-center text-2xl font-bold tracking-[0.5em] text-[#d5b16a] focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold hover:text-[#d5b16a] transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change Email
                  </button>
                </div>
              )}

              {/* Step 3: New Password (Only for forgot password) */}
              {step === 3 && mode === "forgot" && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#d5b16a]/50 font-bold ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d5b16a]/30 group-focus-within:text-[#d5b16a] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-[#d5b16a]/20 rounded-2xl py-4 pl-14 pr-12 text-white placeholder:text-white/20 focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a] outline-none transition-all"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d5b16a]/30 hover:text-[#d5b16a] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#b38a46] to-[#d5b16a] py-5 text-sm font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d5b16a]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-6"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === "login"
                        ? "Enter the Palace"
                        : mode === "forgot" && step === 3
                          ? "Reset Password"
                          : mode === "signup" && step === 1
                            ? "Create Royal Account"
                            : step === 2
                              ? "Verify Code"
                              : "Continue"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer Navigation */}
      {!isSuccess && (
        <div className="mt-10 text-center space-y-4">
          {mode === "login" ? (
            <p className="text-[11px] text-[#d5b16a]/40 font-bold uppercase tracking-widest">
              New Guest?
              <button
                type="button"
                onClick={() => { setMode("signup"); setStep(1); setError(null); }}
                className="ml-2 text-[#d5b16a] hover:underline"
              >
                Create Royal Account
              </button>
            </p>
          ) : (
            <p className="text-[11px] text-[#d5b16a]/40 font-bold uppercase tracking-widest">
              Already a Member?
              <button
                type="button"
                onClick={() => { setMode("login"); setStep(1); setError(null); }}
                className="ml-2 text-[#d5b16a] hover:underline"
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
