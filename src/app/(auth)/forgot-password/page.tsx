"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputClass =
  "w-full px-4 py-3 bg-white/50 dark:bg-[#130f0c]/60 border border-white/40 dark:border-white/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D87A5E]/30 dark:focus:ring-[#D4AF37]/30 focus:border-[#D87A5E] dark:focus:border-[#D4AF37] text-[#3A2F28] dark:text-[#F7F3EC] placeholder-[#3A2F28]/30 dark:placeholder-white/20 transition-all duration-300 text-sm font-light";

const labelClass =
  "text-[9px] font-bold text-[#D87A5E] dark:text-[#D4AF37]/80 uppercase tracking-[0.2em] transition-colors duration-300";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (resetError) throw resetError;

      setMessage(
        "A password reset link has been sent to your email address. Please follow the instructions in the email to set a new password."
      );
      setEmail("");
    } catch (err: any) {
      setError(err.message || "An error occurred while requesting a password reset.");
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
          Reset Password
        </h2>
        <p className="text-[11px] text-muted-foreground/60 dark:text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light transition-colors duration-300">
          Enter email to recover your access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl">
            {error}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover disabled:opacity-50 text-white dark:text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs uppercase tracking-[0.18em]"
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-[11px] text-[#D87A5E] hover:text-[#F4A28A] dark:text-[#D4AF37] dark:hover:text-[#f5db91] transition-colors font-bold"
          >
            Back to Sign In
          </Link>
        </div>
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
                Reset Link Sent
              </h3>

              <p className="relative z-10 text-xs text-muted-foreground dark:text-[#F7F3EC]/70 leading-relaxed mb-8 px-2">
                {message}
              </p>

              <Link
                href="/login"
                onClick={() => setMessage(null)}
                className="relative z-10 block w-full py-3.5 bg-gradient-primary hover:bg-gradient-primary-hover text-white dark:text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 hover:scale-[1.02] text-xs text-center uppercase tracking-[0.18em] cursor-pointer"
              >
                Back to Sign In
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
