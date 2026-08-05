import Link from "next/link";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="
      relative min-h-screen
      flex items-center justify-center
      bg-[#F8F7F4] dark:bg-[#090909]
      text-foreground
      px-4 py-8
      overflow-hidden
      transition-colors duration-300
    ">
      {/* ── Theme Switcher ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Cinematic background ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/wedding.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.08] transition-opacity duration-300"
          aria-hidden="true"
        />
        {/* Theme-adaptive overlay */}
        <div className="absolute inset-0 bg-transparent dark:bg-black/85 transition-colors duration-300" />
        {/* Warm ambient centre glow — gold tinted, matches landing page */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-[#C8A435]/6 dark:bg-[#D4AF37]/7 rounded-full blur-[160px] transition-colors duration-300" />
        {/* Subtle film grain */}
        <div className="film-grain absolute inset-0" aria-hidden="true" />
        {/* Cinema lens vignette */}
        <div className="cinema-lens" aria-hidden="true" />
      </div>

      {/* ── Auth card ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md my-auto">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-7 px-10 text-center">
          <Link href="/" className="flex items-center gap-2.5 group mb-2.5">
            <div className="
              w-9 h-9 rounded-xl
              bg-gradient-primary
              flex items-center justify-center
              shadow-[0_4px_16px_rgba(200,164,53,0.25)] dark:shadow-[0_4px_16px_rgba(212,175,55,0.22)]
              group-hover:scale-105
              transition-transform duration-300
            ">
              <Sparkles className="w-5 h-5 text-[#1A1917] dark:text-black" />
            </div>
            <span
              className="text-xl font-black text-[#1A1917] dark:text-white tracking-[0.22em] uppercase transition-colors duration-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Sai Events
            </span>
          </Link>

          <p className="
            text-[9px] uppercase tracking-[0.28em] font-light
            text-[#9A7531] dark:text-[#D4AF37]/60
            transition-colors duration-300
            max-w-[240px] leading-relaxed
          ">
            Crafting Celebrations That Become Memories
          </p>
        </div>

        {/* Thin gold divider */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C8A435]/40 dark:via-[#D4AF37]/35 to-transparent mx-auto mb-7" />

        {/* Card — editorial style matching landing page cards */}
        <div className="
          bg-white/85 dark:bg-black/55
          border border-[#E2DDD6] dark:border-white/[0.07]
          rounded-3xl p-6 sm:p-8
          shadow-[0_8px_40px_rgba(26,25,23,0.08),0_1px_2px_rgba(26,25,23,0.04)]
          dark:shadow-[0_10px_48px_rgba(0,0,0,0.55)]
          backdrop-blur-[2px] dark:backdrop-blur-md
          transition-all duration-300
        ">
          {children}
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="
              text-[10px] uppercase tracking-[0.18em] font-light
              text-[#1A1917]/35 dark:text-[#F7F3EC]/30
              hover:text-[#9A7531] dark:hover:text-[#D4AF37]
              transition-colors duration-300
            "
          >
            ← Return to Experience
          </Link>
        </div>
      </div>
    </main>
  );
}