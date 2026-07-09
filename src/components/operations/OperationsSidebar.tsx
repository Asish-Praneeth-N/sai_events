"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateOMAvailability } from "@/app/operations/actions";
import {
  LayoutDashboard, Briefcase, CalendarDays, Clock,
  Bell, UserCircle, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Zap, Target
} from "lucide-react";

interface OperationsSidebarProps {
  fullName: string | null;
  employeeId: string;
  designation: string;
  availabilityStatus: "Available" | "Busy" | "On Leave" | "Training" | "Inactive";
  pendingAssignments: number;
  unreadNotifications: number;
}

const navItems = [
  { href: "/operations/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/operations/assignments", label: "Assignments", icon: Briefcase, badge: "assignments" },
  { href: "/operations/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/operations/schedule", label: "Schedule", icon: Clock },
  { href: "/operations/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
  { href: "/operations/profile", label: "Profile", icon: UserCircle },
];

const availabilityConfig = {
  Available:  { color: "bg-emerald-500", text: "Available",  dot: "bg-emerald-400", border: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  Busy:       { color: "bg-amber-500",   text: "Busy",       dot: "bg-amber-400",   border: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  "On Leave": { color: "bg-blue-500",    text: "On Leave",   dot: "bg-blue-400",    border: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  Training:   { color: "bg-violet-500",  text: "Training",   dot: "bg-violet-400",  border: "border-violet-500/30 text-violet-400 bg-violet-500/10" },
  Inactive:   { color: "bg-zinc-500",    text: "Inactive",   dot: "bg-zinc-400",    border: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10" },
};

export default function OperationsSidebar({
  fullName,
  employeeId,
  designation,
  availabilityStatus,
  pendingAssignments,
  unreadNotifications,
}: OperationsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [availability, setAvailability] = useState(availabilityStatus);
  const [updatingAvail, setUpdatingAvail] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initials = (fullName || "OM")
    .split(" ").slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("");

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const getBadgeCount = (badge?: string) => {
    if (badge === "assignments") return pendingAssignments;
    if (badge === "notifications") return unreadNotifications;
    return 0;
  };

  const handleAvailability = async (state: typeof availability) => {
    setUpdatingAvail(true);
    setAvailability(state);
    try { await updateOMAvailability(state); }
    catch (_) {}
    finally { setUpdatingAvail(false); }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const avail = availabilityConfig[availability];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${isMobile ? "" : "overflow-hidden"}`}>

      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/40">
        <div className={`flex items-center gap-3 min-w-0 ${collapsed && !isMobile ? "justify-center w-full" : ""}`}>
          {/* OM Avatar with execution-blue ring */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-black text-xs font-bold shrink-0 shadow-md shadow-[#D4AF37]/20 ring-1 ring-[#D4AF37]/30">
            {initials}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {fullName || "Operational Manager"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
                <span className="text-[9px] text-muted-foreground font-mono">{avail.text}</span>
              </div>
            </div>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised transition cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* ── Employee Badge ── */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-accent-gold/8 text-accent-gold border border-accent-gold/20">
              <Target className="w-3 h-3" />
              {designation}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground">{employeeId}</span>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          const badgeCount = getBadgeCount(item.badge);
          const showBadge = badgeCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                active
                  ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              } ${collapsed && !isMobile ? "justify-center" : ""}`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent-gold rounded-r-full" />
              )}
              <div className="relative shrink-0">
                <Icon className={`w-4 h-4 ${active ? "text-accent-gold" : "text-zinc-500 group-hover:text-foreground"}`} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center border border-background">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {showBadge && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold rounded-lg border border-red-500/20">
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Availability Toggle ── */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-3 border-t border-border/40 space-y-2">
          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider px-1">Availability</p>
          <div className="grid grid-cols-2 gap-1">
            {(["Available", "Busy", "On Leave", "Training"] as const).map((state) => (
              <button
                key={state}
                disabled={updatingAvail}
                onClick={() => handleAvailability(state)}
                className={`py-1.5 px-1 rounded-lg text-[8.5px] font-bold uppercase tracking-wider transition cursor-pointer truncate ${
                  availability === state
                    ? availabilityConfig[state].border + " border"
                    : "bg-transparent border border-border/30 text-muted-foreground hover:bg-surface-raised"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sign Out ── */}
      <div className={`px-2 pb-4 border-t border-border/40 pt-2 ${collapsed && !isMobile ? "flex justify-center" : ""}`}>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={`flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-xs text-muted-foreground hover:text-red-400 hover:bg-red-950/10 transition cursor-pointer ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>{signingOut ? "Signing out…" : "Sign Out"}</span>}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col bg-surface border-r border-border/60 transition-all duration-300 shrink-0 h-screen sticky top-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE: Top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-black text-[10px] font-bold shadow">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-foreground truncate max-w-[160px] block">{fullName}</span>
            <span className="text-[8px] text-muted-foreground font-mono">{designation}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications > 0 && (
            <Link href="/operations/notifications" className="relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-surface-raised border border-border/60 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 h-full bg-surface border-r border-border/60 flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent isMobile />
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border/60 flex items-center justify-around px-2 h-16">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          const badgeCount = getBadgeCount(item.badge);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 ${
                active ? "text-accent-gold" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent-gold rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
