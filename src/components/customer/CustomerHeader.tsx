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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#173d2c]/10 bg-[#f8f2e9]/85 px-4 backdrop-blur-xl transition-all duration-300 dark:border-white/[0.08] dark:bg-[#151712]/85 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center border border-[#173d2c]/10 bg-[#f3eadf]/70 text-[#173d2c]/55 transition duration-150 hover:border-[#a17a34]/30 hover:text-[#173d2c] dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-[#eee5d7]/50 dark:hover:text-[#f0e8db] md:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          onClick={onSearchClick}
          className="group flex h-9 w-9 cursor-pointer items-center justify-center gap-3 border border-[#173d2c]/10 bg-[#f3eadf]/55 px-3 text-left text-[10px] text-[#173d2c]/45 transition-all duration-200 hover:border-[#a17a34]/25 hover:bg-[#173d2c]/[0.025] focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-[#eee5d7]/40 dark:hover:border-[#d2b56b]/25 sm:w-64 sm:justify-start sm:px-4"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0 transition-colors group-hover:text-[#9a742e] dark:group-hover:text-[#d2b56b]" />
          <span className="hidden flex-1 font-light sm:inline">Search planning workspace...</span>
          <kbd className="hidden border border-[#173d2c]/10 bg-transparent px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-[#173d2c]/30 dark:border-white/[0.08] dark:text-white/25 sm:inline-block">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/customer/request"
          className="group flex h-9 items-center gap-2 bg-[#143d2b] px-3.5 text-[#fffaf1] shadow-[0_8px_22px_rgba(20,61,43,0.10)] transition-all duration-300 hover:-translate-y-0.5 dark:bg-[#d2b56b] dark:text-[#161812]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden text-[7.5px] font-bold uppercase tracking-[0.18em] sm:inline">Plan Event</span>
        </Link>

        <Link
          href="/customer/dashboard?tab=notifications"
          className="relative flex h-9 w-9 items-center justify-center border border-[#173d2c]/10 bg-[#f3eadf]/55 text-[#173d2c]/45 transition duration-150 hover:border-[#a17a34]/25 hover:text-[#173d2c] dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-[#eee5d7]/40 dark:hover:text-[#f0e8db]"
          aria-label="View notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#a17a34] dark:bg-[#d2b56b]" />
        </Link>

        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#173d2c]/15 bg-transparent text-[9px] font-bold uppercase tracking-wider text-[#8b6a2e] transition duration-200 hover:border-[#a17a34]/45 dark:border-white/[0.10] dark:text-[#d2b56b] dark:hover:border-[#d2b56b]/45"
          >
            {customerName ? customerName.substring(0, 2) : "CU"}
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-50 mt-2.5 w-56 border border-[#173d2c]/10 bg-[#f8f2e9] p-2 shadow-[0_18px_60px_rgba(20,61,43,0.14)] animate-fade-in dark:border-white/[0.08] dark:bg-[#171914]">
                <div className="mb-1.5 border-b border-[#173d2c]/10 px-3.5 py-3 dark:border-white/[0.08]">
                  <div className="truncate font-heading text-sm font-semibold text-[#173d2c] dark:text-[#f0e8db]">
                    {customerName || "Customer Partner"}
                  </div>
                  <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.22em] text-[#9a742e] dark:text-[#d2b56b]">
                    Private Client
                  </div>
                </div>

                <Link
                  href="/customer/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[10px] font-semibold text-[#173d2c]/70 transition-colors hover:bg-[#173d2c]/[0.035] hover:text-[#9a742e] dark:text-[#eee5d7]/60 dark:hover:bg-white/[0.035] dark:hover:text-[#d2b56b]"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-500/[0.04] dark:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
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