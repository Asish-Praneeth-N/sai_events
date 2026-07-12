"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";
import RoleSwitcher from "./RoleSwitcher";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
  mode: "login" | "register";
}

const inputClass =
  "w-full px-4 py-3 bg-surface/65 dark:bg-[#130f0c]/60 border border-border dark:border-white/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-foreground dark:text-[#F7F3EC] placeholder-foreground/25 dark:placeholder-white/20 transition-all duration-300 text-sm font-light";

const labelClass =
  "text-[9px] font-bold text-[#D87A5E] dark:text-[#D4AF37]/80 uppercase tracking-[0.2em] transition-colors duration-300";

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (
            signInError.message.toLowerCase().includes("confirm") ||
            signInError.message.toLowerCase().includes("verified")
          ) {
            throw new Error(
              "Please verify your email address before logging in. Check your inbox for the verification link."
            );
          }
          throw signInError;
        }

        // Read role from DB and redirect to the correct workspace
        const { data: { user: authedUser } } = await supabase.auth.getUser();
        if (authedUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authedUser.id)
            .single();

          const role = profile?.role;
          if (role === "admin") {
            router.push("/admin/dashboard");
          } else if (role === "vendor") {
            router.push("/vendor");
          } else if (role === "operational_manager") {
            router.push("/operations");
          } else {
            router.push("/customer");
          }
        } else {
          router.refresh();
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (phoneNumber.length < 10) {
          throw new Error("Phone number must be at least 10 digits.");
        }

        const signupData: any = {
          full_name: fullName,
          phone_number: phoneNumber,
          role,
        };

        if (role === "vendor") {
          signupData.business_name = businessName;
          signupData.address = address;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: signupData,
          },
        });

        if (signUpError) throw signUpError;

        setMessage(
          "Registration successful! A verification email has been sent. Please confirm your email in your inbox before logging in."
        );

        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setPhoneNumber("");
        setBusinessName("");
        setAddress("");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {mode === "register" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Account Type</label>
              <RoleSwitcher value={role} onChange={setRole} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullName" className={labelClass}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className={labelClass}>
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className={inputClass}
              />
            </div>

            {role === "vendor" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="businessName" className={labelClass}>
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Creative Studio Photography"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className={labelClass}>
                    Business Address
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Creative Street, Studio Zone"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@example.com"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-[10px] text-[#D87A5E] hover:text-[#F4A28A] dark:text-[#D4AF37] dark:hover:text-[#f5db91] transition-colors font-semibold"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover disabled:opacity-50 text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs uppercase tracking-[0.18em]"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      {/* ── Success Modal (Confetti SVG) ── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-surface/90 dark:bg-[#0d0b08] border border-border dark:border-white/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden backdrop-blur-md transition-colors duration-300"
            >
              {/* Confetti Animation Background overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-40 z-0 select-none">
                <img src="/Confetti.svg" alt="" className="w-full h-full object-cover" />
              </div>

              {/* Icon / Brand */}
              <div className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/20 mb-6">
                <Sparkles className="w-7 h-7 text-white dark:text-black" />
              </div>

              <h3 className="relative z-10 text-xl font-light text-foreground dark:text-white mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                Celebration Begins!
              </h3>

              <p className="relative z-10 text-xs text-muted-foreground dark:text-[#F7F3EC]/70 leading-relaxed mb-8 px-2">
                {message}
              </p>

              {/* Action Button: Back to Sign In */}
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  router.push("/login");
                }}
                className="relative z-10 w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white dark:text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] text-xs uppercase tracking-[0.18em] cursor-pointer"
              >
                Back to Sign In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sign In Loading Overlay (Flowers SVG) ── */}
      <AnimatePresence>
        {loading && mode === "login" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#060504]/90 backdrop-blur-md"
          >
            <div className="relative w-44 h-44 mb-6">
              <img src="/Flowers.svg" alt="Loading" className="w-full h-full object-contain" />
            </div>

            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.25em] animate-pulse">
              Entering Experience...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
