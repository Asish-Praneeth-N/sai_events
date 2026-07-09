"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox, Briefcase, Calendar, Clock, CheckCircle2, AlertCircle,
  ArrowRight, MapPin, Users, ChevronRight, Activity, Check, X,
  Zap, TrendingUp, Image, User, Award, Shield, Sparkles, Phone, Mail,
  ChevronLeft
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
  if (diff < 0) return { label: "Completed", urgent: false, days: diff };
  if (diff === 0) return { label: "TODAY", urgent: true, days: 0 };
  if (diff === 1) return { label: "Tomorrow", urgent: true, days: 1 };
  return { label: `${diff} days`, urgent: diff <= 7, days: diff };
}

// Interactive mini calendar widget
function MiniCalendar({ assignments }: { assignments: Assignment[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const eventDates = useMemo(() => {
    const dates: Record<string, "Approved" | "Accepted"> = {};
    assignments.forEach((a) => {
      const dateStr = a.event_requests?.event_date;
      if (dateStr && (a.status === "Approved" || a.status === "Accepted")) {
        dates[dateStr] = a.status as any;
      }
    });
    return dates;
  }, [assignments]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground font-mono">{monthName}</span>
        <button type="button" onClick={nextMonth} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-muted-foreground uppercase">{d}</span>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <span key={idx} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const eventStatus = eventDates[dateStr];

          return (
            <span
              key={idx}
              className={`text-[10.5px] py-1.5 rounded-xl font-mono relative flex items-center justify-center transition-all ${
                isToday
                  ? "bg-accent-gold text-black font-black shadow-lg shadow-accent-gold/25"
                  : eventStatus === "Approved"
                  ? "bg-emerald-500/10 text-emerald-500 font-extrabold border border-emerald-500/30"
                  : eventStatus === "Accepted"
                  ? "bg-amber-500/10 text-amber-500 font-extrabold border border-amber-500/30"
                  : "text-muted-foreground hover:bg-surface-raised"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-muted-foreground pt-3 border-t border-border/40">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-gold" /> Today</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Awaiting</span>
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

    const todayStr = new Date().toISOString().split("T")[0];
    const todayEvents = assignments.filter(
      (a) => a.event_requests?.event_date === todayStr && a.status === "Approved"
    );

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = assignments.filter((a) => {
      const d = a.event_requests?.event_date;
      if (!d || a.status !== "Approved") return false;
      const dt = new Date(d);
      return dt > new Date() && dt <= nextWeek;
    });

    const years = profile.created_at
      ? Math.max(1, new Date().getFullYear() - new Date(profile.created_at).getFullYear() + 1)
      : 1;

    return { total, pending, approved, accepted, acceptanceRate, profileStrength, todayEvents, upcoming, years };
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
        setSuccess(accept ? "Invitation successfully accepted." : "Invitation declined.");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to submit response.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  const initials = (profile.business_name || profile.full_name || "?")
    .split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  // SVG mini-chart helper for premium KPI metrics
  const MiniTrendChart = ({ points }: { points: number[] }) => {
    const width = 80;
    const height = 24;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const path = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={path} fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in select-none max-w-7xl mx-auto pb-12">

      {/* ── Toast Alerts ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl animate-scale-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="cursor-pointer text-red-400/70 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl animate-scale-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1">{success}</span>
          <button type="button" onClick={() => setSuccess(null)} className="cursor-pointer text-emerald-400/70 hover:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── ZONE 1: Page Header & Title ── */}
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground font-sans">{greeting}, {profile.full_name.split(" ")[0]}</p>
          <h1 className="text-3xl font-light font-heading text-foreground tracking-tight">Business Headquarters</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Operations Sync Live</span>
        </div>
      </div>

      {/* ── ZONE 2: Immersive Business Hero ── */}
      <div className="relative rounded-[32px] border border-border/80 bg-surface/50 dark:bg-zinc-950/20 shadow-2xl overflow-hidden p-6 sm:p-10">
        {/* Ambient radial glows */}
        <div className="absolute top-0 right-0 w-[45%] h-[75%] bg-gradient-to-bl from-accent-gold/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[60%] bg-gradient-to-tr from-accent-gold/4 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Left Column: Business Bio */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-24 h-24 rounded-[28px] bg-zinc-900 border-2 border-accent-gold flex items-center justify-center text-accent-gold text-3xl font-heading shadow-xl select-none font-bold shrink-0">
                {initials}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-3xl font-light text-foreground font-heading leading-tight">
                    {profile.business_name || "Your Enterprise"}
                  </h2>
                  {profile.status === "Approved" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-400 select-none">
                      <Shield className="w-3 h-3 fill-emerald-500/20" /> Vetted Partner
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-light flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Managed by {profile.full_name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span>{stats.years} Year{stats.years > 1 ? "s" : ""} in Network</span>
                </p>
              </div>
            </div>

            {/* Description & Alignment Categories */}
            <div className="space-y-3.5 max-w-xl">
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-light">
                {profile.address || "Add details in your business profile to showcase your capabilities to the SAI dispatch manager."}
              </p>
              
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-background border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground rounded-lg select-none">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick dashboard focus indicator */}
            <div className="p-4 bg-background/50 border border-border/80 rounded-2xl flex items-center justify-between gap-4 max-w-md shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-accent-gold" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] uppercase tracking-widest font-extrabold text-muted-foreground block">Today's Focus</span>
                  <span className="text-xs font-bold text-foreground">
                    {stats.todayEvents.length > 0
                      ? `${stats.todayEvents.length} active staging event today`
                      : stats.pending > 0
                      ? `Review ${stats.pending} pending invitations`
                      : "No active bookings scheduled today"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Hero Right Column: Health circular scores */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 sm:p-6 bg-background/30 border border-border/60 rounded-3xl backdrop-blur-md">
            
            {/* Health Score 1: Acceptance Rate Circular Progress */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-border/40" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    className="text-accent-gold"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - stats.acceptanceRate / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center font-mono">
                  <span className="text-base font-bold text-foreground">{stats.acceptanceRate}%</span>
                  <span className="text-[7.5px] uppercase tracking-wider text-muted-foreground font-sans font-bold">Accept Rate</span>
                </div>
              </div>
              <p className="text-[9.5px] text-muted-foreground/80 font-light max-w-[140px] leading-relaxed">
                Reputation and lead processing health
              </p>
            </div>

            {/* Health Score 2: Linear Segmented Scores */}
            <div className="flex flex-col justify-center space-y-4">
              
              {/* Profile Completion */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">
                  <span>Profile Strength</span>
                  <span className="font-mono text-accent-gold">{stats.profileStrength}%</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((step) => {
                    const active = stats.profileStrength >= step * 20;
                    return (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-sm transition ${
                          active ? "bg-accent-gold" : "bg-border/60"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Assignments Count */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">
                  <span>Completed Files</span>
                  <span className="font-mono text-foreground font-bold">{stats.approved}</span>
                </div>
                <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (stats.approved / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Status & Availability Quick Status */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">Dispatch state</span>
                <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold text-foreground">
                  <span className={`w-2 h-2 rounded-full ${
                    profile.availability_status === "Available" ? "bg-emerald-500 animate-pulse" : profile.availability_status === "Busy" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  {profile.availability_status}
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── ZONE 3: Business Health Metrics widgets (Stripe / Vercel style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Today's Opportunities", val: stats.pending, subtitle: "Awaiting your confirmation", trend: [1, 2, stats.pending], action: "View Inbox", link: "/vendor/inbox", urgent: stats.pending > 0 },
          { label: "Active Project Files", val: stats.approved, subtitle: "Operational schedules", trend: [2, 4, stats.approved], action: "Open Assignments", link: "/vendor/bookings", urgent: false },
          { label: "Portfolio Items", val: portfolioCount, subtitle: "Vetted gallery showcase assets", trend: [portfolioCount - 2, portfolioCount - 1, portfolioCount], action: "Manage Gallery", link: "/vendor/profile", urgent: false }
        ].map((widget, i) => (
          <div
            key={i}
            className="p-6 bg-surface border border-border/80 hover:border-accent-gold/25 rounded-3xl transition-all duration-300 shadow-sm flex flex-col justify-between gap-6 group hover-lift relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] uppercase tracking-widest font-extrabold text-muted-foreground font-sans">{widget.label}</span>
                {widget.urgent && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-light font-heading text-foreground">{widget.val}</span>
                <MiniTrendChart points={widget.trend.map(v => Math.max(0, v))} />
              </div>
              <p className="text-[10.5px] text-muted-foreground font-light">{widget.subtitle}</p>
            </div>
            
            <a
              href={widget.link}
              className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-accent-gold border-t border-border/40 pt-4 mt-2 group-hover:text-amber-500 transition"
            >
              {widget.action}
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </a>
          </div>
        ))}
      </div>

      {/* ── ZONE 4: Two-Column Main Layout Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Area (8/12 cols): Spotlight Invitations & Active Assignments */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Section A: Pending Lead Spotlight */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-gold animate-pulse-glow" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Immediate Action Required</h3>
              </div>
              <span className="text-[9px] font-mono bg-background border border-border px-2 py-0.5 rounded text-muted-foreground">
                Protected Identity leads
              </span>
            </div>

            {pendingLeads.length > 0 ? (
              <div className="space-y-4">
                {pendingLeads.map((lead) => {
                  const req = lead.event_requests;
                  if (!req) return null;
                  const isLoading = actionLoadingId === lead.id;
                  const isConfirming = confirmingId?.id === lead.id;
                  const countdown = getDaysUntil(req.event_date);

                  return (
                    <div
                      key={lead.id}
                      className="bg-surface border border-border/80 rounded-3xl overflow-hidden hover:border-accent-gold/25 transition-all duration-300 shadow-sm relative group p-6 space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-2.5 py-0.5 rounded-lg border border-accent-gold/20">
                              {lead.categories?.name}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                              countdown.urgent
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-background text-muted-foreground border-border/40"
                            }`}>
                              {countdown.label}
                            </span>
                          </div>
                          <h4 className="text-lg font-light font-heading text-foreground tracking-tight group-hover:text-accent-gold transition">
                            {req.event_type}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground font-mono pt-1">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-gold" />{req.event_date}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-gold" />{req.location.split(",")[0]}</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent-gold" />{req.guest_count} guests</span>
                          </div>
                        </div>

                        {/* Staged Accept/Decline */}
                        <div className="flex items-center gap-2.5 shrink-0 self-start">
                          {isLoading ? (
                            <span className="text-[10px] text-muted-foreground font-mono animate-pulse">Processing response...</span>
                          ) : isConfirming ? (
                            <div className="flex items-center gap-2 bg-background border border-border/80 p-1.5 rounded-2xl animate-scale-in">
                              <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-muted-foreground px-2">
                                Confirm {confirmingId?.action}?
                              </span>
                              <button
                                type="button"
                                onClick={() => setConfirmingId(null)}
                                className="px-3 py-1.5 text-[9px] font-bold border border-border rounded-xl text-muted-foreground cursor-pointer hover:bg-surface-raised"
                              >Cancel</button>
                              <button
                                type="button"
                                onClick={() => executeAction(lead.id, confirmingId!.action === "accept")}
                                className={`px-3.5 py-1.5 text-[9px] font-bold text-black rounded-xl cursor-pointer shadow ${
                                  confirmingId?.action === "accept" ? "bg-accent-gold" : "bg-red-500 text-white"
                                }`}
                              >Confirm</button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmingId({ id: lead.id, action: "reject" })}
                                className="px-4 py-2 text-[10px] font-bold text-muted-foreground border border-border/80 hover:border-red-500/30 hover:text-red-400 rounded-xl transition cursor-pointer"
                              >Decline</button>
                              <button
                                type="button"
                                onClick={() => setConfirmingId({ id: lead.id, action: "accept" })}
                                className="px-4.5 py-2 text-[10px] font-bold text-black bg-gradient-to-r from-accent-gold to-amber-500 rounded-xl transition shadow-md shadow-[#D4AF37]/10 cursor-pointer"
                              >Accept Lead</button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Display checklist services required */}
                      {req.request_items && req.request_items.length > 0 && (
                        <div className="border-t border-border/40 pt-4 space-y-2">
                          <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-muted-foreground">Required services</span>
                          <div className="flex flex-wrap gap-1.5">
                            {req.request_items
                              .filter((item) => item.service_items?.name)
                              .map((item, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-background border border-border text-[9.5px] font-semibold rounded-lg text-foreground/80">
                                  {item.service_items?.name} {item.quantity > 1 ? `(×${item.quantity})` : ""}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border/80 rounded-[24px] bg-surface/30">
                <Inbox className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-light">Inbox clean. No pending assignments at the moment.</p>
              </div>
            )}
          </section>

          {/* Section B: Active Assignments Project Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Active Staging Projects</h3>
              </div>
              <a href="/vendor/bookings" className="text-[10px] font-bold uppercase tracking-wider text-accent-gold hover:underline">
                Manage Files
              </a>
            </div>

            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProjects.map((project) => {
                  const req = project.event_requests;
                  if (!req) return null;
                  const om = req.event_assignments?.[0]?.profiles;
                  const countdown = getDaysUntil(req.event_date);

                  return (
                    <div
                      key={project.id}
                      className="bg-surface border border-border/80 rounded-3xl p-6 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between group"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[8.5px] font-bold uppercase tracking-widest text-accent-gold">{project.categories?.name}</span>
                            <h4 className="text-base font-light font-heading text-foreground mt-0.5 leading-tight group-hover:text-accent-gold transition">
                              {req.event_type}
                            </h4>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            countdown.urgent
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {countdown.label}
                          </span>
                        </div>

                        <div className="text-[10px] text-muted-foreground space-y-1.5 font-mono pt-1">
                          <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-gold" />{req.event_date}</p>
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-gold truncate" /><span className="truncate max-w-[190px]">{req.location}</span></p>
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-border/40 pt-4 mt-2">
                        {om && (
                          <div className="flex items-center gap-2.5 bg-background/50 border border-border/60 p-2 rounded-2xl">
                            <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-accent-gold text-[8.5px] font-bold uppercase select-none">
                              {om.full_name.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9.5px] font-bold text-foreground block truncate">{om.full_name}</span>
                              <span className="text-[7.5px] uppercase tracking-widest text-muted-foreground block font-mono font-bold">Staging Manager</span>
                            </div>
                          </div>
                        )}

                        <a
                          href={`/vendor/bookings/${project.id}`}
                          className="flex items-center justify-between w-full px-4 py-2.5 bg-background border border-border/60 hover:border-accent-gold/25 hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition group"
                        >
                          Workspace Console
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transform group-hover:translate-x-0.5 transition" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border/80 rounded-[24px] bg-surface/30">
                <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-light">No active staging assignments configured.</p>
              </div>
            )}
          </section>

        </div>

        {/* Right Area (4/12 cols): Scheduling & Real-time Logs */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Segment A: Calendar Layout */}
          <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground mb-4">Operations Calendar</h3>
            <MiniCalendar assignments={assignments} />
          </div>

          {/* Segment B: Modern timelines connector */}
          <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">Activity logs</h3>
            
            {notifications.length > 0 ? (
              <div className="space-y-4 relative pt-1">
                {/* Visual connecting line */}
                <div className="absolute left-[7px] top-2.5 bottom-2.5 w-0.5 bg-border/40" />

                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex gap-4 pl-6 relative">
                    <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-background bg-accent-gold animate-pulse-glow" />
                    <div className="space-y-1">
                      <p className="text-[11px] text-foreground/80 leading-normal font-light">
                        {n.message}
                      </p>
                      <span className="text-[8.5px] text-muted-foreground font-mono block">
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-light italic text-center py-6">No recent notifications logged.</p>
            )}
          </div>

          {/* Segment C: Quick actions grid */}
          <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">HQ Control shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Inbox", link: "/vendor/inbox", icon: Inbox },
                { label: "Assignments", link: "/vendor/bookings", icon: Briefcase },
                { label: "Calendar", link: "/vendor/calendar", icon: Calendar },
                { label: "Profile Settings", link: "/vendor/profile", icon: User }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.link}
                    className="flex flex-col items-center justify-center p-4 bg-background border border-border/60 hover:border-accent-gold/25 hover:bg-surface-raised rounded-2xl text-center gap-2 group transition"
                  >
                    <Icon className="w-4 h-4 text-accent-gold transition duration-200 group-hover:scale-110" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block group-hover:text-foreground">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
