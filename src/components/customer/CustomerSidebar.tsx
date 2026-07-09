"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Sparkles, LayoutDashboard, Calendar, Compass, FileText, 
  Video, Bell, User, HeartHandshake, LogOut, X 
} from "lucide-react";

interface CustomerSidebarProps {
  customerName: string;
  customerEmail: string;
  onClose?: () => void;
}

export default function CustomerSidebar({ customerName, customerEmail, onClose }: CustomerSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const currentTab = searchParams.get("tab") || "overview";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isActive = (href: string, tabKey?: string) => {
    if (tabKey) {
      return pathname === href && currentTab === tabKey;
    }
    return pathname === href;
  };

  const navItems = [
    { href: "/customer/dashboard", tab: "overview", label: "Overview", icon: LayoutDashboard },
    { href: "/customer/dashboard", tab: "events", label: "My Events", icon: Calendar },
    { href: "/customer/dashboard", tab: "journey", label: "Event Journey", icon: Compass },
    { href: "/customer/dashboard", tab: "documents", label: "Documents", icon: FileText },
    { href: "/customer/dashboard", tab: "meetings", label: "Meetings", icon: Video },
    { href: "/customer/dashboard", tab: "notifications", label: "Notifications", icon: Bell },
    { href: "/customer/profile", label: "Profile", icon: User },
    { href: "/customer/dashboard", tab: "support", label: "Support", icon: HeartHandshake }
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between select-none h-full relative z-30 transition-all duration-300 shrink-0">
      <div>
        {/* ── Brand Header ── */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <Link href="/customer/dashboard" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center shadow-lg shadow-[#D4AF37]/15 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col whitespace-nowrap animate-fade-in">
              <span className="text-xs font-black text-foreground tracking-[0.18em] uppercase font-heading">
                Sai Events
              </span>
              <span className="text-[7.5px] uppercase tracking-[0.25em] text-accent-gold font-light -mt-0.5">
                Planning Studio
              </span>
            </div>
          </Link>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-raised cursor-pointer md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Navigation Items ── */}
        <nav className="px-4 py-8 space-y-2">
          <div className="text-[8.5px] uppercase font-bold tracking-[0.25em] text-muted-foreground/60 px-4 mb-4">
            Concierge Services
          </div>
          <div className="space-y-1.5">
            {navItems.map((item, idx) => {
              const active = isActive(item.href, item.tab);
              const linkUrl = item.tab ? `${item.href}?tab=${item.tab}` : item.href;
              return (
                <Link
                  key={idx}
                  href={linkUrl}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-xs font-medium tracking-wide transition-all duration-200 group ${
                    active
                      ? "text-accent-gold bg-accent-gold/[0.04] border border-accent-gold/20 font-bold shadow-[0_0_12px_rgba(212,175,55,0.03)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-transparent"
                  }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${active ? "text-accent-gold" : ""}`} />
                  <span className="animate-fade-in">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── User Footer Profile Pin ── */}
      <div className="border-t border-border p-4 space-y-3">
        <Link 
          href="/customer/profile" 
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface-raised transition-all duration-250 border border-transparent hover:border-border/40 group overflow-hidden"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-gold font-bold text-xs uppercase flex-shrink-0 group-hover:border-accent-gold/30 transition-colors">
            {customerName ? customerName.substring(0, 2) : "CU"}
          </div>
          <div className="text-left min-w-0 flex-1 animate-fade-in">
            <div className="text-xs font-bold text-foreground truncate">{customerName || "Customer Partner"}</div>
            <div className="text-[8.5px] text-muted-foreground truncate mt-0.5">{customerEmail}</div>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="animate-fade-in">Logout</span>
        </button>
      </div>
    </aside>
  );
}
