"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Calendar, Clock, CheckSquare, AlertTriangle,
  ChevronRight, ChevronLeft, MapPin, Users, ArrowRight,
  Activity, Bell, TrendingUp, Zap, Target, Star,
  CheckCircle2, AlertCircle, X
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  status: string;
  escalation_level: number;
  escalation_reason: string | null;
  expected_completion: string | null;
  handover_notes: string | null;
  created_at: string;
  updated_at: string;
  event_requests: {
    id: string;
    event_type: string;
    event_date: string;
    location: string;
    guest_count: number;
    total_budget: number;
    status: string;
    profiles: { full_name: string; phone_number: string; email: string } | null;
  } | null;
}

interface OMCommandCenterProps {
  profile: { id: string; full_name: string; email: string; phone_number: string };
  omData: {
    employee_id: string;
    designation: string;
    availability_status: string;
    employment_status: string;
    assigned_regions: string[];
    assigned_cities: string[];
    performance_score: number;
    completion_rate: number;
    current_workload: number;
    joining_date: string;
  };
  assignments: Assignment[];
  notifications: { id: string; message: string; created_at: string; status: string }[];
  pendingChecklistCount: number;
}

function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Completed", urgent: false, past: true, days: diff };
  if (diff === 0) return { label: "TODAY", urgent: true, past: false, days: 0 };
  if (diff === 1) return { label: "Tomorrow", urgent: true, past: false, days: 1 };
  if (diff <= 7) return { label: `${diff} days`, urgent: true, past: false, days: diff };
  return { label: `${diff} days`, urgent: false, past: false, days: diff };
}

