"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox, Briefcase, Calendar, Clock, CheckCircle2, AlertCircle,
  ArrowRight, MapPin, Users, ChevronRight, Activity, Check, X,
  Zap, TrendingUp, Star, Image, User
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { respondToAssignment } from "@/app/vendor/inbox/actions";

interface Assignment {
  id: string;
  status: string;
  created_at: string;
  category_id: string;
  categories: { name: string } | null;
  event_requests: {
    id: string;
    event_type: string;
    event_date: string;
    location: string;
    guest_count: number;
    total_budget: number;
    event_assignments: {
      id: string;
      profiles: { full_name: string; phone_number: string; email: string } | null;
    }[];
    request_items: {
      quantity: number;
      unit_price: number;
      service_items: { name: string } | null;
    }[];
  } | null;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: string;
}

interface VendorCommandCenterProps {
  profile: {
    id: string;
    full_name: string;
    business_name: string | null;
    address: string | null;
    status: string;
    email: string;
    created_at: string;
    availability_status: string;
  };
  categories: string[];
  assignments: Assignment[];
  notifications: Notification[];
  portfolioCount: number;
}

function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Completed", urgent: false };
  if (diff === 0) return { label: "Today!", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: true };
  return { label: `${diff}d`, urgent: diff <= 7 };
}

