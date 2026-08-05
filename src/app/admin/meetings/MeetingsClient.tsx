"use client";

import React, { useState, useTransition } from "react";
import {
  Video, Calendar, Clock, CheckCircle2, XCircle, Search,
  AlertCircle, ExternalLink, User, Tag, ChevronDown, X,
  Link as LinkIcon, MessageSquare, Eye, RefreshCw
} from "lucide-react";
import { scheduleEventMeeting, rejectEventMeeting } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

interface Meeting {
  id: string;
  event_id: string;
  customer_id: string;
  purpose: string;
  preferred_date: string;
  preferred_time_window: string;
  notes: string | null;
  status: "Pending" | "Scheduled" | "Rejected";
  confirmed_date: string | null;
  confirmed_time: string | null;
  meeting_link: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  } | null;
  bookings?: {
    event_name: string;
    event_type: string;
    event_date?: string;
  } | null;
}

interface MeetingsClientProps {
  initialMeetings: Meeting[];
  tableMissing?: boolean;
}

export default function MeetingsClient({ initialMeetings, tableMissing }: MeetingsClientProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Scheduled" | "Rejected">("all");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Schedule form state
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTime, setConfirmedTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const filteredMeetings = meetings.filter((m) => {
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.purpose.toLowerCase().includes(q) ||
      (m.profiles?.full_name ?? "").toLowerCase().includes(q) ||
      (m.profiles?.email ?? "").toLowerCase().includes(q) ||
      (m.bookings?.event_name ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = meetings.filter((m) => m.status === "Pending").length;
  const scheduledCount = meetings.filter((m) => m.status === "Scheduled").length;
  const rejectedCount = meetings.filter((m) => m.status === "Rejected").length;

  const handleOpenDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setConfirmedDate(meeting.confirmed_date ?? "");
    setConfirmedTime(meeting.confirmed_time ?? "");
    setMeetingLink(meeting.meeting_link ?? "");
    setAdminNotes(meeting.admin_notes ?? "");
    setActionMessage(null);
    setShowRejectConfirm(false);
  };

  const handleSchedule = () => {
    if (!selectedMeeting) return;
    if (!confirmedDate || !confirmedTime) {
      setActionMessage({ type: "error", text: "Confirmed date and time are required to schedule a meeting." });
      return;
    }
    setActionMessage(null);
    startTransition(async () => {
      try {
        await scheduleEventMeeting(
          selectedMeeting.id,
          confirmedDate,
          confirmedTime,
          meetingLink || undefined,
          adminNotes || undefined
        );
        const updated: Meeting = {
          ...selectedMeeting,
          status: "Scheduled",
          confirmed_date: confirmedDate,
          confirmed_time: confirmedTime,
          meeting_link: meetingLink || null,
          admin_notes: adminNotes || null,
        };
        setMeetings((prev) => prev.map((m) => (m.id === selectedMeeting.id ? updated : m)));
        setSelectedMeeting(updated);
        setActionMessage({ type: "success", text: "Meeting scheduled! Customer has been notified." });
      } catch (err: unknown) {
        setActionMessage({ type: "error", text: (err as Error).message || "Failed to schedule meeting." });
      }
    });
  };

  const handleReject = () => {
    if (!selectedMeeting) return;
    setActionMessage(null);
    startTransition(async () => {
      try {
        await rejectEventMeeting(selectedMeeting.id, adminNotes || undefined);
        const updated: Meeting = {
          ...selectedMeeting,
          status: "Rejected",
          admin_notes: adminNotes || null,
        };
        setMeetings((prev) => prev.map((m) => (m.id === selectedMeeting.id ? updated : m)));
        setSelectedMeeting(updated);
        setActionMessage({ type: "success", text: "Meeting request rejected. Customer has been notified." });
        setShowRejectConfirm(false);
      } catch (err: unknown) {
        setActionMessage({ type: "error", text: (err as Error).message || "Failed to reject meeting." });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3" />
            Scheduled
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in-up select-none pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              Meeting Requests
            </h1>
            {pendingCount > 0 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-light">
            Review customer consultation requests, confirm dates &amp; times, and assign meeting links.
          </p>
        </div>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-2xl leading-relaxed">
          <strong>⚠️ Database Setup Needed:</strong> The <code>event_meetings</code> table is not set up yet. Run the relevant SQL migration in your Supabase SQL Editor to enable meeting requests.
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-amber-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Awaiting Review</p>
              <h3 className="text-3xl font-light font-heading text-amber-400 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Scheduled</p>
              <h3 className="text-3xl font-light font-heading text-emerald-400 mt-1">{scheduledCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-red-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-red-400">Rejected</p>
              <h3 className="text-3xl font-light font-heading text-red-400 mt-1">{rejectedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <XCircle className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          {/* Status tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-xl overflow-x-auto scrollbar-none">
            {(["all", "Pending", "Scheduled", "Rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${statusFilter === tab
                    ? "bg-accent-gold text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab === "all" ? "All" : tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customer, purpose, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent-gold transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-16 text-xs sm:text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No meeting requests found.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Event</th>
                  <th className="pb-3 px-3">Purpose</th>
                  <th className="pb-3 px-3">Preferred Window</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-surface-raised/60 transition-colors">
                    <td className="py-4 px-3">
                      <div className="font-bold text-foreground">{meeting.profiles?.full_name ?? "—"}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{meeting.profiles?.email ?? "—"}</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-semibold text-foreground">{meeting.bookings?.event_name ?? <span className="text-muted-foreground italic">Unknown Event</span>}</div>
                      {meeting.bookings?.event_type && (
                        <div className="text-[11px] text-accent-gold font-mono mt-0.5">{meeting.bookings.event_type}</div>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-semibold text-foreground line-clamp-1">{meeting.purpose}</span>
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-[11px]">
                      <div>{meeting.preferred_date}</div>
                      <div className="text-accent-gold">{meeting.preferred_time_window}</div>
                    </td>
                    <td className="py-4 px-3">{getStatusBadge(meeting.status)}</td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => handleOpenDetail(meeting)}
                        className="px-3.5 py-1.5 bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold hover:text-black text-accent-gold text-xs font-bold rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {meeting.status === "Pending" ? "Review & Act" : "View Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-surface border-l border-border flex flex-col shadow-2xl animate-slide-in-right overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold block">
                  Meeting Request Review
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground mt-0.5">
                  {selectedMeeting.profiles?.full_name ?? "Customer"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-surface-raised transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6 flex-1">
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold border ${actionMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                >
                  {actionMessage.text}
                </div>
              )}

              {/* Current Status Banner */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Current Status</span>
                {getStatusBadge(selectedMeeting.status)}
              </div>

              {/* Customer & Event Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Customer</span>
                  <span className="text-xs font-bold text-foreground mt-0.5 block">{selectedMeeting.profiles?.full_name ?? "—"}</span>
                  <a href={`mailto:${selectedMeeting.profiles?.email}`} className="text-[11px] text-accent-gold hover:underline font-mono">
                    {selectedMeeting.profiles?.email ?? "—"}
                  </a>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Event</span>
                  <span className="text-xs font-bold text-foreground mt-0.5 block">{selectedMeeting.bookings?.event_name ?? "Unknown"}</span>
                  <span className="text-[11px] text-accent-gold">{selectedMeeting.bookings?.event_type ?? ""}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Preferred Date</span>
                  <span className="text-xs font-mono text-foreground mt-0.5 block">{selectedMeeting.preferred_date}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Preferred Time Window</span>
                  <span className="text-xs font-mono text-accent-gold mt-0.5 block">{selectedMeeting.preferred_time_window}</span>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meeting Purpose</h4>
                <div className="p-4 rounded-2xl bg-surface-raised border border-border text-xs text-foreground leading-relaxed">
                  {selectedMeeting.purpose}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedMeeting.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Notes</h4>
                  <div className="p-4 rounded-2xl bg-surface-raised border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {/* If already scheduled — show confirmed info */}
              {selectedMeeting.status === "Scheduled" && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Meeting Confirmed
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase">Confirmed Date</span>
                      <span className="text-foreground font-bold">{selectedMeeting.confirmed_date}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase">Confirmed Time</span>
                      <span className="text-foreground font-bold">{selectedMeeting.confirmed_time}</span>
                    </div>
                  </div>
                  {selectedMeeting.meeting_link && (
                    <a
                      href={selectedMeeting.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> Open Meeting Link
                    </a>
                  )}
                </div>
              )}

              {/* ACTION FORM — only for Pending */}
              {selectedMeeting.status === "Pending" && (
                <div className="space-y-4 p-4 rounded-2xl bg-surface-raised border border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                    Schedule This Meeting
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                        Confirmed Date *
                      </label>
                      <input
                        type="date"
                        value={confirmedDate}
                        onChange={(e) => setConfirmedDate(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                        Confirmed Time *
                      </label>
                      <input
                        type="time"
                        value={confirmedTime}
                        onChange={(e) => setConfirmedTime(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                      Meeting Link (Google Meet / Zoom / Teams)
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full bg-surface border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                      Internal Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Optional internal notes..."
                      className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent-gold transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Admin notes (view-only) for scheduled/rejected */}
              {selectedMeeting.status !== "Pending" && selectedMeeting.admin_notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Notes</h4>
                  <div className="p-4 rounded-2xl bg-surface-raised border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedMeeting.admin_notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — actions */}
            <div className="p-4 sm:p-6 border-t border-border bg-surface sticky bottom-0 flex items-center justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-raised transition cursor-pointer"
              >
                Close
              </button>

              {selectedMeeting.status === "Pending" && (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowRejectConfirm(true)}
                    className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSchedule}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isPending ? "Saving..." : "Approve & Schedule"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirmation Modal ── */}
      {showRejectConfirm && selectedMeeting && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setShowRejectConfirm(false)}
        >
          <div
            className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold font-heading text-foreground">Reject Meeting Request?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to reject the meeting request from{" "}
                <strong className="text-foreground">{selectedMeeting.profiles?.full_name}</strong>?
                The customer will be notified.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleReject}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
