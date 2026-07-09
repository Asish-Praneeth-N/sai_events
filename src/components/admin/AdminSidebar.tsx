"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Sparkles, ChevronLeft, ChevronRight, LayoutDashboard, GitBranch,
  Store, Users, BookOpen, Image, Bell, Settings, User, LogOut,
  Shield, Send, Briefcase, TrendingUp, History
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      group: "Core",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      group: "Workforce & Operations",
      items: [
        { href: "/admin/bookings", label: "Event Cases", icon: GitBranch },
        { href: "/admin/assignments", label: "Event Assignments", icon: Shield },
        { href: "/admin/vendor-invitations", label: "Vendor Invitations", icon: Send },
        { href: "/admin/operational-managers", label: "Operations Team", icon: Briefcase },
        { href: "/admin/vendors", label: "Vendors Registry", icon: Store },
        { href: "/admin/customers", label: "Clients Directory", icon: Users },
        { href: "/admin/catalog", label: "Service Catalog", icon: BookOpen }
      ]
    },
    {
      group: "System & Reports",
      items: [
        { href: "/admin/reports", label: "Analytics & Reports", icon: TrendingUp },
        { href: "/admin/status-history", label: "Audit Trail", icon: History },
        { href: "/admin/media", label: "Media Library", icon: Image },
        { href: "/admin/notifications", label: "Notifications", icon: Bell }
      ]
    },
    {
      group: "Settings",
      items: [
        { href: "/admin/profile", label: "Profile", icon: User }
      ]
    }
  ];

  return (
    <aside 
      className={`bg-[#0d0b08] border-r border-border flex flex-col transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ── Brand Header ── */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap animate-fade-in">
              <span className="text-xs font-black text-foreground tracking-[0.15em] uppercase font-heading">
                Sai Events
              </span>
              <span className="text-[8px] uppercase tracking-[0.22em] text-accent-gold font-light -mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-thin">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {!isCollapsed && (
              <h4 className="text-[9px] uppercase font-bold tracking-[0.22em] text-muted-foreground px-3.5 mb-2">
                {group.group}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                      active
                        ? "text-accent-gold bg-accent-gold/5 font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-accent-gold" : ""}`} />
                    {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Collapse Trigger Button ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-[#0d0b08] hover:bg-surface-raised flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-40"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* ── User Footer Profile Pin ── */}
      <div className="border-t border-border p-3 space-y-2.5">
        <Link 
          href="/admin/profile" 
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-raised transition-colors group overflow-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-accent-gold font-bold text-xs uppercase flex-shrink-0 group-hover:border-accent-gold/40 transition-colors">
            {adminName ? adminName.substring(0, 2) : "AD"}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0 flex-1 animate-fade-in">
              <div className="text-xs font-bold text-foreground truncate">{adminName || "Administrator"}</div>
              <div className="text-[9px] text-muted-foreground truncate mt-0.5">{adminEmail}</div>
            </div>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
