"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { Search, Bell, Plus, User, LogOut, Menu } from "lucide-react";

interface CustomerHeaderProps {
  customerName: string;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

export default function CustomerHeader({ customerName, onSearchClick, onMenuClick }: CustomerHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="p-2 border border-border bg-background hover:bg-surface-raised text-muted-foreground hover:text-foreground rounded-xl transition duration-150 md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* ── Search Bar Trigger ── */}
        <button 
          onClick={onSearchClick}
          className="flex items-center gap-3 px-4 py-2 w-10 sm:w-64 rounded-xl border border-border bg-background hover:bg-surface-raised text-muted-foreground text-left text-xs transition-all duration-200 cursor-pointer focus:outline-none justify-center sm:justify-start"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline flex-1 font-light">Search planning workspace...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md border border-border bg-surface text-[9px] font-bold">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* ── Actions Hub ── */}
      <div className="flex items-center gap-4">
        {/* Direct Link to Plan New Event */}
        <Link
          href="/customer/request"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold text-xs rounded-xl shadow-md shadow-[#D4AF37]/10 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Plan Event</span>
        </Link>

        {/* Notifications Shortcut */}
        <Link 
          href="/customer/dashboard?tab=notifications"
          className="p-2 border border-border bg-background hover:bg-surface-raised text-muted-foreground hover:text-foreground rounded-xl transition duration-150 relative cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
        </Link>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-accent-gold/45 flex items-center justify-center font-bold text-xs text-accent-gold uppercase cursor-pointer transition duration-200"
          >
            {customerName ? customerName.substring(0, 2) : "CU"}
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-surface border border-border shadow-xl p-2.5 space-y-1 z-50 animate-fade-in">
                <div className="px-3.5 py-2.5 border-b border-border/80 mb-1.5">
                  <div className="text-xs font-bold text-foreground truncate">{customerName || "Customer Partner"}</div>
                  <div className="text-[8.5px] uppercase tracking-wider text-accent-gold font-semibold mt-0.5">Private Client</div>
                </div>
                <Link
                  href="/customer/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-accent-gold transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/[0.03] transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
