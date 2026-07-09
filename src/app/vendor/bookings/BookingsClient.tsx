"use client";

import { useState, useMemo } from "react";
import {
  Briefcase, Calendar, MapPin, Users, ArrowRight, Clock,
  Phone, Mail, CheckCircle2, XCircle, AlertCircle, Lock
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Booking {
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
    status: string;
    event_assignments: {
      id: string;
      profiles: { full_name: string; phone_number: string; email: string } | null;
    }[];
    request_items: {
      quantity: number;
      service_items: { name: string; subcategories: { category_id: string } | null } | null;
    }[];
  } | null;
}

type TabFilter = "all" | "approved" | "accepted" | "rejected";

function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Completed", color: "text-muted-foreground", urgent: false };
  if (diff === 0) return { label: "TODAY", color: "text-red-400", urgent: true };
  if (diff === 1) return { label: "Tomorrow", color: "text-amber-400", urgent: true };
  if (diff <= 7) return { label: `${diff} days`, color: "text-amber-400", urgent: true };
  return { label: `${diff} days`, color: "text-muted-foreground", urgent: false };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Approved: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/25" },
  Accepted: { label: "Awaiting Admin", color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/25" },
  Rejected: { label: "Declined", color: "text-zinc-500", bg: "bg-zinc-500/8", border: "border-zinc-500/20" },
};

const tabs: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Confirmed" },
  { key: "accepted", label: "Awaiting" },
  { key: "rejected", label: "Declined" },
];

function StatusPipeline({ status }: { status: string }) {
  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
        <XCircle className="w-3.5 h-3.5" /> Not selected
      </div>
    );
  }

  const steps = [
    { label: "Accepted", done: true },
    { label: "Admin Review", done: status === "Approved" },
    { label: "Confirmed", done: status === "Approved" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
            step.done ? "bg-emerald-500" : "bg-zinc-800 border border-zinc-700"
          }`}>
            {step.done && (
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`text-[8.5px] font-bold uppercase tracking-wide hidden sm:inline ${
            step.done ? "text-emerald-400" : "text-zinc-600"
          }`}>{step.label.split(" ")[0]}</span>
          {i < steps.length - 1 && (
            <div className={`w-4 sm:w-6 h-px ${steps[i + 1]?.done ? "bg-emerald-500" : "bg-zinc-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const counts = useMemo(() => ({
    all: bookings.length,
    approved: bookings.filter((b) => b.status === "Approved").length,
    accepted: bookings.filter((b) => b.status === "Accepted").length,
    rejected: bookings.filter((b) => b.status === "Rejected").length,
  }), [bookings]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return bookings;
    const map: Record<TabFilter, string> = { all: "", approved: "Approved", accepted: "Accepted", rejected: "Rejected" };
    return bookings.filter((b) => b.status === map[activeTab]);
  }, [bookings, activeTab]);

  return (
    <div className="space-y-6 select-none animate-fade-in">

      {/* Status Filter Pill Row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isActive
                  ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                  isActive ? "bg-accent-gold/15 text-accent-gold" : "bg-surface text-muted-foreground"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/60 bg-surface/30 text-center">
          <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No assignments found</h3>
          <p className="text-xs text-muted-foreground mt-1.5 font-light max-w-xs">
            {activeTab === "all"
              ? "Accept leads from your Invitations inbox to create assignments."
              : `No assignments with "${tabs.find((t) => t.key === activeTab)?.label}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const req = booking.event_requests;
            if (!req) return null;

            const isApproved = booking.status === "Approved";
            const isRejected = booking.status === "Rejected";
            const om = req.event_assignments?.[0]?.profiles;
            const countdown = getDaysUntil(req.event_date);
            const sc = statusConfig[booking.status] || statusConfig.Accepted;

            const categoryItems = req.request_items.filter(
              (item) => item.service_items?.subcategories?.category_id === booking.category_id
            );

            return (
              <div
                key={booking.id}
                className={`group bg-surface rounded-3xl border overflow-hidden transition-all duration-200 ${
                  isRejected
                    ? "border-border/40 opacity-60"
                    : isApproved
                    ? "border-border/70 hover:border-accent-gold/25 hover:shadow-lg shadow-sm"
                    : "border-amber-500/20 shadow-sm"
                }`}
              >
                {/* Status top-strip */}
                <div className={`h-1 ${isApproved ? "bg-gradient-to-r from-emerald-500 to-teal-500" : isRejected ? "bg-zinc-600" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />

                <div className="p-6 space-y-5">

                  {/* ── Header Row ── */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-accent-gold">{booking.categories?.name}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">#{booking.id.substring(0, 8).toUpperCase()}</span>
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-lg border ${sc.bg} ${sc.color} ${sc.border}`}>
                          {sc.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-light font-heading text-foreground">{req.event_type}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono">Registered {formatDate(booking.created_at)}</p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusPipeline status={booking.status} />
                      {isApproved && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold font-mono ${countdown.color}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {countdown.label}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Details Grid ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-border/40">

                    {/* Scope */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Event Scope</span>
                      <div className="space-y-2 text-[10.5px] font-mono text-foreground/80">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-accent-gold" />{req.event_date}</div>
                        <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-accent-gold" />{req.guest_count} guests</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent-gold" /><span className="truncate">{req.location}</span></div>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Your Services</span>
                      <div className="flex flex-wrap gap-1.5">
                        {categoryItems.length > 0 ? categoryItems.map((item, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-background border border-border text-xs text-foreground/80 rounded-xl font-semibold">
                            {item.service_items?.name}
                            {item.quantity > 1 && <span className="text-accent-gold ml-1">×{item.quantity}</span>}
                          </span>
                        )) : (
                          <span className="text-xs text-muted-foreground font-light">No specific items</span>
                        )}
                      </div>
                    </div>

                    {/* Coordinator */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Coordinator</span>
                      {isApproved && om ? (
                        <div className="p-3 bg-background/60 border border-border/70 rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-accent-gold text-[9px] font-bold shrink-0">
                              {om.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10.5px] font-bold text-foreground truncate">{om.full_name}</span>
                          </div>
                          <div className="space-y-1 text-[9px] font-mono text-muted-foreground border-t border-border/40 pt-1.5">
                            <a href={`tel:${om.phone_number}`} className="flex items-center gap-1 hover:text-accent-gold">
                              <Phone className="w-3 h-3 text-accent-gold" /> {om.phone_number}
                            </a>
                            <a href={`mailto:${om.email}`} className="flex items-center gap-1 hover:text-accent-gold truncate" title={om.email}>
                              <Mail className="w-3 h-3 text-accent-gold shrink-0" /> {om.email}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-background/30 border border-border/50 rounded-xl flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground font-light">
                            {isApproved ? "Coordinator being assigned…" : "Unlocks after Admin confirmation."}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── Footer CTA ── */}
                  <div className="flex justify-end">
                    {isApproved ? (
                      <Link
                        href={`/vendor/bookings/${booking.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-[#D4AF37]/10 cursor-pointer"
                      >
                        Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-zinc-500 text-[11px] font-semibold rounded-xl opacity-50 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" /> Workspace Locked
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
