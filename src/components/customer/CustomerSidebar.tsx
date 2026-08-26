"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  FileText,
  Video,
  Bell,
  User,
  FolderHeart,
  HeartHandshake,
  LogOut,
  X,
  HelpCircle,
} from "lucide-react";

interface CustomerSidebarProps {
  customerName: string;
  customerEmail: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

function CustomerSidebarInner({
  customerName,
  customerEmail,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
  onClose,
}: CustomerSidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  // Use controlled collapse state if provided, otherwise internal state
  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalIsCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalIsCollapsed((prev) => !prev));

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
    { href: "/customer/dashboard", tab: "enquiries", label: "My Enquiries", icon: HelpCircle },
    { href: "/customer/dashboard", tab: "media", label: "Media", icon: FolderHeart },
    { href: "/customer/dashboard", tab: "meetings", label: "Meetings", icon: Video },
    { href: "/customer/dashboard", tab: "notifications", label: "Notifications", icon: Bell },
    { href: "/customer/profile", label: "Profile", icon: User },
  ];

  return (
    <aside
      className={`relative z-30 flex h-full shrink-0 select-none flex-col justify-between border-r border-[#173d2c]/10 bg-[#f2e9dc] transition-[width] duration-300 ease-out dark:border-white/[0.08] dark:bg-[#141612] ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ── Edge Chevron Collapse/Expand Button (Not clipped) ── */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute -right-[13px] top-[72px] z-40 hidden md:flex h-[26px] w-[26px] items-center justify-center border border-[#173d2c]/15 bg-[#f2e9dc] text-[#173d2c]/70 shadow-md transition-all duration-200 hover:border-[#a17a34]/50 hover:bg-[#a17a34]/10 hover:text-[#9a742e] dark:border-white/[0.15] dark:bg-[#141612] dark:text-white/70 dark:hover:text-[#d2b56b] cursor-pointer"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex flex-col flex-1 min-h-0">
        {/* ── Brand Header ── */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] ${
            isCollapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          <Link
            href="/customer/dashboard"
            className={`group flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#a17a34]/30 bg-transparent transition-transform duration-300 group-hover:rotate-3 dark:border-[#d2b56b]/30">
              <span className="absolute inset-[3px] border border-[#173d2c]/10 dark:border-white/[0.08]" />
              <Sparkles className="relative z-10 h-3.5 w-3.5 text-[#9a742e] dark:text-[#d2b56b]" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap min-w-0 animate-fade-in">
                <span
                  className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[#173d2c] dark:text-[#f0e8db]"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  Sai Events
                </span>
                <span className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.28em] text-[#9a742e] dark:text-[#d2b56b]">
                  Planning Studio
                </span>
              </div>
            )}
          </Link>

          {onClose && !isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-1.5 text-[#173d2c]/60 transition hover:bg-[#173d2c]/[0.05] hover:text-[#173d2c] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-[#f0e8db] md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Navigation List (Internal Scrollable Area) ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scrollbar-none ${isCollapsed ? "px-2 py-4" : "px-3 py-5"}`}>
          {!isCollapsed ? (
            <div className="mb-4 flex items-center gap-3 px-3">
              <span className="text-[6.5px] font-bold uppercase tracking-[0.25em] text-[#173d2c]/35 dark:text-[#eee5d7]/30">
                Concierge Services
              </span>
              <span className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.08]" />
            </div>
          ) : (
            <div className="mx-auto mb-4 h-px w-6 bg-[#173d2c]/10 dark:bg-white/[0.08]" />
          )}

          <div className="space-y-1">
            {navItems.map((item, idx) => {
              const active = isActive(item.href, item.tab);
              const linkUrl = item.tab ? `${item.href}?tab=${item.tab}` : item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={idx}
                  href={linkUrl}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={`group/item relative flex items-center transition-all duration-200 ${
                    isCollapsed ? "h-10 justify-center px-2" : "px-3 py-2.5 text-[10px] font-medium tracking-wide gap-3"
                  } ${
                    active
                      ? "bg-[#173d2c]/[0.06] font-semibold text-[#173d2c] dark:bg-white/[0.05] dark:text-[#f0e8db]"
                      : "border border-transparent text-[#173d2c]/55 hover:bg-[#173d2c]/[0.03] hover:text-[#173d2c] dark:text-[#eee5d7]/45 dark:hover:bg-white/[0.03] dark:hover:text-[#f0e8db]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-[2.5px] bg-[#a17a34] dark:bg-[#d2b56b]" />
                  )}

                  <Icon
                    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-105 ${
                      active ? "text-[#9a742e] dark:text-[#d2b56b]" : "text-[#173d2c]/50 dark:text-[#eee5d7]/45"
                    }`}
                  />

                  {!isCollapsed && <span className="animate-fade-in truncate text-[10px]">{item.label}</span>}

                  {active && !isCollapsed && (
                    <span className="ml-auto h-1 w-1 rotate-45 bg-[#a17a34]/80 dark:bg-[#d2b56b]/80" />
                  )}

                  {/* Sleek Floating Tooltip on Collapsed Hover */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap border border-[#173d2c]/10 bg-[#f2e9dc] px-3 py-2 text-[9.5px] font-semibold text-[#173d2c] opacity-0 shadow-xl transition-opacity duration-150 group-hover/item:opacity-100 dark:border-white/[0.08] dark:bg-[#141612] dark:text-[#f0e8db]">
                      {item.label}
                      <span className="absolute right-full top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1 rotate-45 border-b border-l border-[#173d2c]/10 bg-[#f2e9dc] dark:border-white/[0.08] dark:bg-[#141612]" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Footer Profile & Logout ── */}
      <div className={`shrink-0 border-t border-[#173d2c]/10 dark:border-white/[0.08] ${isCollapsed ? "p-2" : "p-3"}`}>
        {!isCollapsed && (
          <div className="mb-2 px-3 pt-1">
            <span className="text-[6px] font-bold uppercase tracking-[0.24em] text-[#a17a34]/70 dark:text-[#d2b56b]/65">
              Private Client
            </span>
          </div>
        )}

        <Link
          href="/customer/profile"
          onClick={onClose}
          title={isCollapsed ? customerName || "Private Client" : undefined}
          className={`group/profile relative flex items-center border border-transparent transition-all duration-200 hover:border-[#173d2c]/10 hover:bg-[#173d2c]/[0.025] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.025] ${
            isCollapsed ? "justify-center py-2" : "gap-3 p-2.5"
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#173d2c]/15 bg-transparent text-[9px] font-bold uppercase tracking-wider text-[#8b6a2e] transition-colors group-hover/profile:border-[#a17a34]/35 dark:border-white/[0.10] dark:text-[#d2b56b]">
            {customerName ? customerName.substring(0, 2) : "CU"}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 text-left animate-fade-in">
              <div
                className="truncate font-heading text-[11px] font-semibold text-[#173d2c] dark:text-[#f0e8db]"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                {customerName || "Customer Partner"}
              </div>
              <div className="mt-0.5 truncate text-[7.5px] text-[#173d2c]/40 dark:text-[#eee5d7]/35">
                {customerEmail}
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap border border-[#173d2c]/10 bg-[#f2e9dc] px-3 py-2 text-[9.5px] font-semibold text-[#173d2c] opacity-0 shadow-xl transition-opacity duration-150 group-hover/profile:opacity-100 dark:border-white/[0.08] dark:bg-[#141612] dark:text-[#f0e8db]">
              {customerName || "Customer Partner"}
              <span className="absolute right-full top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1 rotate-45 border-b border-l border-[#173d2c]/10 bg-[#f2e9dc] dark:border-white/[0.08] dark:bg-[#141612]" />
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`group/logout mt-1 flex w-full cursor-pointer items-center text-[9px] font-semibold text-red-600/80 transition-all duration-200 hover:bg-red-500/[0.035] hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-400 ${
            isCollapsed ? "h-9 justify-center" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
          {!isCollapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default function CustomerSidebar(props: CustomerSidebarProps) {
  return (
    <Suspense fallback={null}>
      <CustomerSidebarInner {...props} />
    </Suspense>
  );
}