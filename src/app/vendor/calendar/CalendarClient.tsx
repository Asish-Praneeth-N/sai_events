"use client";

import { useState } from "react";
import { Profile, VendorPersonalSchedule, VendorAvailabilityStatus } from "@/lib/types";
import { updateVendorAvailability, savePersonalSchedule, deletePersonalSchedule } from "../actions";
import {
  Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Trash2,
  AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight,
  Briefcase, Coffee, Wrench, Building, Heart, Sparkles, AlertTriangle
} from "lucide-react";

interface Props {
  bookings: any[];
  personalSchedules: VendorPersonalSchedule[];
  profile: Profile | null;
}

export default function CalendarClient({ bookings, personalSchedules, profile }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Active status state
  const [availabilityStatus, setAvailabilityStatus] = useState<VendorAvailabilityStatus>(
    (profile?.availability_status as VendorAvailabilityStatus) || "Available"
  );
  const maxCapacity = profile?.max_daily_capacity || 5;

  // Selected date schedule drawer
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Add Personal Entry Modal
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [pTitle, setPTitle] = useState("");
  const [pType, setPType] = useState<"Leave" | "Personal Function" | "Equipment Maintenance" | "Office Work" | "Family Function">("Leave");
  const [pStartDate, setPStartDate] = useState("");
  const [pEndDate, setPEndDate] = useState("");
  const [pStartTime, setPStartTime] = useState("");
  const [pEndTime, setPEndTime] = useState("");
  const [pNotes, setPNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: VendorAvailabilityStatus) => {
    setAvailabilityStatus(newStatus);
    try {
      await updateVendorAvailability(newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pStartDate || !pEndDate) return;

    setLoading(true);
    setError(null);
    try {
      await savePersonalSchedule({
        title: pTitle,
        entryType: pType,
        startDate: pStartDate,
        endDate: pEndDate,
        startTime: pStartTime,
        endTime: pEndTime,
        notes: pNotes,
      });
      setShowPersonalModal(false);
      setPTitle("");
      setPNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to save schedule block.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this personal schedule block?")) return;
    setLoading(true);
    try {
      await deletePersonalSchedule(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format Date -> YYYY-MM-DD
  const formatDateKey = (d: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Day Drawer items
  const dayBookings = selectedDateStr
    ? bookings.filter((b) => b.event_requests?.event_date === selectedDateStr)
    : [];

  const dayPersonal = selectedDateStr
    ? personalSchedules.filter((p) => selectedDateStr >= p.start_date && selectedDateStr <= p.end_date)
    : [];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="cursor-pointer text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header: Availability Toggles & Actions */}
      <div className="p-5 rounded-3xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest">Real-Time Availability</span>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(["Available", "Not Available", "Busy", "Leave", "In Work"] as VendorAvailabilityStatus[]).map((st) => {
              const isSelected = availabilityStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? st === "Available"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : st === "Busy"
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                        : st === "Leave"
                        ? "bg-purple-500 text-white shadow-md"
                        : st === "In Work"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-red-500 text-white shadow-md"
                      : "bg-background hover:bg-surface-raised border border-border text-muted-foreground"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    st === "Available" ? "bg-emerald-400" : st === "Busy" ? "bg-amber-400" : st === "Leave" ? "bg-purple-400" : st === "In Work" ? "bg-blue-400" : "bg-red-400"
                  }`} />
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const todayStr = new Date().toISOString().split("T")[0];
            setPStartDate(todayStr);
            setPEndDate(todayStr);
            setShowPersonalModal(true);
          }}
          className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Personal Schedule Block
        </button>
      </div>

      {/* Calendar Navigation & Grid */}
      <div className="p-6 rounded-3xl bg-surface border border-border space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-heading text-foreground">
              {monthNames[month]} {year}
            </h2>
            <span className="text-xs text-muted-foreground font-mono bg-background border border-border px-3 py-1 rounded-xl">
              Max Daily Capacity: <strong className="text-accent-gold">{maxCapacity} Events</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-background hover:bg-surface-raised border border-border text-foreground transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-background hover:bg-surface-raised border border-border text-foreground transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
              {day}
            </div>
          ))}

          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-28 rounded-2xl bg-background/20 border border-transparent opacity-30" />
          ))}

          {/* Month day cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = formatDateKey(dayNum);

            const dayEvts = bookings.filter((b) => b.event_requests?.event_date === dateStr);
            const dayPers = personalSchedules.filter((p) => dateStr >= p.start_date && dateStr <= p.end_date);

            const evtCount = dayEvts.length;
            const isFull = evtCount >= maxCapacity;
            const isSelected = selectedDateStr === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-28 rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-accent-gold/15 border-accent-gold shadow-md"
                    : isFull
                    ? "bg-amber-500/10 border-amber-500/30"
                    : evtCount > 0
                    ? "bg-surface-raised border-accent-gold/40"
                    : dayPers.length > 0
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-background border-border hover:border-accent-gold/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-foreground">{dayNum}</span>
                  {isFull && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Capacity
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {evtCount > 0 && (
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-gold text-black">
                      {evtCount} {evtCount === 1 ? "Event" : "Events"}
                    </div>
                  )}
                  {dayPers.length > 0 && (
                    <div className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate">
                      {dayPers[0].title}
                    </div>
                  )}
                  {evtCount === 0 && dayPers.length === 0 && (
                    <span className="text-[10px] text-muted-foreground/50 font-light block italic">No Events</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DAY SCHEDULE DRAWER ── */}
      {selectedDateStr && (
        <div className="p-6 rounded-3xl bg-surface border border-accent-gold/40 space-y-5 shadow-xl animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest">Day Schedule Breakdown</span>
              <h3 className="text-lg font-bold text-foreground font-heading">Schedule for {selectedDateStr}</h3>
            </div>
            <button
              onClick={() => setSelectedDateStr(null)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-surface-raised cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confirmed Events Section */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Confirmed Events ({dayBookings.length})
              </span>
              {dayBookings.length === 0 ? (
                <div className="p-4 rounded-2xl bg-background border border-border text-xs text-muted-foreground">
                  No confirmed events on this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {dayBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-background border border-accent-gold/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{b.event_requests?.event_type}</h4>
                        <span className="text-xs font-mono font-bold text-accent-gold">{b.event_requests?.event_time || "All Day"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent-gold" /> {b.event_requests?.location}
                      </p>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Guests: {b.event_requests?.guest_count} People
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Schedule Entries Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Personal Schedule & Leaves ({dayPersonal.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPStartDate(selectedDateStr);
                    setPEndDate(selectedDateStr);
                    setShowPersonalModal(true);
                  }}
                  className="text-xs font-bold text-accent-gold hover:underline cursor-pointer"
                >
                  + Add Block
                </button>
              </div>

              {dayPersonal.length === 0 ? (
                <div className="p-4 rounded-2xl bg-background border border-border text-xs text-muted-foreground">
                  No personal schedule blocks registered on this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {dayPersonal.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-[9px] font-bold uppercase tracking-widest text-purple-300">
                            {p.entry_type}
                          </span>
                          <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                        </div>
                        {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                        <span className="text-[10px] font-mono text-purple-300 block">
                          Dates: {p.start_date} to {p.end_date} {p.start_time && `(${p.start_time} - ${p.end_time})`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeletePersonal(p.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PERSONAL SCHEDULE BLOCK MODAL ── */}
      {showPersonalModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-accent-gold/40 rounded-3xl max-w-md w-full overflow-hidden p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add Personal Schedule Block</h3>
              <button onClick={() => setShowPersonalModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family Function / Equipment Maintenance"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Schedule Category *</label>
                <select
                  value={pType}
                  onChange={(e: any) => setPType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                >
                  <option value="Leave">Leave / Out of Office</option>
                  <option value="Personal Function">Personal Function</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Office Work">Office Work / Admin</option>
                  <option value="Family Function">Family Function</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={pStartDate}
                    onChange={(e) => setPStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">End Date *</label>
                  <input
                    type="date"
                    required
                    value={pEndDate}
                    onChange={(e) => setPEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={pStartTime}
                    onChange={(e) => setPStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">End Time (Optional)</label>
                  <input
                    type="time"
                    value={pEndTime}
                    onChange={(e) => setPEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPersonalModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md"
                >
                  {loading ? "Saving..." : "Save Schedule Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