// Minimal inline calendar for the dashboard
function MiniCalendar({ assignments }: { assignments: Assignment[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const eventDates = new Set(
    assignments
      .filter((a) => a.status === "Approved" || a.status === "Accepted")
      .map((a) => a.event_requests?.event_date)
      .filter(Boolean)
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer">‹</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{monthName}</span>
        <button onClick={nextMonth} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[8px] font-bold text-muted-foreground uppercase">{d}</span>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <span key={idx} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const hasEvent = eventDates.has(dateStr);
          return (
            <span
              key={idx}
              className={`text-[10px] py-1 rounded-lg font-mono relative ${
                isToday
                  ? "bg-accent-gold text-black font-bold"
                  : hasEvent
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground pt-1 border-t border-border/30">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-accent-gold inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/40 border border-emerald-500/30 inline-block" /> Event</span>
      </div>
    </div>
  );
}

export default function VendorCommandCenter({
  profile,
  categories,
  assignments,
  notifications,
  portfolioCount,
}: VendorCommandCenterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === "Pending").length;
    const approved = assignments.filter((a) => a.status === "Approved").length;
    const accepted = assignments.filter((a) => a.status === "Accepted").length;
    const acceptanceRate = total === 0 ? 100 : Math.round(((accepted + approved) / total) * 100);

    const profileFields = [profile.business_name, profile.address].filter(Boolean).length;
    const profileStrength = Math.round(((profileFields + (categories.length > 0 ? 1 : 0)) / 3) * 100);

    // Today's events
    const todayStr = new Date().toISOString().split("T")[0];
    const todayEvents = assignments.filter(
      (a) => a.event_requests?.event_date === todayStr && a.status === "Approved"
    );

    // Upcoming (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = assignments.filter((a) => {
      const d = a.event_requests?.event_date;
      if (!d || a.status !== "Approved") return false;
      const dt = new Date(d);
      return dt > new Date() && dt <= nextWeek;
    });

    return { total, pending, approved, accepted, acceptanceRate, profileStrength, todayEvents, upcoming };
  }, [assignments, profile, categories]);

  const pendingLeads = useMemo(() => assignments.filter((a) => a.status === "Pending").slice(0, 3), [assignments]);
  const activeProjects = useMemo(() => assignments.filter((a) => a.status === "Approved").slice(0, 4), [assignments]);

  const executeAction = async (id: string, accept: boolean) => {
    setActionLoadingId(id);
    setConfirmingId(null);
    setError(null);
    startTransition(async () => {
      try {
        await respondToAssignment(id, accept);
        setSuccess(accept ? "Lead accepted — awaiting Admin confirmation." : "Lead declined.");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to respond.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in select-none">

      {/* ── Alert Toasts ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/40 text-red-400 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── ZONE 1: Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">
            {profile.business_name || profile.full_name}
          </h1>
        </div>
        {stats.todayEvents.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/8 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {stats.todayEvents.length} Event{stats.todayEvents.length > 1 ? "s" : ""} Today
          </div>
        )}
      </div>

      {/* ── ZONE 2: Attention Banner — Pending Invitations ── */}
      {stats.pending > 0 && (
        <div className="p-4 bg-accent-gold/5 border border-accent-gold/25 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4 text-accent-gold animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {stats.pending} invitation{stats.pending > 1 ? "s" : ""} awaiting your decision
              </p>
              <p className="text-[10px] text-muted-foreground font-light mt-0.5">Respond to leads below or visit the Invitations page</p>
            </div>
          </div>
          <a
            href="/vendor/inbox"
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-gold hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ── ZONE 3: KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Invitations", value: stats.pending, icon: Inbox, color: stats.pending > 0 ? "text-amber-400" : "text-muted-foreground", href: "/vendor/inbox" },
          { label: "Active", value: stats.approved, icon: Briefcase, color: "text-emerald-400", href: "/vendor/bookings" },
          { label: "This Week", value: stats.upcoming.length, icon: Calendar, color: "text-blue-400", href: "/vendor/calendar" },
          { label: "Portfolio", value: portfolioCount, icon: Image, color: "text-purple-400", href: "/vendor/profile" },
          { label: "Profile", value: `${stats.profileStrength}%`, icon: User, color: "text-foreground", href: "/vendor/profile" },
          { label: "Acceptance", value: `${stats.acceptanceRate}%`, icon: TrendingUp, color: "text-accent-gold", href: "/vendor/bookings" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <a
              key={kpi.label}
              href={kpi.href}
              className="p-3.5 bg-surface border border-border/70 rounded-2xl hover:border-accent-gold/20 transition group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8.5px] uppercase tracking-wider font-bold text-muted-foreground">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</span>
            </a>
          );
        })}
      </div>

      {/* ── ZONE 4: Two-Column Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* Left: Invitations + Active Assignments */}
        <div className="xl:col-span-8 space-y-6">

          {/* ── Pending Invitations ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Pending Invitations</h2>
                {stats.pending > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded border border-amber-500/20">
                    {stats.pending}
                  </span>
                )}
              </div>
              {stats.pending > 3 && (
                <a href="/vendor/inbox" className="text-[10px] text-accent-gold font-bold hover:underline flex items-center gap-1">
                  All <ChevronRight className="w-3 h-3" />
                </a>
              )}
            </div>

            {pendingLeads.length > 0 ? (
              <div className="space-y-3">
                {pendingLeads.map((lead) => {
                  const req = lead.event_requests;
                  if (!req) return null;
                  const isLoading = actionLoadingId === lead.id;
                  const isConfirming = confirmingId?.id === lead.id;
                  const countdown = getDaysUntil(req.event_date);

                  return (
                    <div
                      key={lead.id}
                      className="relative bg-surface border border-border/70 rounded-2xl overflow-hidden hover:border-accent-gold/25 transition-all duration-200 shadow-sm"
                    >
                      {/* Left accent strip */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-gold to-amber-500" />

                      <div className="pl-5 pr-4 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[8.5px] uppercase tracking-wider font-bold text-accent-gold bg-accent-gold/8 border border-accent-gold/20 px-2 py-0.5 rounded-lg">
                                {lead.categories?.name}
                              </span>
                              <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-lg border ${
                                countdown.urgent
                                  ? "bg-red-500/8 text-red-400 border-red-500/20"
                                  : "bg-background text-muted-foreground border-border/40"
                              }`}>
                                {countdown.label}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground leading-tight">{req.event_type}</h3>
                            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-mono">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-accent-gold" />{req.event_date}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent-gold" />{req.location.split(",")[0]}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-accent-gold" />{req.guest_count} guests</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-start">
                            {isLoading ? (
                              <span className="text-[10px] text-muted-foreground font-mono">Processing...</span>
                            ) : isConfirming ? (
                              <div className="flex items-center gap-1.5 animate-scale-in">
                                <span className="text-[9px] text-muted-foreground font-bold uppercase pr-1">
                                  {confirmingId?.action === "accept" ? "Accept?" : "Decline?"}
                                </span>
                                <button
                                  onClick={() => setConfirmingId(null)}
                                  className="px-2.5 py-1.5 text-[9px] font-bold border border-border rounded-lg text-muted-foreground cursor-pointer"
                                >No</button>
                                <button
                                  onClick={() => executeAction(lead.id, confirmingId!.action === "accept")}
                                  className={`px-2.5 py-1.5 text-[9px] font-bold text-white rounded-lg cursor-pointer ${
                                    confirmingId?.action === "accept"
                                      ? "bg-emerald-600"
                                      : "bg-red-600"
                                  }`}
                                >Yes</button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmingId({ id: lead.id, action: "reject" })}
                                  className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground border border-border/70 hover:border-red-900/30 hover:text-red-400 rounded-xl transition cursor-pointer"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => setConfirmingId({ id: lead.id, action: "accept" })}
                                  className="px-3.5 py-1.5 text-[10px] font-bold text-black bg-gradient-to-r from-accent-gold to-amber-500 rounded-xl shadow-sm cursor-pointer"
                                >
                                  Accept
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-border/60 rounded-2xl bg-surface/30">
                <Inbox className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-light">No pending invitations. New leads will appear here.</p>
              </div>
            )}
          </section>

          {/* ── Active Assignments ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Active Assignments</h2>
                {stats.approved > 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/20">
                    {stats.approved}
                  </span>
                )}
              </div>
              {stats.approved > 4 && (
                <a href="/vendor/bookings" className="text-[10px] text-accent-gold font-bold hover:underline flex items-center gap-1">
                  All <ChevronRight className="w-3 h-3" />
                </a>
              )}
            </div>

            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeProjects.map((project) => {
                  const req = project.event_requests;
                  if (!req) return null;
                  const om = req.event_assignments?.[0]?.profiles;
                  const countdown = getDaysUntil(req.event_date);

                  return (
                    <div
                      key={project.id}
                      className="bg-surface border border-border/70 rounded-2xl p-4 hover:border-accent-gold/20 transition shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[8.5px] font-bold uppercase tracking-wider text-accent-gold">{project.categories?.name}</span>
                          <h4 className="text-sm font-bold text-foreground mt-0.5 truncate">{req.event_type}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{req.event_date}</p>
                        </div>
                        <span className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg border ${
                          countdown.urgent
                            ? "bg-red-500/8 text-red-400 border-red-500/20"
                            : "bg-emerald-500/8 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {countdown.label}
                        </span>
                      </div>

                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono">
                        <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
                        <span className="truncate">{req.location}</span>
                      </div>

                      {om && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                          <div className="w-5 h-5 rounded-lg bg-background border border-border flex items-center justify-center text-accent-gold text-[8px] font-bold shrink-0">
                            {om.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate">{om.full_name}</span>
                        </div>
                      )}

                      <a
                        href={`/vendor/bookings/${project.id}`}
                        className="flex items-center justify-between w-full px-3 py-2 bg-background border border-border/60 hover:border-accent-gold/30 rounded-xl text-[10px] font-bold text-foreground transition group"
                      >
                        Open Workspace
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transition" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-border/60 rounded-2xl bg-surface/30">
                <Briefcase className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-light">No active assignments yet. Accept leads to get started.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right: Calendar + Activity + Quick Actions */}
        <div className="xl:col-span-4 space-y-5">

          {/* ── Mini Calendar ── */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-3">Schedule</h3>
            <MiniCalendar assignments={assignments} />
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5 space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Invitations", href: "/vendor/inbox", icon: Inbox },
                { label: "Calendar", href: "/vendor/calendar", icon: Calendar },
                { label: "Services", href: "/vendor/services", icon: "🛠️", isEmoji: true },
                { label: "Profile", href: "/vendor/profile", icon: User },
              ].map((qa) => {
                const Icon = !qa.isEmoji ? (qa.icon as React.ElementType) : null;
                return (
                  <a
                    key={qa.label}
                    href={qa.href}
                    className="flex flex-col items-center gap-1.5 p-3 bg-background border border-border/60 hover:border-accent-gold/30 hover:bg-surface-raised rounded-xl transition text-center"
                  >
                    {qa.isEmoji ? (
                      <span className="text-lg">{qa.icon as string}</span>
                    ) : (
                      Icon && <Icon className="w-4 h-4 text-accent-gold" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{qa.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Activity Feed ── */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Activity Feed</h3>
            {notifications.length > 0 ? (
              <div className="space-y-3 relative">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/50" />
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex gap-3 pl-5 relative">
                    <span className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                      notif.status === "Delivered" ? "bg-accent-gold" : "bg-border"
                    }`} />
                    <div>
                      <p className="text-[10.5px] text-foreground/80 font-light leading-normal">{notif.message}</p>
                      <span className="text-[9px] text-muted-foreground font-mono">{formatDate(notif.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-4 font-light">No recent activity.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
