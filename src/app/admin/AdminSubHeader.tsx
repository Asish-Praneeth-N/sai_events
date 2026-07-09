"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Menu, X, LayoutDashboard, BookOpen, Users, Store, GitBranch, Clock, Image, Bell } from "lucide-react";

const links = [
  { href: "/admin",              label: "Overview",      icon: LayoutDashboard },
  { href: "/admin/catalog",      label: "Catalog",       icon: BookOpen        },
  { href: "/admin/bookings",     label: "Bookings",      icon: GitBranch       },
  { href: "/admin/vendors",      label: "Vendors",       icon: Store           },
  { href: "/admin/customers",    label: "Customers",     icon: Users           },
  { href: "/admin/assignments",  label: "Assignments",   icon: GitBranch       },
  { href: "/admin/status-history", label: "Status",     icon: Clock           },
  { href: "/admin/media",        label: "Media",         icon: Image           },
  { href: "/admin/notifications",label: "Notifications", icon: Bell            },
];

export default function AdminSubHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-white/8 bg-[#080604]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Brand */}
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-black text-white tracking-[0.15em] uppercase" style={{ fontFamily: "Playfair Display, serif" }}>
                  Sai Events
                </span>
                <span className="block text-[8px] uppercase tracking-[0.22em] text-[#D4AF37]/60 font-light -mt-0.5">
                  Admin Console
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-stretch h-full">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200 border-b-2 whitespace-nowrap ${
                      active
                        ? "text-[#D4AF37] border-[#D4AF37] bg-[#D4AF37]/5"
                        : "text-[#F7F3EC]/45 border-transparent hover:text-[#F7F3EC]/80 hover:border-white/20"
                    }`}
                  >
                    <link.icon className="w-3 h-3 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: status dot + mobile burger */}
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
                </span>
                <span className="text-[9px] font-bold text-[#D4AF37]/60 uppercase tracking-wider">Live</span>
              </div>

              {/* Return to site */}
              <Link
                href="/"
                className="hidden sm:flex text-[9px] font-bold uppercase tracking-wider text-[#F7F3EC]/30 hover:text-[#D4AF37] transition-colors duration-200"
              >
                ← Site
              </Link>

              {/* Mobile burger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[#F7F3EC]/70 hover:text-white transition-all duration-200 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="fixed top-14 left-0 right-0 z-50 md:hidden bg-[#080604]/98 border-b border-white/10 backdrop-blur-xl shadow-2xl shadow-black/60">
            {/* Brand row */}
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]/70">
                Admin Console
              </span>
            </div>

            {/* Links grid */}
            <nav className="grid grid-cols-2 gap-px p-3 bg-white/5">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      active
                        ? "bg-[#D4AF37]/12 text-[#D4AF37] border border-[#D4AF37]/25"
                        : "bg-[#0c0b09] text-[#F7F3EC]/55 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 shrink-0 ${active ? "text-[#D4AF37]" : "text-[#F7F3EC]/30"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-[10px] text-[#F7F3EC]/35 hover:text-[#D4AF37] transition-colors uppercase tracking-wider font-bold"
              >
                ← Return to Site
              </Link>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
                </span>
                <span className="text-[9px] font-bold text-[#D4AF37]/60 uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
