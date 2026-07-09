"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Calendar, MapPin, CheckCircle2,
  AlertTriangle, Clock, X
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string; status: string; escalation_level: number;
  event_requests: { event_type: string; event_date: string; location: string; guest_count: number; profiles: { full_name: string } | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  "Assigned":          "bg-amber-500",
  "Accepted":          "bg-blue-500",
  "Execution Started": "bg-violet-600",
  "Execution Complete":"bg-emerald-500",
  "Closed":            "bg-zinc-500",
};

export default function OMCalendar({ assignments }: { assignments: Assignment[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<string | null>(null);

  // Map dates to assignments
  const dateMap: Record<string, Assignment[]> = {};
  assignments.forEach(a => {
    const d = a.event_requests?.event_date;
    if (d) { if (!dateMap[d]) dateMap[d] = []; dateMap[d].push(a); }
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const goToday = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); };

  const selectedDateStr = selected;
  const selectedAssignments = selectedDateStr ? (dateMap[selectedDateStr] || []) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendar grid */}
      <div className="xl:col-span-2 bg-surface border border-border/60 rounded-3xl p-6 space-y-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prev} className="p-2 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-surface-raised transition cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-light font-heading text-foreground min-w-[180px] text-center">{monthName}</h2>
            <button onClick={next} className="p-2 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-surface-raised transition cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={goToday} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider border border-border/60 rounded-xl text-muted-foreground hover:text-foreground hover:border-accent-gold/30 transition cursor-pointer">
            Today
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = dateMap[dateStr] || [];
            const isToday = dateStr === today.toISOString().split("T")[0];
            const isSelected = dateStr === selected;

            return (
              <button key={idx} onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`relative min-h-[60px] p-1.5 rounded-xl border text-left transition cursor-pointer group ${
                  isSelected   ? "border-accent-gold bg-accent-gold/8"
                  : isToday    ? "border-accent-gold/50 bg-accent-gold/5"
                  : events.length > 0 ? "border-border/80 hover:border-accent-gold/30 bg-surface-raised"
                  : "border-transparent hover:border-border/60"
                }`}
              >
                <span className={`text-[10px] font-bold font-mono ${
                  isToday ? "text-accent-gold" : isSelected ? "text-accent-gold" : events.length > 0 ? "text-foreground" : "text-muted-foreground"
                }`}>{day}</span>

                {events.slice(0, 3).map((ev, i) => (
                  <div key={i} className={`mt-0.5 h-1 rounded-full w-full ${STATUS_COLORS[ev.status] || "bg-zinc-500"}`} />
                ))}
                {events.length > 3 && (
                  <span className="text-[7px] text-muted-foreground font-mono">+{events.length - 3}</span>
                )}

                {isToday && <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-gold" />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[8px] uppercase tracking-wider text-muted-foreground pt-3 border-t border-border/40">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} /> {status}
            </span>
          ))}
        </div>
      </div>

      {/* Sidebar: selected day events + upcoming */}
      <div className="space-y-4">
        {selectedAssignments.length > 0 && (
          <div className="bg-surface border border-accent-gold/25 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[9px] uppercase tracking-widest font-bold text-accent-gold">{selectedDateStr && formatDate(selectedDateStr)}</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
            {selectedAssignments.map(a => {
              const req = a.event_requests;
              if (!req) return null;
              return (
                <Link key={a.id} href={`/operations/assignments/${a.id}`}
                  className="flex items-start gap-3 p-3 bg-background border border-border/60 hover:border-accent-gold/30 rounded-xl transition group"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${STATUS_COLORS[a.status] || "bg-zinc-500"}`} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-foreground group-hover:text-accent-gold transition truncate">{req.event_type}</p>
                    <p className="text-[9.5px] text-muted-foreground font-mono flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{req.location.split(",")[0]}</p>
                    <p className="text-[9px] text-muted-foreground">Client: {req.profiles?.full_name}</p>
                  </div>
                  {a.escalation_level > 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}

        {/* Upcoming 5 */}
        <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
          <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">All Events</h3>
          {assignments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-light py-2">No assignments yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto scrollbar-none">
              {assignments
                .filter(a => a.event_requests?.event_date)
                .sort((a, b) => new Date(a.event_requests!.event_date).getTime() - new Date(b.event_requests!.event_date).getTime())
                .map(a => {
                  const req = a.event_requests!;
                  return (
                    <Link key={a.id} href={`/operations/assignments/${a.id}`}
                      className="flex items-center gap-3 p-3 bg-background border border-border/50 hover:border-accent-gold/25 rounded-xl transition group"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[a.status] || "bg-zinc-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-foreground group-hover:text-accent-gold transition truncate">{req.event_type}</p>
                        <p className="text-[8.5px] text-muted-foreground font-mono">{formatDate(req.event_date)}</p>
                      </div>
                      {a.escalation_level > 0 && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
