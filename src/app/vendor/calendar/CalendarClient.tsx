"use client";

import { useState, useMemo } from "react";

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
    profiles: {
      full_name: string;
      phone_number: string;
      email: string;
    } | null;
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

// Helper to format Date objects as YYYY-MM-DD in local time
function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Check if a YYYY-MM-DD string is in the past compared to today (midnight local time)
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
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  // Selected Date State (as YYYY-MM-DD string, initially empty so it lists general events)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  // List Tab Type: "upcoming" or "past"
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // 1. Group bookings by event_date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      const dateStr = b.event_requests?.event_date;
      if (dateStr) {
        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(b);
      }
    });
    return map;
  }, [bookings]);

  // 2. Statistics computations
  const stats = useMemo(() => {
    let upcomingConfirmed = 0;
    let upcomingAwaiting = 0;
    let pastCompleted = 0;

    bookings.forEach((b) => {
      const dateStr = b.event_requests?.event_date;
      if (!dateStr) return;

      const isPast = isPastDateString(dateStr);

      if (isPast) {
        if (b.status === "Approved") {
          pastCompleted++;
        }
      } else {
        if (b.status === "Approved") {
          upcomingConfirmed++;
        } else if (b.status === "Accepted") {
          upcomingAwaiting++;
        }
      }
    });

    return {
      upcomingConfirmed,
      upcomingAwaiting,
      pastCompleted,
    };
  }, [bookings]);

  // 3. Generate weeks of the month for the calendar grid
  const calendarCells = useMemo(() => {
    // First day of current month
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Total days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Total days in previous month
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      cells.push({
        date,
        isCurrentMonth: false,
        dateStr: formatDateStr(date),
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      cells.push({
        date,
        isCurrentMonth: true,
        dateStr: formatDateStr(date),
      });
    }

    // Padding from next month to fill standard 6 weeks (42 cells)
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      cells.push({
        date,
        isCurrentMonth: false,
        dateStr: formatDateStr(date),
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Handle month shifts
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateStr(today));
  };

  // Filtered lists of events for the right column/pane
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
      if (activeTab === "upcoming") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
  }, [bookings, selectedDateStr, bookingsByDate, activeTab]);

  return (
    <div className="space-y-6">
      {/* ─── Premium Stats Dashboard Header ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Confirmed (Emerald) */}
        <div className="p-5 bg-gradient-to-br from-surface to-emerald-500/[0.02] dark:to-emerald-500/[0.01] border-l-4 border-l-emerald-500 border-t border-r border-b border-border/80 rounded-3xl shadow-sm hover-lift hover:shadow-lg dark:hover:shadow-emerald-950/10 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">Upcoming Confirmed</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{stats.upcomingConfirmed}</h3>
          </div>
        </div>

        {/* Card 2: Awaiting (Amber) */}
        <div className="p-5 bg-gradient-to-br from-surface to-amber-500/[0.02] dark:to-amber-500/[0.01] border-l-4 border-l-amber-500 border-t border-r border-b border-border/80 rounded-3xl shadow-sm hover-lift hover:shadow-lg dark:hover:shadow-amber-950/10 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">Awaiting Client</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{stats.upcomingAwaiting}</h3>
          </div>
        </div>

        {/* Card 3: Completed (Purple) */}
        <div className="p-5 bg-gradient-to-br from-surface to-purple-500/[0.02] dark:to-purple-500/[0.01] border-l-4 border-l-purple-500 border-t border-r border-b border-border/80 rounded-3xl shadow-sm hover-lift hover:shadow-lg dark:hover:shadow-purple-950/10 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">Completed Events</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{stats.pastCompleted}</h3>
          </div>
        </div>
      </div>

      {/* ─── Calendar Split Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        {/* Decorative Blurred Glow Bubbles (Ambient Layer) */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/8 dark:bg-indigo-600/4 rounded-full blur-3xl pointer-events-none -z-10 animate-float" style={{ animationDelay: "-3s" }} />

        {/* Left Column: Glassmorphic Calendar Grid */}
        <div className="lg:col-span-7 bg-surface/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-border/85 rounded-3xl p-6 shadow-xl relative overflow-hidden animate-scale-in">
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground tracking-tight">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select a date to view scheduling details</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200"
                title="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={jumpToToday}
                className="px-3.5 py-1.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900/80 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200"
                title="Next Month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Grid Container */}
          <div>
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 text-center mb-3">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 py-1 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid (Cascade Animation) */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = cell.dateStr === todayStr;
                const dayBookings = bookingsByDate[cell.dateStr] || [];
                const hasApproved = dayBookings.some((b) => b.status === "Approved");
                const hasAccepted = dayBookings.some((b) => b.status === "Accepted");

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedDateStr === cell.dateStr) {
                        setSelectedDateStr(null);
                      } else {
                        setSelectedDateStr(cell.dateStr);
                      }
                    }}
                    style={{ animationDelay: `${idx * 12}ms`, animationFillMode: "both" }}
                    className={`animate-scale-in aspect-square w-full rounded-2xl flex flex-col items-center justify-between p-2 border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 border-transparent text-white shadow-lg shadow-purple-600/25 scale-102 hover:from-purple-500 hover:to-indigo-500"
                        : isToday
                        ? "bg-purple-500/5 border-purple-500/35 text-purple-600 dark:text-purple-400 font-extrabold shadow-sm"
                        : cell.isCurrentMonth
                        ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60"
                        : "bg-transparent border-transparent text-zinc-300 dark:text-zinc-700 pointer-events-none opacity-40"
                    }`}
                  >
                    {/* Day number */}
                    <span className="text-xs font-semibold self-start ml-0.5">
                      {cell.date.getDate()}
                    </span>

                    {/* Indicators bar (Glow markers) */}
                    {dayBookings.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-auto pb-0.5">
                        {hasApproved && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                            }`}
                            title="Confirmed Booking"
                          />
                        )}
                        {hasAccepted && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                            }`}
                            title="Awaiting Booking"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Details */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border/50 pt-4 mt-5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              Confirmed Booking
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              Awaiting Approval
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-lg border border-purple-500/35 bg-purple-500/5" />
              Today
            </span>
          </div>
        </div>

        {/* Right Column: Glassmorphic Event Details Pane */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-border/85 rounded-3xl p-6 shadow-xl relative overflow-hidden animate-scale-in" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-bold font-heading text-foreground">
                {selectedDateStr ? "Selected Day Events" : "Events Schedule"}
              </h2>
              {selectedDateStr && (
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all"
                >
                  Clear filter
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Tabs (Only show if no specific day is selected) */}
            {!selectedDateStr && (
              <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-900/60 border border-border/70 rounded-xl mb-4">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    activeTab === "upcoming"
                      ? "bg-surface text-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upcoming ({stats.upcomingConfirmed + stats.upcomingAwaiting})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    activeTab === "past"
                      ? "bg-surface text-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Completed ({stats.pastCompleted})
                </button>
              </div>
            )}

            {/* Selected Date Header indicator */}
            {selectedDateStr && (
              <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/30 border border-border/80 rounded-2xl flex items-center justify-between mb-4 animate-scale-in">
                <span className="text-xs font-bold text-foreground">
                  {new Date(selectedDateStr.split("-").map(Number)[0], selectedDateStr.split("-").map(Number)[1] - 1, selectedDateStr.split("-").map(Number)[2]).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold px-2.5 py-1 rounded-full border border-purple-500/20">
                  {eventList.length} {eventList.length === 1 ? "Event" : "Events"}
                </span>
              </div>
            )}

            {/* Event List (Staggered Slide-In) */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              {eventList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/75 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 animate-scale-in">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-foreground">No events scheduled</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {selectedDateStr ? "Select another day or clear filter" : `No ${activeTab} events found`}
                  </p>
                </div>
              ) : (
                eventList.map((booking, i) => {
                  const req = booking.event_requests;
                  if (!req) return null;

                  const isApproved = booking.status === "Approved";
                  const isPast = isPastDateString(req.event_date);
                  
                  const categoryItems = req.request_items.filter(
                    (item) => item.service_items?.subcategories?.category_id === booking.category_id
                  );

                  return (
                    <div
                      key={booking.id}
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                      className={`animate-fade-in-up p-5 rounded-2xl border bg-surface dark:bg-zinc-900/20 hover-lift shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                        isPast
                          ? "border-border opacity-70"
                          : isApproved
                          ? "border-emerald-500/25 dark:border-emerald-800/30 hover:border-emerald-500/40"
                          : "border-amber-500/25 dark:border-amber-800/30 hover:border-amber-500/40"
                      }`}
                    >
                      {/* Left accent strip */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                        isPast
                          ? "bg-zinc-300 dark:bg-zinc-700"
                          : isApproved
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`} />

                      {/* Card Body */}
                      <div className="space-y-3.5 pl-1.5">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                              {req.event_type}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {req.event_date}
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span>{booking.categories?.name}</span>
                            </p>
                          </div>
                          
                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isPast
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50"
                              : isApproved
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/25 shadow-[0_0_8px_rgba(16,185,129,0.06)]"
                              : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/25 shadow-[0_0_8px_rgba(245,158,11,0.06)]"
                          }`}>
                            {isPast ? "Completed" : isApproved ? "Confirmed" : "Awaiting Client"}
                          </span>
                        </div>

                        {/* Location and Guests Info Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-border/50 rounded-xl p-3">
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Location</span>
                            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 truncate block mt-0.5">
                              {req.location}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Guest Count</span>
                            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 block mt-0.5">
                              {req.guest_count} guests
                            </span>
                          </div>
                        </div>

                        {/* Services List inside card */}
                        {categoryItems.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Included Services</span>
                            <div className="flex flex-wrap gap-1">
                              {categoryItems.map((item, idx) => (
                                <span key={idx} className="text-[9px] px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 border border-border/80 text-zinc-600 dark:text-zinc-400 font-bold rounded-lg transition-colors hover:border-zinc-400/50">
                                  {item.service_items?.name} {item.quantity > 1 ? `(×${item.quantity})` : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Client details - unlocked if Confirmed/Approved */}
                        {isApproved ? (
                          <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
                            <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">Customer Details</span>
                            <div className="p-3 bg-gradient-to-tr from-emerald-500/[0.04] to-teal-500/[0.04] border border-emerald-500/10 rounded-xl space-y-1.5">
                              <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                {req.profiles?.full_name}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] text-muted-foreground">
                                <a href={`tel:${req.profiles?.phone_number}`} className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold">
                                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {req.profiles?.phone_number}
                                </a>
                                <a href={`mailto:${req.profiles?.email}`} className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold truncate max-w-[170px]">
                                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {req.profiles?.email}
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-border/50 pt-3 mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">
                            <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Contact info unlocks when booking is Confirmed.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
