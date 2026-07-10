"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Sparkles, Menu, X, ChevronDown, LogOut, LayoutDashboard, Calendar, User, Inbox, Briefcase, Image as ImageIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  activeSection?: number;
  sections?: { label: string; id: string }[];
}

// ─── Nav items per auth state ────────────────────────────────────────────────
const GUEST_NAV = [
  { label: "Home",       href: "#home" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Atelier",    href: "#categories" },
  { label: "Gallery",    href: "#gallery" },
  { label: "Journey",    href: "#journey" },
  { label: "Chronicle",  href: "#about" },
  { label: "Contact",    href: "#contact" },
];

const CUSTOMER_NAV = [
  { label: "Home",       href: "#home",                    icon: null     },
  { label: "My Events",  href: "/customer/request",        icon: Calendar },
  { label: "Dashboard",  href: "/customer/dashboard",      icon: LayoutDashboard },
  { label: "Gallery",    href: "#gallery",                 icon: null     },
  { label: "Profile",    href: "/customer/profile",        icon: User     },
];

const VENDOR_NAV = [
  { label: "Home",        href: "#home",           icon: null         },
  { label: "Dashboard",   href: "/vendor/page",    icon: LayoutDashboard },
  { label: "Bookings",    href: "/vendor/bookings", icon: Briefcase   },
  { label: "Portfolio",   href: "/vendor/services", icon: ImageIcon   },
  { label: "Messages",    href: "/vendor/inbox",    icon: Inbox       },
  { label: "Profile",     href: "/vendor/profile",  icon: User        },
];

export default function Navbar({
  activeSection = 0,
  sections = [],
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ─── Auth state ───────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (mounted) { setProfile(data); setAuthLoading(false); }
      } else {
        if (mounted) { setProfile(null); setAuthLoading(false); }
      }
    }
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (mounted) setProfile(data);
      } else {
        if (mounted) setProfile(null);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // ─── Scroll Listener for Sticky State ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Prevent Body Scroll when mobile drawer is open ────────────────────────
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ─── Determine nav items based on role ───────────────────────────────────
  const role    = profile?.role ?? "guest";
  const navItems = role === "customer" ? CUSTOMER_NAV : role === "vendor" ? VENDOR_NAV : GUEST_NAV;
  const currentSectionLabel = sections[activeSection]?.label ?? "";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300 ${
          scrolled 
            ? "bg-navbar-bg border-border py-3 shadow-sm" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          {/* ── Brand ──────────────────────────────────────────────────── */}
          <Link
            href="#home"
            className={`flex items-center gap-2 select-none origin-left group flex-shrink-0 transition-transform duration-300 ${
              scrolled ? "scale-90" : "scale-100"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md shadow-accent-gold/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-base font-black text-foreground tracking-[0.18em] uppercase" style={{ fontFamily: "Playfair Display, serif" }}>
              Sai Events
            </span>
          </Link>

          {/* ── Active Section Label (center) ─────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeSection > 0 && currentSectionLabel && (
              <motion.span
                key={currentSectionLabel}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 0.4, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-[0.3em] text-accent-gold hidden md:block pointer-events-none"
              >
                {currentSectionLabel}
              </motion.span>
            )}
          </AnimatePresence>

          {/* ── Desktop Nav ───────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] uppercase font-light tracking-[0.16em] text-foreground/65 hover:text-accent-gold transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ── Right Actions ──────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {authLoading ? (
              <div className="w-20 h-7 rounded-lg bg-foreground/5 animate-pulse" />
            ) : profile ? (
              /* ── Authenticated: Avatar Dropdown ── */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-border hover:border-accent-gold/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center text-white dark:text-black font-black text-[10px] flex-shrink-0">
                    {profile.full_name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-[10px] font-bold text-foreground/85 hidden xl:block">{profile.full_name}</span>
                  <ChevronDown className={`w-3 h-3 text-foreground/40 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Backdrop */}
                {dropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-12 w-56 bg-surface border border-border rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl"
                    >
                      <div className="px-4 py-2.5 border-b border-border mb-1">
                        <p className="text-[11px] font-bold text-foreground truncate">{profile.full_name}</p>
                        <p className="text-[9px] text-accent-gold uppercase tracking-wider font-bold mt-0.5">{profile.role}</p>
                      </div>

                      <div className="px-1.5 space-y-0.5">
                        {/* Role portal link */}
                        {profile.role === "customer" && (
                          <Link href="/customer/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all duration-200">
                            <LayoutDashboard className="w-3.5 h-3.5 text-accent-gold" /> Customer Portal
                          </Link>
                        )}
                        {profile.role === "vendor" && (
                          <Link href="/vendor/inbox" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all duration-200">
                            <Inbox className="w-3.5 h-3.5 text-accent-gold" /> Vendor Portal
                          </Link>
                        )}
                        {profile.role === "admin" && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all duration-200">
                            <LayoutDashboard className="w-3.5 h-3.5 text-accent-gold" /> Admin Console
                          </Link>
                        )}

                        <div className="h-px bg-border my-1" />

                        {/* Logout */}
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-400 hover:bg-red-500/8 rounded-xl transition-all duration-200 cursor-pointer">
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest: Login + Book CTAs ── */
              <>
                <Link
                  href="/login"
                  className="text-[10px] uppercase font-bold tracking-[0.14em] text-foreground/65 hover:text-foreground px-4 py-2 rounded-xl hover:bg-foreground/5 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-primary text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.16em] rounded-xl hover:scale-[1.03] hover:shadow-lg hover:shadow-accent-gold/15 dark:hover:shadow-[#D4AF37]/30 transition-all duration-300"
                >
                  Book Event
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ─────────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-foreground/5 text-foreground hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300 cursor-pointer flex-shrink-0"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[99999] flex flex-col bg-background/98 w-screen h-screen overflow-y-auto"
          >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 border-b border-border">
              <Link
                href="#home"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 no-underline"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white dark:text-black" />
                </div>
                <span className="font-heading font-black text-sm text-foreground tracking-[0.2em] uppercase">
                  Sai Events
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl border border-border bg-foreground/5 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Centered nav links ── */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-6 py-8 px-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-lg uppercase font-light tracking-[0.25em] text-foreground/80 hover:text-accent-gold active:text-accent-gold transition-colors duration-200 no-underline"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* ── Auth CTAs ── */}
            <div className="px-6 pb-12 pt-6 border-t border-border flex flex-col gap-3 flex-shrink-0">
              {!profile && (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center py-4 bg-gradient-primary text-white dark:text-black text-[11px] font-black uppercase tracking-[0.22em] rounded-2xl shadow-lg shadow-accent-gold/15 dark:shadow-[#D4AF37]/15 no-underline"
                  >
                    Book Your Event
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center py-4 border border-border text-foreground/80 text-[11px] font-bold uppercase tracking-[0.22em] rounded-2xl hover:border-[#D4AF37]/40 hover:text-foreground transition-colors duration-200 no-underline"
                  >
                    Sign In
                  </Link>
                </>
              )}

              {profile && (
                <>
                  <div className="text-center mb-3">
                    <p className="text-sm font-bold text-foreground">{profile.full_name}</p>
                    <p className="text-[9px] text-accent-gold uppercase tracking-[0.22em] mt-0.5">{profile.role}</p>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center py-4 border border-red-500/25 text-red-400 text-[11px] font-bold uppercase tracking-[0.22em] rounded-2xl cursor-pointer hover:bg-red-500/5 transition-colors duration-200 bg-transparent"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
