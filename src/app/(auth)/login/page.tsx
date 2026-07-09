"use client";

import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";
import { Calendar, Store } from "lucide-react";

type Path = "customer" | "vendor";

export default function LoginPage() {
  const [path, setPath] = useState<Path>("customer");

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-light text-white mb-1"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Welcome Back
        </h2>
        <p className="text-[11px] text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light">
          Sign in to continue your journey
        </p>
      </div>

      {/* ── Path Toggle: Customer vs Vendor ── */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full mb-6">
        <button
          type="button"
          onClick={() => setPath("customer")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-250 cursor-pointer ${
            path === "customer"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black shadow-md shadow-[#D4AF37]/20"
              : "text-[#F7F3EC]/45 hover:text-[#F7F3EC]/80"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Customer
        </button>
        <button
          type="button"
          onClick={() => setPath("vendor")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-250 cursor-pointer ${
            path === "vendor"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black shadow-md shadow-[#D4AF37]/20"
              : "text-[#F7F3EC]/45 hover:text-[#F7F3EC]/80"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Vendor
        </button>
      </div>

      <AuthForm mode="login" />

      <div className="mt-6 text-center text-[11px] text-[#F7F3EC]/40">
        Don&apos;t have an account?{" "}
        <Link
          href={path === "vendor" ? "/register?role=vendor" : "/register"}
          className="text-[#D4AF37] hover:text-[#f5db91] transition-colors font-bold"
        >
          {path === "vendor" ? "Register as Vendor" : "Create Account"}
        </Link>
      </div>
    </div>
  );
}
