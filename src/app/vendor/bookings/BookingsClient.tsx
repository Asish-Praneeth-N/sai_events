"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, Calendar, MapPin, Users, ChevronRight, Clock, 
  Phone, Mail, ShieldCheck, ArrowRight, XCircle, CheckCircle2, UserCheck
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

function StatusStepper({ status }: { status: string }) {
  const isApproved = status === "Approved";
  const isAccepted = status === "Accepted";
  const isRejected = status === "Rejected";

  const steps = [
    { label: "Lead Accepted", done: isAccepted || isApproved },
    { label: "Admin Calibration", done: isApproved },
    { label: "Confirmed Assign", done: isApproved },
  ];

  if (isRejected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
        <XCircle className="w-3.5 h-3.5" />
        <span>File Closed (Not Selected)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              step.done
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700"
            }`}>
              {step.done && (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:inline ${
              step.done
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-400 dark:text-zinc-600"
            }`}>
              {step.label.split(" ")[0]}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-4 sm:w-6 h-px flex-shrink-0 transition-all duration-300 ${
              steps[idx + 1]?.done ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-800"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

const tabConfig: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All Bookings" },
  { key: "approved", label: "Confirmed" },
  { key: "accepted", label: "Pending Calibrate" },
  { key: "rejected", label: "Rejected" },
];

export default function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return bookings;
    if (activeTab === "approved") return bookings.filter((b) => b.status === "Approved");
    if (activeTab === "accepted") return bookings.filter((b) => b.status === "Accepted");
    if (activeTab === "rejected") return bookings.filter((b) => b.status === "Rejected");
    return bookings;
  }, [bookings, activeTab]);

  const counts = {
    all: bookings.length,
    approved: bookings.filter((b) => b.status === "Approved").length,
    accepted: bookings.filter((b) => b.status === "Accepted").length,
    rejected: bookings.filter((b) => b.status === "Rejected").length,
  };

  const getCountdownText = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "Project Day: Today!";
    if (diffDays === 1) return "1 Day remaining";
    return `${diffDays} days remaining`;
  };

  return (
    <div className="space-y-6 select-none animate-fade-in-up">
      {/* Dynamic Tab Selector Row */}
      <div className="flex flex-row overflow-x-auto gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 border border-border/70 rounded-xl w-fit scrollbar-none whitespace-nowrap">
        {tabConfig.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-surface text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    : "bg-muted border border-border/25 text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-4 text-accent-gold shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No bookings found</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-light">
            {activeTab === "all" ? "Accept leads from your inbox to display active records." : `No event files marked as ${activeTab}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
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
                className={`group relative rounded-3xl overflow-hidden bg-surface border transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                  isRejected ? "opacity-60" : "hover:border-accent-gold/20 hover:shadow-md shadow-sm"
                }`}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-[5px] ${
                  isApproved
                    ? "bg-gradient-to-b from-emerald-500 to-teal-500"
                    : isRejected
                    ? "bg-zinc-400"
                    : "bg-gradient-to-b from-amber-400 to-orange-500"
                }`} />

                <div className="pl-6.5 pr-5.5 py-6.5 space-y-5">
                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold">
                          {booking.categories?.name} Project
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono">ID: {booking.id.substring(0, 8)}</span>
                      </div>
                      <h4 className="text-base font-bold text-foreground font-heading mt-1">
                        {req.event_type} Template
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Calibrated on {formatDate(booking.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusStepper status={booking.status} />
                    </div>
                  </div>

                  {/* Core Parameters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-b border-border/40 py-5">
                    
                    {/* Event Scope Info */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Scope parameters</span>
                      <div className="space-y-2.5 font-mono text-[10.5px]">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                          <span className="text-foreground/80">{req.guest_count} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                          <span className="text-foreground/80 truncate block max-w-[200px]" title={req.location}>
                            {req.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Included Services Checklist */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Services checklist</span>
                      <div className="flex flex-wrap gap-1">
                        {categoryItems.map((item, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border text-zinc-700 dark:text-zinc-300 text-[10px] rounded-lg font-semibold"
                          >
                            {item.service_items?.name}
                            {item.quantity > 1 && (
                              <span className="text-accent-gold font-bold ml-1">×{item.quantity}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Coordinator Partner Box */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Assigned Coordinator</span>
                      {isApproved && om ? (
                        <div className="p-3 bg-background/50 border border-border/80 rounded-xl space-y-2 shadow-inner">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-zinc-900 border border-border flex items-center justify-center text-accent-gold text-[9px] font-bold uppercase shrink-0">
                              {om.full_name.substring(0, 2)}
                            </div>
                            <span className="font-bold text-[10.5px] text-foreground truncate block max-w-[130px]">{om.full_name}</span>
                          </div>
                          
                          <div className="space-y-1 text-[9px] font-mono text-muted-foreground border-t border-border/40 pt-1.5 mt-1 leading-normal">
                            <a href={`tel:${om.phone_number}`} className="hover:text-accent-gold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-accent-gold" /> {om.phone_number}
                            </a>
                            <a href={`mailto:${om.email}`} className="hover:text-accent-gold flex items-center gap-1 truncate" title={om.email}>
                              <Mail className="w-3 h-3 text-accent-gold shrink-0" /> {om.email}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-background/20 border border-border/50 rounded-xl flex items-start gap-2">
                          <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground leading-normal font-light">
                            {isApproved ? "Assigning coordinator partner..." : "Unlock details upon Admin confirmation."}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Booking Footer Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div>
                      {isApproved && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-accent-gold">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>{getCountdownText(req.event_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isApproved ? (
                        <Link
                          href={`/vendor/bookings/${booking.id}`}
                          className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                          Open Project Workspace <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 border border-border bg-background text-zinc-500 rounded-xl opacity-50 cursor-not-allowed font-semibold"
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
