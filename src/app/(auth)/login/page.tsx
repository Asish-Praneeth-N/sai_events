"use client";

import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-light text-foreground dark:text-white mb-1 transition-colors duration-300"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Welcome Back
        </h2>
        <p className="text-[11px] text-muted-foreground/60 dark:text-[#F7F3EC]/45 uppercase tracking-[0.2em] font-light transition-colors duration-300">
          Sign in to continue your journey
        </p>
      </div>

      <AuthForm mode="login" />

      <div className="mt-6 text-center text-[11px] text-muted-foreground/50 dark:text-[#F7F3EC]/40 transition-colors duration-300">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#D87A5E] hover:text-[#F4A28A] dark:text-[#D4AF37] dark:hover:text-[#f5db91] transition-colors font-bold"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
