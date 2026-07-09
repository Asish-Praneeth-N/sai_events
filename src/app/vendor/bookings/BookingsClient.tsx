"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, Calendar, MapPin, Users, ChevronRight, Clock, 
  Phone, Mail, ShieldCheck, ArrowRight, XCircle, CheckCircle2, UserCheck,
  Lock, Check, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  status: string; // 'Accepted' | 'Approved' | 'Rejected'
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
      profiles: {
        full_name: string;
        phone_number: string;
        email: string;
      } | null;
    }[];
    request_items: {
      quantity: number;
      service_items: {
        name: string;
        subcategories: { category_id: string } | null;
      } | null;
    }[];
  } | null;
}

type TabFilter = "all" | "approved" | "accepted" | "rejected";

// Horizontal pipeline status stepper
function StatusPipeline({ status }: { status: string }) {
  const isApproved = status === "Approved";
  const isAccepted = status === "Accepted";
  const isRejected = status === "Rejected";

  if (isRejected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold uppercase tracking-wider font-mono">
        <XCircle className="w-4 h-4" />
        <span>File Closed</span>
      </div>
    );
  }

  const steps = [
    { label: "Lead Accepted", active: isAccepted || isApproved },
    { label: "Admin Vetting", active: isApproved },
    { label: "Active Project", active: isApproved },
  ];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
              step.active
                ? "bg-emerald-500 border-emerald-500 text-black font-extrabold"
                : "bg-background border-border/80 text-muted-foreground"
            }`}>
              {step.active ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="text-[8px] font-bold font-mono">{idx + 1}</span>
              )}
            </div>
            <span className={`text-[8.5px] font-bold uppercase tracking-widest hidden sm:inline ${
              step.active ? "text-emerald-400" : "text-muted-foreground"
            }`}>
              {step.label.split(" ")[0]}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-6 sm:w-8 h-0.5 rounded-full transition-all ${
              steps[idx + 1]?.active ? "bg-emerald-500" : "bg-border/60"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

const tabConfig: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All Active Files" },
  { key: "approved", label: "Confirmed Projects" },
  { key: "accepted", label: "Awaiting Calibration" },
  { key: "rejected", label: "Closed Files" },
];

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
    if (activeTab === "approved") return bookings.filter((b) => b.status === "Approved");
    if (activeTab === "accepted") return bookings.filter((b) => b.status === "Accepted");
    if (activeTab === "rejected") return bookings.filter((b) => b.status === "Rejected");
    return bookings;
  }, [bookings, activeTab]);

  const getCountdownText = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Staging Completed";
    if (diffDays === 0) return "STAGING TODAY";
    if (diffDays === 1) return "STAGING TOMORROW";
    return `${diffDays} days remaining`;
  };

  return (
    <div className="space-y-8 select-none animate-fade-in max-w-7xl mx-auto pb-8">
      
      {/* ── Tabs selector ── */}
      <div className="flex flex-row overflow-x-auto gap-2 p-1 bg-background border border-border/80 rounded-2xl w-fit scrollbar-none whitespace-nowrap">
        {tabConfig.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                isActive
                  ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/25 font-black"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-lg ${
                  isActive
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "bg-surface border border-border/60 text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Booking Projects List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-5 text-accent-gold shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No bookings found</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light">
            {activeTab === "all" ? "Accept leads from your inbox to activate events workspace." : `No event files cataloged as ${activeTab}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((booking, i) => {
            const req = booking.event_requests;
            if (!req) return null;

            const isApproved = booking.status === "Approved";
            const isRejected = booking.status === "Rejected";
            const om = req.event_assignments?.[0]?.profiles;

            const categoryItems = req.request_items.filter(
              (item) => item.service_items?.subcategories?.category_id === booking.category_id
            );

            return (
              <div
                key={booking.id}
                className={`group relative rounded-[28px] overflow-hidden bg-surface border transition-all duration-300 hover-lift shadow-sm hover:shadow-lg ${
                  isRejected ? "opacity-60 border-border/40" : "border-border/80 hover:border-accent-gold/25"
                }`}
              >
                {/* Visual Accent Top Bar */}
                <div className={`h-1.5 w-full ${
                  isApproved
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"
                    : isRejected
                    ? "bg-zinc-500"
                    : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300"
                }`} />

                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Row 1: Header Title & Live Status Stepper */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-accent-gold">
                          {booking.categories?.name} Project Workspace
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span className="text-[9px] text-muted-foreground font-mono font-bold">REF: #{booking.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <h4 className="text-xl font-light font-heading text-foreground tracking-tight group-hover:text-accent-gold transition">
                        {req.event_type}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        File generated on {formatDate(booking.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <StatusPipeline status={booking.status} />
                    </div>
                  </div>

                  {/* Row 2: Parameters Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b border-border/40 py-6">
                    
                    {/* Column A: Event Scope parameters */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-widest block font-sans">Scope Details</span>
                      <div className="space-y-2.5 font-mono text-[11px] text-foreground/80">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent-gold shrink-0" />
                          <span>{req.guest_count} Attendees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
                          <span className="truncate block max-w-[200px]" title={req.location}>
                            {req.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent-gold shrink-0" />
                          <span>{req.event_date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column B: Deliverable services required */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-widest block font-sans">Your Deliverables</span>
                      <div className="flex flex-wrap gap-1.5">
                        {categoryItems.map((item, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground/80 text-[10px] rounded-xl font-bold font-sans"
                          >
                            <Check className="w-3.5 h-3.5 text-accent-gold" />
                            {item.service_items?.name}
                            {item.quantity > 1 && (
                              <span className="text-accent-gold font-bold ml-1">×{item.quantity}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Column C: Coordinator contact details */}
                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-widest block font-sans">Operational Manager</span>
                      {isApproved && om ? (
                        <div className="p-4 bg-background/50 border border-border/80 rounded-2xl space-y-2.5 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-border flex items-center justify-center text-accent-gold text-[9px] font-bold uppercase shrink-0 select-none">
                              {om.full_name.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-foreground block truncate">{om.full_name}</span>
                              <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-mono font-bold">Staging Lead</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 text-[9.5px] font-mono text-muted-foreground border-t border-border/40 pt-2.5 mt-1">
                            <a href={`tel:${om.phone_number}`} className="hover:text-accent-gold flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-accent-gold" /> {om.phone_number}
                            </a>
                            <a href={`mailto:${om.email}`} className="hover:text-accent-gold flex items-center gap-1.5 truncate" title={om.email}>
                              <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0" /> {om.email}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-background/30 border border-border/50 rounded-2xl flex items-start gap-2.5">
                          <Lock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5 animate-pulse" />
                          <p className="text-[10px] text-muted-foreground leading-normal font-light">
                            {isApproved ? "Assigning coordinator partner..." : "Unlock contact card upon Admin confirmation."}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Row 3: Staging Countdown & Call to action */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      {isApproved && (
                        <div className="flex items-center gap-2 font-mono text-xs text-accent-gold font-bold uppercase tracking-wider">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>{getCountdownText(req.event_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {isApproved ? (
                        <Link
                          href={`/vendor/bookings/${booking.id}`}
                          className="px-5 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                          Workspace Console <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-5 py-2.5 border border-border bg-background text-zinc-500 rounded-xl opacity-50 cursor-not-allowed font-bold text-xs uppercase tracking-wider"
                        >
                          Workspace Locked
                        </button>
                      )}
                    </div>
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
