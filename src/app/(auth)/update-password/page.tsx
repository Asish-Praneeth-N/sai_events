"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeOMPasswordChange } from "@/app/operations/actions";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputClass =
  "w-full px-4 py-3 bg-white/50 dark:bg-[#130f0c]/60 border border-white/40 dark:border-white/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D87A5E]/30 dark:focus:ring-[#D4AF37]/30 focus:border-[#D87A5E] dark:focus:border-[#D4AF37] text-[#3A2F28] dark:text-[#F7F3EC] placeholder-[#3A2F28]/30 dark:placeholder-white/20 transition-all duration-300 text-sm font-light";

const labelClass =
  "text-[9px] font-bold text-[#D87A5E] dark:text-[#D4AF37]/80 uppercase tracking-[0.2em] transition-colors duration-300";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Update user password in auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // 2. Fetch user's profile to check role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // 3. Clear OM password change flag if needed
        if (profile?.role === "operational_manager") {
          try {
            await completeOMPasswordChange();
          } catch (omErr) {
            console.error("Failed to clear OM password change flag:", omErr);
          }
        }

        setMessage("Your password has been updated successfully.");
      } else {
        throw new Error("No authenticated user found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  const handleModalClose = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin/dashboard");
        } else if (profile?.role === "vendor") {
          router.push("/vendor");
        } else if (profile?.role === "operational_manager") {
          router.push("/operations");
        } else {
          router.push("/customer");
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-light text-foreground dark:text-white mb-1 transition-colors duration-300"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Secure Your Account
        </h2>
        <p className="text-[11px] text-muted-foreground/60 dark:text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light transition-colors duration-300">
          Set a new password for your profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClass}>
            New Password
          </label>
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm New Password
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover disabled:opacity-50 text-white dark:text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs uppercase tracking-[0.18em]"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* Success Modal (Confetti style) */}
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
              <div className="absolute inset-0 pointer-events-none opacity-40 z-0 select-none">
                <img src="/Confetti.svg" alt="" className="w-full h-full object-cover" />
              </div>

              <div className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/20 mb-6">
                <Sparkles className="w-7 h-7 text-white dark:text-black" />
              </div>

              <h3 className="relative z-10 text-xl font-light text-foreground dark:text-white mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                Success
              </h3>

              <p className="relative z-10 text-xs text-muted-foreground dark:text-[#F7F3EC]/70 leading-relaxed mb-8 px-2">
                {message}
              </p>

              <button
                type="button"
                onClick={handleModalClose}
                className="relative z-10 w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white dark:text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] text-xs uppercase tracking-[0.18em] cursor-pointer"
              >
                Proceed to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
