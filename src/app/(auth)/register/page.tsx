"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

function RegisterPageContent() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-light text-white mb-1"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Create Account
        </h2>
        <p className="text-[11px] text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light">
          Start planning your celebration
        </p>
      </div>

      <AuthForm mode="register" />

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
