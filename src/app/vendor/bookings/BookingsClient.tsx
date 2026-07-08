"use client";

import { useState, useMemo } from "react";

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
    profiles: {
      full_name: string;
      phone_number: string;
      email: string;
    } | null;
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

// ─── Status Stepper ──────────────────────────────────────────────────
function StatusStepper({ status }: { status: string }) {
  const isApproved = status === "Approved";
  const isAccepted = status === "Accepted";
  const isRejected = status === "Rejected";

  const steps = [
    { label: "Accepted", done: isAccepted || isApproved },
    { label: "Under Review", done: isApproved },
    { label: "Confirmed", done: isApproved },
  ];

  if (isRejected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
        <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
        <span className="text-red-500 dark:text-red-400 font-medium">Not selected for this event</span>
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
            <span className={`text-[10px] font-medium hidden sm:inline ${
              step.done
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-400 dark:text-zinc-600"
            }`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-6 sm:w-8 h-px flex-shrink-0 transition-all duration-300 ${
              steps[idx + 1]?.done ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-800"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

const tabConfig: { key: TabFilter; label: string; count?: (b: Booking[]) => number }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Confirmed" },
  { key: "accepted", label: "Pending" },
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

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Tab Row */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 border border-border rounded-xl w-fit">
        {tabConfig.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    : "bg-muted border border-border/30 text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-surface text-center p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-bold text-foreground">No bookings in this view</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTab === "all" ? "Accept leads from your inbox to get started" : `No ${tabConfig.find(t => t.key === activeTab)?.label.toLowerCase()} bookings`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const req = booking.event_requests;
            if (!req) return null;

            const isApproved = booking.status === "Approved";
            const categoryItems = req.request_items.filter(
              (item) => item.service_items?.subcategories?.category_id === booking.category_id
            );

            return (
              <div
                key={booking.id}
                className={`group relative rounded-3xl overflow-hidden bg-surface/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-border/80 transition-all duration-300 hover-lift hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-800 shadow-sm animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                  booking.status === "Rejected" ? "opacity-60" : ""
                }`}
              >
                {/* Left accent strip (Transitions width and neon shadow on hover) */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2.5 ${
                  isApproved
                    ? "bg-gradient-to-b from-emerald-500 to-teal-500 shadow-[2px_0_12px_rgba(16,185,129,0.35)]"
                    : booking.status === "Accepted"
                    ? "bg-gradient-to-b from-amber-400 to-orange-500 shadow-[2px_0_12px_rgba(245,158,11,0.35)]"
                    : "bg-border"
                }`} />

                <div className="pl-6 pr-5 py-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-base font-bold font-heading text-foreground mb-0.5">
                        {req.event_type}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {req.event_date}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span className="font-semibold">{booking.categories?.name} Service</span>
                      </div>
                    </div>
                    <StatusStepper status={booking.status} />
                  </div>

                  <div className="border-t border-border/50" />

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Scope */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Event Scope</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-zinc-700 dark:text-zinc-300 font-bold">{req.guest_count} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-zinc-700 dark:text-zinc-300 font-bold truncate block">{req.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {categoryItems.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-zinc-50 dark:bg-zinc-900 border border-border/80 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-all duration-200 hover:border-zinc-400/50">
                            {item.service_items?.name}
                            {item.quantity > 1 && <span className="text-zinc-400 font-bold ml-1">×{item.quantity}</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Customer</p>
                      {isApproved ? (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500/[0.04] to-teal-500/[0.04] border border-emerald-500/10 space-y-1.5 shadow-sm">
                          <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">{req.profiles?.full_name}</p>
                          <div className="space-y-1">
                            <a href={`tel:${req.profiles?.phone_number}`} className="text-[11px] text-muted-foreground flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold">
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {req.profiles?.phone_number}
                            </a>
                            <a href={`mailto:${req.profiles?.email}`} className="text-[11px] text-muted-foreground flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold truncate block">
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {req.profiles?.email}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-border flex items-start gap-2">
                          <svg className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Shared once the admin confirms your assignment.
                          </p>
                        </div>
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
