"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert, LogOut, Sparkles } from "lucide-react";

export default function LockedPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060606] text-[#F7F3EC] px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="film-grain absolute inset-0 opacity-[0.02]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/60 border border-white/8 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
        {/* Brand/Warning Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-[#D4AF37] flex items-center justify-center shadow-lg shadow-amber-500/15 mb-6">
          <ShieldAlert className="w-7 h-7 text-black" />
        </div>

        <h2 
          className="text-2xl font-light text-white mb-2"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Activation Pending
        </h2>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] mb-6 font-semibold">
          Account Locked
        </p>

        <p className="text-xs text-[#F7F3EC]/70 leading-relaxed mb-8 px-2">
          Your Operational Manager account is registered, but requires administrator approval to activate. 
          Please contact your administrator to unlock access to the Event Execution Center.
        </p>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loading ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </main>
  );
}
