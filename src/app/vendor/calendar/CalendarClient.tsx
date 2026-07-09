"use client";

import { useState, useMemo } from "react";
import { 
  Calendar, MapPin, Users, CheckCircle2, AlertCircle, X,
  Clock, ChevronLeft, ChevronRight, Phone, Mail, Award, Lock, ShieldCheck
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  status: string; // 'Accepted' | 'Approved'
  created_at: string;
  category_id: string;
  categories: { name: string } | null;
  event_requests: {
    id: string;
    event_type: string;
    event_date: string; // YYYY-MM-DD
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
      unit_price: number;
      pricing_type: string;
      service_items: {
        name: string;
        subcategory_id: string;
        subcategories: { category_id: string } | null;
      } | null;
    }[];
  } | null;
}

type TabType = "upcoming" | "past";

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPastDateString(dateStr: string): boolean {
  const parts = dateStr.split("-");
  const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarClient({ bookings }: { bookings: Booking[] }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const todayStr = useMemo(() => formatDateStr(new Date()), []);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Group bookings
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      const dateStr = b.event_requests?.event_date;
      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(b);
      }
    });
    return map;
  }, [bookings]);

  // Count stats
  const stats = useMemo(() => {
    let upcomingConfirmed = 0;
    let upcomingAwaiting = 0;
    let pastCompleted = 0;

    bookings.forEach((b) => {
      const dateStr = b.event_requests?.event_date;
      if (!dateStr) return;
      const isPast = isPastDateString(dateStr);

      if (isPast) {
        if (b.status === "Approved") pastCompleted++;
      } else {
        if (b.status === "Approved") upcomingConfirmed++;
        else if (b.status === "Accepted") upcomingAwaiting++;
      }
    });

    return { upcomingConfirmed, upcomingAwaiting, pastCompleted };
  }, [bookings]);

  // Calendar cell builder
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
    const cells: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      cells.push({ date, isCurrentMonth: false, dateStr: formatDateStr(date) });
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      cells.push({ date, isCurrentMonth: true, dateStr: formatDateStr(date) });
    }

    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      cells.push({ date, isCurrentMonth: false, dateStr: formatDateStr(date) });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateStr(today));
  };

  const eventList = useMemo(() => {
    if (selectedDateStr) {
      return bookingsByDate[selectedDateStr] || [];
    }

    return bookings.filter((b) => {
      const dateStr = b.event_requests?.event_date;
      if (!dateStr) return false;
      const isPast = isPastDateString(dateStr);
      return activeTab === "past" ? isPast : !isPast;
    }).sort((a, b) => {
      const dateA = a.event_requests?.event_date || "";
      const dateB = b.event_requests?.event_date || "";
      return activeTab === "upcoming" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    });
  }, [bookings, selectedDateStr, bookingsByDate, activeTab]);

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-8">
      
      {/* ── Visual dashboard metrics widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Confirmed Projects", count: stats.upcomingConfirmed, border: "border-l-emerald-500", dot: "bg-emerald-500", text: "Verified schedule files" },
          { label: "Awaiting Client Review", count: stats.upcomingAwaiting, border: "border-l-amber-500", dot: "bg-amber-500", text: "Pending final locks" },
          { label: "Completed Handovers", count: stats.pastCompleted, border: "border-l-purple-500", dot: "bg-purple-500", text: "Past catalog bookings" },
        ].map((statCard, idx) => (
          <div
            key={idx}
            className={`p-6 bg-surface border border-border/80 ${statCard.border} border-l-4 rounded-3xl shadow-sm hover-lift transition-all flex items-center justify-between group`}
          >
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground block">{statCard.label}</span>
              <span className="text-3xl font-light font-heading text-foreground block">{statCard.count}</span>
              <span className="text-[10px] text-muted-foreground font-light block">{statCard.text}</span>
            </div>
            <span className={`w-3.5 h-3.5 rounded-full ${statCard.dot} opacity-20 group-hover:opacity-60 transition`} />
          </div>
        ))}
      </div>

      {/* ── Two-Column Scheduling Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Calendar Grid area (7/12 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="space-y-0.5">
              <h2 className="text-xl font-light font-heading text-foreground tracking-tight">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <p className="text-[10px] text-muted-foreground font-light">Select coordinates in schedule map</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={jumpToToday}
                className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition hover:scale-105 active:scale-95"
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 text-center">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-[9px] font-bold text-muted-foreground/60 py-1 uppercase tracking-widest font-mono">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = cell.dateStr === todayStr;
                const dayBookings = bookingsByDate[cell.dateStr] || [];
                const hasApproved = dayBookings.some((b) => b.status === "Approved");
                const hasAccepted = dayBookings.some((b) => b.status === "Accepted");

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDateStr(isSelected ? null : cell.dateStr)}
                    className={`aspect-square w-full rounded-2xl flex flex-col items-center justify-between p-2.5 border transition duration-250 cursor-pointer ${
                      isSelected
                        ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/25 scale-102 font-black"
                        : isToday
                        ? "bg-accent-gold/10 border-accent-gold/40 text-accent-gold font-extrabold"
                        : cell.isCurrentMonth
                        ? "bg-background border-border/60 hover:border-accent-gold/20 text-foreground"
                        : "bg-transparent border-transparent text-muted-foreground opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-xs font-semibold self-start">{cell.date.getDate()}</span>
                    
                    {dayBookings.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-auto pb-0.5">
                        {hasApproved && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-emerald-500 animate-pulse"}`} />
                        )}
                        {hasAccepted && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-amber-500"}`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-5 text-[9px] uppercase tracking-wider text-muted-foreground pt-5 border-t border-border/40 mt-6 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed booking</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Awaiting check</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-lg border border-accent-gold/40 bg-accent-gold/15" /> Current Today</span>
          </div>
        </div>

        {/* Right Agenda list area (5/12 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface border border-border/80 rounded-[32px] p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">
                  {selectedDateStr ? "Day Schedule Detail" : "All Event Schedules"}
                </h3>
                {selectedDateStr && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateStr(null)}
                    className="text-[10px] text-accent-gold font-bold hover:underline cursor-pointer flex items-center gap-1 transition"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {!selectedDateStr && (
                <div className="flex p-0.5 bg-background border border-border/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer ${
                      activeTab === "upcoming" ? "bg-surface text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upcoming ({stats.upcomingConfirmed + stats.upcomingAwaiting})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("past")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer ${
                      activeTab === "past" ? "bg-surface text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Completed ({stats.pastCompleted})
                  </button>
                </div>
              )}

              {selectedDateStr && (
                <div className="px-4 py-3 bg-background border border-border/80 rounded-2xl flex items-center justify-between text-xs font-mono text-foreground font-bold animate-scale-in">
                  <span>{new Date(selectedDateStr.split("-").map(Number)[0], selectedDateStr.split("-").map(Number)[1] - 1, selectedDateStr.split("-").map(Number)[2]).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="text-[9px] bg-accent-gold/10 text-accent-gold border border-accent-gold/25 px-2.5 py-0.5 rounded-full font-black">
                    {eventList.length} File{eventList.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-none pt-1">
                {eventList.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-background/30 text-xs">
                    <Calendar className="w-8 h-8 text-muted-foreground/35 mx-auto mb-3" />
                    <p className="font-bold text-foreground">No bookings cataloged</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Select other dates or toggle calendar navigation</p>
                  </div>
                ) : (
                  eventList.map((booking) => {
                    const req = booking.event_requests;
                    if (!req) return null;
                    const isApproved = booking.status === "Approved";
                    const isPast = isPastDateString(req.event_date);
                    const categoryItems = req.request_items.filter(
                      (item) => item.service_items?.subcategories?.category_id === booking.category_id
                    );
                    const om = req.event_assignments?.[0]?.profiles;

                    return (
                      <div
                        key={booking.id}
                        className={`p-5 rounded-2xl border bg-background hover:border-accent-gold/20 transition duration-300 relative overflow-hidden group shadow-sm flex flex-col justify-between gap-4 ${
                          isPast ? "opacity-60 border-border/40" : "border-border/80 shadow-sm"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h4 className="text-xs font-bold text-foreground leading-normal">{req.event_type}</h4>
                              <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                {req.event_date} · {booking.categories?.name}
                              </p>
                            </div>
                            <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                              isPast
                                ? "bg-zinc-150 border-zinc-200 text-zinc-500"
                                : isApproved
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {isPast ? "Completed" : isApproved ? "Confirmed" : "Awaiting Vetting"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-surface/50 border border-border/80 rounded-xl p-3 text-[10px] font-mono text-muted-foreground">
                            <div>
                              <span className="text-[7.5px] uppercase tracking-wider text-muted-foreground/60 block">Staging Venue</span>
                              <span className="text-foreground font-bold truncate block mt-0.5">{req.location.split(",")[0]}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] uppercase tracking-wider text-muted-foreground/60 block">Scope Size</span>
                              <span className="text-foreground font-bold block mt-0.5">{req.guest_count} guests</span>
                            </div>
                          </div>

                          {categoryItems.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {categoryItems.map((item, idx) => (
                                <span key={idx} className="px-2.5 py-0.5 bg-surface border border-border text-[9.5px] font-semibold text-foreground/80 rounded-lg">
                                  {item.service_items?.name} {item.quantity > 1 ? `×${item.quantity}` : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Coordinator details inside Agenda card */}
                        {isApproved && om && (
                          <div className="border-t border-border/40 pt-3.5 space-y-2">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block font-mono">Assigned coordinator</span>
                            <div className="p-3 bg-surface/50 border border-border/80 rounded-xl space-y-1.5 text-[9.5px] font-mono text-muted-foreground">
                              <p className="font-bold text-xs text-foreground font-sans">{om.full_name}</p>
                              <div className="flex flex-col gap-1">
                                <a href={`tel:${om.phone_number}`} className="hover:text-accent-gold flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-accent-gold" /> {om.phone_number}
                                </a>
                                <a href={`mailto:${om.email}`} className="hover:text-accent-gold flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-accent-gold shrink-0" /> {om.email}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Availability status detail */}
            <div className="p-4 bg-background border border-border/80 rounded-2xl flex items-start gap-3 mt-6 text-xs text-muted-foreground leading-relaxed font-light">
              <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
              <p className="text-[10px]">
                Your availability schedule is locked automatically upon staging confirmations. For overrides, sync with your coordinator.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
