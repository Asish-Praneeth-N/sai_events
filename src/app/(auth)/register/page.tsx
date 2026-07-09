"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";
import { Calendar, Store, Info } from "lucide-react";

type Path = "customer" | "vendor";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const [path, setPath] = useState<Path>("customer");

  // Respect ?role=vendor URL param (from "Become a Vendor" CTAs)
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "vendor") {
      Promise.resolve().then(() => setPath("vendor"));
    }
  }, [searchParams]);

  const isVendor = path === "vendor";

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-light text-white mb-1"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {isVendor ? "Join as a Vendor" : "Create Account"}
        </h2>
        <p className="text-[11px] text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light">
          {isVendor ? "Grow your business with SAI EVENTS" : "Start planning your celebration"}
        </p>
      </div>

      {/* ── Path Toggle ── */}
      <div className="flex rounded-xl overflow-hidden border border-white/8 mb-6">
        <button
          onClick={() => setPath("customer")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] uppercase font-bold tracking-[0.14em] transition-all duration-300 cursor-pointer ${
            !isVendor ? "bg-[#D4AF37] text-black" : "bg-transparent text-[#F7F3EC]/55 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Book an Event
        </button>
        <button
          onClick={() => setPath("vendor")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] uppercase font-bold tracking-[0.14em] transition-all duration-300 cursor-pointer ${
            isVendor ? "bg-[#D4AF37] text-black" : "bg-transparent text-[#F7F3EC]/55 hover:text-white"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Become a Vendor
        </button>
      </div>

      {/* Vendor info banner */}
      {isVendor && (
        <div className="flex gap-3 items-start p-4 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl mb-5">
          <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-[#D4AF37] mb-0.5 uppercase tracking-wider">
              Vendor Registration
            </p>
            <p className="text-[10px] text-[#F7F3EC]/60 font-light leading-relaxed">
              Register your business to get discovered by thousands of customers. 
              After registration, complete your profile with portfolio, pricing, and availability.
            </p>
          </div>
        </div>
      )}

      {/* Auth form — role is pre-set based on path selection */}
      <div key={path}>
        <AuthForm mode="register" />
      </div>

      <div className="mt-6 text-center text-[11px] text-[#F7F3EC]/40">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#D4AF37] hover:text-[#f5db91] transition-colors font-bold"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="text-center text-[#F7F3EC]/50 text-xs py-10 uppercase tracking-[0.2em] font-light">
        Loading registration...
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