function getStatusConfig(status: string) {
  switch (status) {
    case "Assigned":     return { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/25",   label: "Awaiting Acceptance" };
    case "Accepted":     return { color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/25",     label: "Accepted" };
    case "Execution Started": return { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/25", label: "In Execution" };
    case "Execution Complete": return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", label: "Complete" };
    case "Closed":       return { color: "text-zinc-400",    bg: "bg-zinc-500/10 border-zinc-500/25",     label: "Closed" };
    default:             return { color: "text-muted-foreground", bg: "bg-muted border-border",           label: status };
  }
}

function MiniCalendar({ assignments }: { assignments: Assignment[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const eventDates = useMemo(() => {
    const dates: Record<string, string> = {};
    assignments.forEach((a) => {
      const d = a.event_requests?.event_date;
      if (d) dates[d] = a.status;
    });
    return dates;
  }, [assignments]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground font-mono">{monthName}</span>
        <button onClick={next} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[8.5px] font-bold text-muted-foreground uppercase py-1">{d}</span>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <span key={idx} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const eventStatus = eventDates[dateStr];
          return (
            <span key={idx} className={`text-[10px] py-1.5 rounded-lg font-mono flex items-center justify-center transition-all ${
              isToday ? "bg-accent-gold text-black font-black shadow-lg shadow-accent-gold/30"
              : eventStatus === "Execution Started" ? "bg-violet-500/15 text-violet-400 font-extrabold border border-violet-500/30"
              : eventStatus === "Accepted" ? "bg-blue-500/15 text-blue-400 font-extrabold border border-blue-500/30"
              : eventStatus ? "bg-accent-gold/10 text-accent-gold font-bold border border-accent-gold/25"
              : "text-muted-foreground hover:bg-surface-raised"
            }`}>{day}</span>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[7.5px] uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/40">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />Today</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />In Progress</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Accepted</span>
      </div>
    </div>
  );
}

export default function OMCommandCenter({ profile, omData, assignments, notifications, pendingChecklistCount }: OMCommandCenterProps) {
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAssignments = assignments.filter(a => a.event_requests?.event_date === todayStr);
    const active = assignments.filter(a => ["Assigned", "Accepted", "Execution Started"].includes(a.status));
    const pending = assignments.filter(a => a.status === "Assigned");
    const inExecution = assignments.filter(a => a.status === "Execution Started");
    const completed = assignments.filter(a => ["Execution Complete", "Closed"].includes(a.status));
    const escalated = assignments.filter(a => a.escalation_level > 0);

    const now = new Date();
    const thisMonthCompleted = completed.filter(a => {
      const d = new Date(a.updated_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const upcoming7 = assignments.filter(a => {
      const d = a.event_requests?.event_date;
      if (!d || !["Accepted", "Assigned", "Execution Started"].includes(a.status)) return false;
      const dt = new Date(d + "T00:00:00");
      const diff = Math.ceil((dt.getTime() - now.getTime()) / 86400000);
      return diff >= 0 && diff <= 7;
    }).sort((a, b) => new Date(a.event_requests!.event_date).getTime() - new Date(b.event_requests!.event_date).getTime());

    return { todayAssignments, active, pending, inExecution, completed, escalated, thisMonthCompleted, upcoming7 };
  }, [assignments]);

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile.full_name?.split(" ")[0] || "Manager";

  const hasEscalations = stats.escalated.length > 0;
  const hasPendingAcceptance = stats.pending.length > 0;

  return (
    <div className="space-y-8 animate-fade-in select-none max-w-7xl mx-auto pb-12">

      {/* ── Escalation Alert Banner ── */}
      {hasEscalations && !dismissedAlert && (
        <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-500/30 rounded-2xl animate-scale-in">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-red-400">Active Escalation — </span>
            <span className="text-xs text-red-300/80">{stats.escalated.length} assignment{stats.escalated.length > 1 ? "s" : ""} flagged. Admin has been notified.</span>
          </div>
          <Link href="/operations/assignments" className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider shrink-0">Review</Link>
          <button onClick={() => setDismissedAlert(true)} className="text-red-500/60 hover:text-red-400 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-1">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{greeting}, {firstName}</p>
          <h1 className="text-3xl font-light font-heading text-foreground tracking-tight">Execution Center</h1>
          <p className="text-xs text-muted-foreground font-light">{omData.designation} · {omData.employee_id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Operations Live</span>
        </div>
      </div>

      {/* ── Today's Briefing Hero ── */}
      <div className="relative rounded-[28px] border border-border/80 bg-surface/60 overflow-hidden p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-gradient-to-bl from-accent-gold/6 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[60%] bg-gradient-to-tr from-violet-500/4 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Today's mission */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-accent-gold">Today's Mission</span>
              <h2 className="text-2xl font-light font-heading text-foreground leading-snug">
                {stats.todayAssignments.length > 0
                  ? `${stats.todayAssignments.length} Event${stats.todayAssignments.length > 1 ? "s" : ""} in Execution Today`
                  : stats.inExecution.length > 0
                  ? `${stats.inExecution.length} Active Execution${stats.inExecution.length > 1 ? "s" : ""} Underway`
                  : hasPendingAcceptance
                  ? `${stats.pending.length} Assignment${stats.pending.length > 1 ? "s" : ""} Awaiting Acceptance`
                  : "No Events Scheduled Today"}
              </h2>
              <p className="text-xs text-muted-foreground font-light">
                {stats.upcoming7.length > 0
                  ? `${stats.upcoming7.length} upcoming event${stats.upcoming7.length > 1 ? "s" : ""} in the next 7 days.`
                  : "No upcoming events this week."}
              </p>
            </div>

            {/* Today's events */}
            {stats.todayAssignments.length > 0 && (
              <div className="space-y-2">
                {stats.todayAssignments.slice(0, 2).map(a => {
                  const req = a.event_requests;
                  if (!req) return null;
                  const sc = getStatusConfig(a.status);
                  return (
                    <Link key={a.id} href={`/operations/assignments/${a.id}`}
                      className="flex items-center gap-3 p-3 bg-background/60 border border-border/60 hover:border-accent-gold/30 rounded-2xl transition group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-accent-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{req.event_type}</p>
                        <p className="text-[10px] text-muted-foreground truncate"><MapPin className="w-2.5 h-2.5 inline mr-1" />{req.location.split(",")[0]}</p>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${sc.bg} ${sc.color} shrink-0`}>{sc.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transition" />
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link href="/operations/assignments"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-gold text-black text-[11px] font-bold rounded-xl shadow-md shadow-accent-gold/20 hover:brightness-110 transition cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" /> View All Assignments
              </Link>
              <Link href="/operations/calendar"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border/60 hover:border-accent-gold/30 text-foreground text-[11px] font-bold rounded-xl transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" /> Calendar
              </Link>
            </div>
          </div>

          {/* Right: Health scores */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-background/30 border border-border/50 rounded-2xl backdrop-blur-sm">
            {[
              { label: "Active Cases", value: stats.active.length, icon: Briefcase, color: "text-accent-gold" },
              { label: "In Execution", value: stats.inExecution.length, icon: Zap, color: "text-violet-400" },
              { label: "Completed", value: stats.completed.length, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Escalations", value: stats.escalated.length, icon: AlertTriangle, color: stats.escalated.length > 0 ? "text-red-400" : "text-muted-foreground" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col gap-2 p-3 bg-background/50 border border-border/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">{item.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className={`text-2xl font-light font-heading ${item.color}`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── KPI Stat Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "This Month Done", value: stats.thisMonthCompleted.length, icon: TrendingUp, sub: "Completed events", accent: "emerald" },
          { label: "Pending Checklist", value: pendingChecklistCount, icon: CheckSquare, sub: "Items remaining", accent: pendingChecklistCount > 0 ? "amber" : "emerald" },
          { label: "Performance", value: `${(omData.performance_score || 5).toFixed(1)}/10`, icon: Star, sub: "Overall score", accent: "gold" },
          { label: "Completion Rate", value: `${Math.round(omData.completion_rate || 100)}%`, icon: Target, sub: "Event delivery", accent: "blue" },
        ].map((widget, i) => {
          const Icon = widget.icon;
          const accentMap: Record<string, string> = {
            emerald: "text-emerald-400", amber: "text-amber-400",
            gold: "text-accent-gold", blue: "text-blue-400"
          };
          return (
            <div key={i} className="p-5 bg-surface border border-border/60 hover:border-accent-gold/20 rounded-2xl transition-all duration-300 shadow-sm space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">{widget.label}</span>
                <Icon className={`w-3.5 h-3.5 ${accentMap[widget.accent]}`} />
              </div>
              <div className={`text-2xl font-light font-heading ${accentMap[widget.accent]}`}>{widget.value}</div>
              <p className="text-[9.5px] text-muted-foreground font-light">{widget.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* Left: Upcoming assignments */}
        <div className="xl:col-span-8 space-y-6">

          {/* Pending acceptance */}
          {stats.pending.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Awaiting Your Acceptance</h3>
              </div>
              <div className="space-y-3">
                {stats.pending.slice(0, 3).map(a => {
                  const req = a.event_requests;
                  if (!req) return null;
                  const cd = getDaysUntil(req.event_date);
                  return (
                    <div key={a.id} className="bg-surface border border-amber-500/20 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">New Assignment</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${cd.urgent ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-background text-muted-foreground border-border/40"}`}>{cd.label}</span>
                          </div>
                          <h4 className="text-base font-light font-heading text-foreground">{req.event_type}</h4>
                          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-mono pt-0.5">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-accent-gold" />{formatDate(req.event_date)}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent-gold" />{req.location.split(",")[0]}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3 text-accent-gold" />{req.guest_count} guests</span>
                          </div>
                        </div>
                        <Link href={`/operations/assignments/${a.id}`}
                          className="px-4 py-2 text-[10px] font-bold text-black bg-accent-gold rounded-xl shadow-md shadow-accent-gold/15 hover:brightness-110 transition cursor-pointer shrink-0"
                        >
                          Open
                        </Link>
                      </div>
                      {a.handover_notes && (
                        <div className="border-t border-border/40 pt-3">
                          <p className="text-[10px] text-muted-foreground"><span className="font-bold text-foreground/60 uppercase tracking-wider text-[8px]">Admin Notes: </span>{a.handover_notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming 7 days */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Next 7 Days</h3>
              </div>
              <Link href="/operations/assignments" className="text-[10px] font-bold uppercase tracking-wider text-accent-gold hover:underline">All Assignments</Link>
            </div>

            {stats.upcoming7.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.upcoming7.slice(0, 4).map(a => {
                  const req = a.event_requests;
                  if (!req) return null;
                  const cd = getDaysUntil(req.event_date);
                  const sc = getStatusConfig(a.status);
                  return (
                    <Link key={a.id} href={`/operations/assignments/${a.id}`}
                      className="group bg-surface border border-border/70 rounded-2xl p-5 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-light font-heading text-foreground group-hover:text-accent-gold transition leading-tight">{req.event_type}</h4>
                            <p className="text-[9.5px] text-muted-foreground mt-0.5">{req.profiles?.full_name}</p>
                          </div>
                          <span className={`text-[8px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0 ${cd.urgent ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-background text-muted-foreground border-border/40"}`}>{cd.label}</span>
                        </div>
                        <div className="space-y-1 text-[9.5px] text-muted-foreground font-mono">
                          <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-accent-gold" />{formatDate(req.event_date)}</p>
                          <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 text-accent-gold shrink-0" /><span className="truncate">{req.location}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/40 pt-3">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        {a.escalation_level > 0 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold group-hover:translate-x-0.5 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border/60 rounded-2xl bg-surface/30">
                <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-light">No upcoming events in the next 7 days.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right: Calendar + Activity + Quick actions */}
        <div className="xl:col-span-4 space-y-6">

          {/* Calendar */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground mb-4">Execution Calendar</h3>
            <MiniCalendar assignments={assignments} />
          </div>

          {/* Activity Feed */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">Recent Activity</h3>
              <Link href="/operations/notifications" className="text-[9px] font-bold uppercase tracking-wider text-accent-gold hover:underline">All</Link>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3.5 relative pt-1">
                <div className="absolute left-[7px] top-2.5 bottom-2.5 w-0.5 bg-border/40" />
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className="flex gap-4 pl-6 relative">
                    <span className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-background ${n.status === "Delivered" ? "bg-accent-gold animate-pulse" : "bg-zinc-600"}`} />
                    <div className="space-y-0.5">
                      <p className="text-[10.5px] text-foreground/75 leading-normal font-light">{n.message}</p>
                      <span className="text-[8px] text-muted-foreground font-mono">{formatDate(n.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4 font-light italic">No recent activity.</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Assignments", link: "/operations/assignments", icon: Briefcase },
                { label: "Calendar", link: "/operations/calendar", icon: Calendar },
                { label: "Schedule", link: "/operations/schedule", icon: Clock },
                { label: "Notifications", link: "/operations/notifications", icon: Bell },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link key={i} href={item.link}
                    className="flex flex-col items-center justify-center p-4 bg-background border border-border/60 hover:border-accent-gold/25 hover:bg-surface-raised rounded-xl gap-2 group transition"
                  >
                    <Icon className="w-4 h-4 text-accent-gold group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
