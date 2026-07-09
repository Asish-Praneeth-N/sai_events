"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Search, Bell, Sparkles, Plus, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  adminName: string;
  onSearchClick: () => void;
}

export default function AdminHeader({ adminName, onSearchClick }: AdminHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-[#0d0b08]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* ── Search Bar Trigger ── */}
      <button 
        onClick={onSearchClick}
        className="flex items-center gap-3 px-3 py-1.5 w-64 rounded-xl border border-border bg-background hover:bg-surface-raised text-muted-foreground text-left text-xs transition duration-150 cursor-pointer focus:outline-none"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1">Search anything...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md border border-border bg-surface text-[9px] font-bold">
          Ctrl K
        </kbd>
      </button>

      {/* ── Actions Hub ── */}
      <div className="flex items-center gap-4">
        
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickOpen(!quickOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-black font-bold text-xs rounded-xl shadow-md shadow-[#D4AF37]/15 transition hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {quickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface border border-border shadow-xl p-2.5 space-y-1 z-50 animate-fade-in">
                <Link
                  href="/admin/bookings"
                  onClick={() => setQuickOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-accent-gold transition-colors"
                >
                  New Booking
                </Link>
                <Link
                  href="/admin/catalog"
                  onClick={() => setQuickOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-accent-gold transition-colors"
                >
                  New Category
                </Link>
                <Link
                  href="/admin/media"
                  onClick={() => setQuickOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-accent-gold transition-colors"
                >
                  Upload Media
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon (Direct link to notices workspace) */}
        <Link 
          href="/admin/notifications"
          className="p-2 border border-border bg-background hover:bg-surface-raised text-muted-foreground hover:text-foreground rounded-xl transition duration-150 relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-gold" />
        </Link>

        {/* Theme Toggle Switcher */}
        <ThemeToggle />

        {/* Avatar Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-accent-gold/45 flex items-center justify-center font-bold text-xs text-accent-gold uppercase cursor-pointer transition"
          >
            {adminName ? adminName.substring(0, 2) : "AD"}
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface border border-border shadow-xl p-2.5 space-y-1.5 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-border mb-1">
                  <div className="text-xs font-bold text-foreground">{adminName || "Admin User"}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Platform Controller</div>
                </div>
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-raised hover:text-accent-gold transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50/5 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
