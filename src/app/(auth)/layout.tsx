import Link from "next/link";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8 overflow-hidden transition-colors duration-300">
      {/* ── Theme Switcher ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Cinematic background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/wedding.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.07] transition-opacity duration-300"
          aria-hidden="true"
        />
        {/* Theme adaptive overlay */}
        <div className="absolute inset-0 bg-transparent dark:bg-black/85 transition-colors duration-300" />
        {/* Warm ambient center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-gold/5 dark:bg-[#D4AF37]/7 rounded-full blur-[150px] transition-colors duration-300" />
        {/* Subtle film grain overlay */}
        <div className="film-grain absolute inset-0" aria-hidden="true" />
        {/* Cinema lens vignette */}
        <div className="cinema-lens" aria-hidden="true" />
      </div>

      {/* ── Auth card ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-6 px-10 text-center">
          <Link href="/" className="flex items-center gap-2.5 group mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span
              className="text-xl font-black text-foreground dark:text-white tracking-[0.22em] uppercase transition-colors duration-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Sai Events
            </span>
          </Link>
          <p className="text-[9px] uppercase tracking-[0.28em] text-accent-gold dark:text-[#D4AF37]/60 font-light transition-colors duration-300 max-w-[240px] leading-relaxed">
            Crafting Celebrations That Become Memories
          </p>
        </div>

        {/* Thin gold divider */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent mx-auto mb-6" />

        {/* Card */}
        <div className="bg-card-bg dark:bg-black/60 border border-card-border dark:border-white/8 rounded-3xl p-6 sm:p-8 shadow-card-shadow dark:shadow-black/40 transition-all duration-300">
          {children}
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 dark:text-[#F7F3EC]/35 hover:text-accent-gold dark:hover:text-accent-gold transition-colors duration-300 font-light"
          >
            ← Return to Experience
          </Link>
        </div>
      </div>
    </main>
  );
}
