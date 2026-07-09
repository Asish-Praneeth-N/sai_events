import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060606] text-[#F7F3EC] px-4 overflow-hidden">
      {/* ── Cinematic background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/wedding.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.07]"
          aria-hidden="true"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/85" />
        {/* Warm ambient center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/7 rounded-full blur-[150px]" />
        {/* Subtle film grain overlay */}
        <div className="film-grain absolute inset-0" aria-hidden="true" />
        {/* Cinema lens vignette */}
        <div className="cinema-lens" aria-hidden="true" />
      </div>

      {/* ── Auth card ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span
              className="text-xl font-black text-white tracking-[0.22em] uppercase"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Sai Events
            </span>
          </Link>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/60 font-light">
            Crafting Celebrations That Become Memories
          </p>
        </div>

        {/* Thin gold divider */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mb-8" />

        {/* Card */}
        <div className="bg-black/60 border border-white/8 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          {children}
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.18em] text-[#F7F3EC]/35 hover:text-[#D4AF37] transition-colors duration-300 font-light"
          >
            ← Return to Experience
          </Link>
        </div>
      </div>
    </main>
  );
}
