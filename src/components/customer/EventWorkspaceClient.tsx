"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Users, DollarSign, Clock, FileText, 
  Phone, Mail, ArrowRight, UserCheck, Sparkles, Upload, 
  Trash2, Download, AlertCircle, Shield, CheckCircle2, 
  MessageSquare, Video, HelpCircle, Plus, X, ArrowUpRight,
  ChevronRight, CalendarDays, Compass, Info, Award, Bell,
  Edit, Lock, Unlock, ExternalLink, RefreshCw, ShieldCheck, Tag, Check, Layers
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createEditRequest, requestEventMeeting, createEventRequest } from "@/app/customer/actions";

interface EventWorkspaceClientProps {
  event: any;
  editRequests: any[];
  meetings: any[];
  initialTab?: string;
}

const MILESTONES = [
  { key: "Submitted", label: "Submitted", desc: "Event case received by SAI EVENTS." },
  { key: "Under Review", label: "Under Review", desc: "Verifying event parameters and layouts." },
  { key: "Planning", label: "Planning", desc: "Drafting schedules and services checklist." },
  { key: "Vendor Selection", label: "Vendor Selection", desc: "Sourcing verified providers under our management." },
  { key: "Coordinator Assigned", label: "Coordinator Assigned", desc: "Your dedicated Event Coordinator is allocated." },
  { key: "Preparation", label: "Preparation", desc: "Final checks, staging, and schedules sync." },
  { key: "Event Day", label: "Event Day", desc: "Live onsite execution by our operations team." },
  { key: "Completed", label: "Completed", desc: "Grand celebration executed successfully." },
  { key: "Closed", label: "Closed", desc: "Event case is officially archived." }
];

const EDIT_CATEGORIES = [
  "Event Date / Time",
  "Venue & Location",
  "Guest Count Range",
  "Target Budget",
  "Event Requirements",
  "Event Details",
  "Other"
];

export default function EventWorkspaceClient({
  event,
  editRequests,
  meetings,
  initialTab = "overview",
}: EventWorkspaceClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Edit Request Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState("");
  const [submittingEditRequest, setSubmittingEditRequest] = useState(false);

  // Meeting Request Modal State
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeWindow, setPreferredTimeWindow] = useState("10:00 AM - 1:00 PM");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [submittingMeeting, setSubmittingMeeting] = useState(false);

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active Edit Access Check
  const activeApprovedEdit = editRequests.find((r) => r.status === "approved");
  const activePendingEdit = editRequests.find((r) => r.status === "pending");

  const isPreAcceptance = event.status === "Request Submitted" || event.status === "Draft" || event.is_draft;
  const isEditingAllowed = isPreAcceptance || Boolean(activeApprovedEdit);

  // Milestone Calculation
  const getActiveMilestoneIndex = (status: string) => {
    switch (status) {
      case "Request Submitted":
      case "Submitted":
      case "Draft":
        return 0;
      case "Under Admin Review":
      case "Under Review":
        return 1;
      case "Planning":
        return 2;
      case "Vendor Selection In Progress":
      case "Sent to Vendors":
      case "Vendor Selection":
        return 3;
      case "Operational Manager Assigned":
      case "Coordinator Assigned":
        return 4;
      case "Preparation":
        return 5;
      case "Execution":
      case "Event Day":
        return 6;
      case "Completed":
        return 7;
      case "Closed":
        return 8;
      default:
        return 0;
    }
  };

  const activeMilestoneIdx = getActiveMilestoneIndex(event.status);
  const progressPercent = event.status === "Cancelled" 
    ? 0 
    : event.status === "Completed" || event.status === "Closed"
    ? 100
    : Math.round(((activeMilestoneIdx + 1) / MILESTONES.length) * 100);

  const getCountdown = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "Event is Today!";
    if (diffDays === 1) return "1 Day Left";
    return `${diffDays} Days Left`;
  };

  // Submit Edit Access Request
  const handleEditRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (selectedCategories.length === 0) {
      setError("Please select at least one category to modify.");
      return;
    }
    if (!editDescription.trim()) {
      setError("Please describe the requested changes.");
      return;
    }

    setSubmittingEditRequest(true);
    try {
      await createEditRequest(event.id, selectedCategories, editDescription);
      setSuccess("Edit access request submitted! SAI EVENTS Admin will review and enable editing shortly.");
      setShowEditModal(false);
      setSelectedCategories([]);
      setEditDescription("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit edit request.");
    } finally {
      setSubmittingEditRequest(false);
    }
  };

  // Submit Meeting Request
  const handleMeetingRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!meetingPurpose.trim()) {
      setError("Meeting purpose is required.");
      return;
    }
    if (!preferredDate) {
      setError("Preferred meeting date is required.");
      return;
    }

    setSubmittingMeeting(true);
    try {
      await requestEventMeeting(
        event.id,
        meetingPurpose,
        preferredDate,
        preferredTimeWindow,
        meetingNotes
      );
      setSuccess("Meeting request logged! Your Event Coordinator will confirm date and meeting link.");
      setShowMeetingModal(false);
      setMeetingPurpose("");
      setPreferredDate("");
      setMeetingNotes("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit meeting request.");
    } finally {
      setSubmittingMeeting(false);
    }
  };

  const coordinator = event.event_assignments?.[0]?.profiles || null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
        <div>
          <button
            onClick={() => router.push("/customer/dashboard?tab=events")}
            className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] hover:underline flex items-center gap-1 mb-2 cursor-pointer"
          >
            ← Back to My Events
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-normal font-heading text-[#173d2c] dark:text-[#f0e8db] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {event.celebrant_name ? `${event.celebrant_name} (${event.event_type})` : `${event.event_type} Workspace`}
            </h1>
            <span className="text-[7.5px] px-2.5 py-1 bg-[#a17a34]/10 text-[#9a742e] dark:bg-[#d2b56b]/10 dark:text-[#d2b56b] border border-[#a17a34]/20 dark:border-[#d2b56b]/20 font-bold uppercase tracking-[0.2em]">
              {event.status}
            </span>
          </div>
          <p className="text-xs text-[#173d2c]/55 dark:text-[#eee5d7]/45 mt-1 font-light flex items-center gap-2">
            <span>Reference: <strong className="text-[#173d2c] dark:text-[#f0e8db] font-mono">{event.reference_number || event.id.substring(0, 8)}</strong></span>
            <span>·</span>
            <span>Date: <strong className="text-[#173d2c] dark:text-[#f0e8db] font-mono">{event.event_date}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#173d2c]/40 dark:text-white/30 block">Countdown</span>
            <span className="text-sm font-bold font-mono text-[#a17a34] dark:text-[#d2b56b]">{getCountdown(event.event_date)}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMeetingModal(true)}
            className="px-4 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition shadow-md hover:brightness-110 cursor-pointer flex items-center gap-2"
          >
            <Video className="w-3.5 h-3.5" /> Request Sync
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="p-4 bg-red-100/90 border border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-100/90 border border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Workspace Sub-Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: Info },
          { id: "subevents", label: `Sub-Events (${event.customer_event_parts?.length || 0})`, icon: Layers },
          { id: "journey", label: "Event Journey", icon: Compass },
          { id: "meetings", label: `Meetings (${meetings.length})`, icon: Video },
          { id: "edits", label: "Edit Access & Changes", icon: Edit },
          { id: "activity", label: "Event Activity", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-sm"
                  : "bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/60 dark:text-[#eee5d7]/50 hover:text-[#173d2c] dark:hover:text-[#f0e8db]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB 1: EVENT OVERVIEW
      ──────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Main Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Event Specification Card */}
            <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Specification Matrix</span>
                  </div>
                  <h3 className="text-xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                    Event Parameters
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#a17a34] dark:text-[#d2b56b] px-3.5 py-1 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08]">
                  ₹{Number(event.total_budget || 0).toLocaleString("en-IN")} INR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Event Type</span>
                  <span className="font-normal font-heading text-base text-[#143d2b] dark:text-[#f0e8db] mt-0.5 block" style={{ fontFamily: '"Playfair Display", serif' }}>{event.event_type}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Event For</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5 block">{event.event_for || "Self"}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Celebrant / Couple</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5 block">{event.celebrant_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Event Date & Time</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] font-mono mt-0.5 block">
                    {event.event_date} {event.event_time && `at ${event.event_time}`} ({event.duration_hours || 4} Hrs)
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Venue & Address</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5 block leading-relaxed">{event.venue_address || event.location}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Guest Range</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] font-mono mt-0.5 block">
                    {event.min_guest_count || event.guest_count} – {event.max_guest_count || event.guest_count} Expected Guests
                  </span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Budget Range</span>
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] font-mono mt-0.5 block">
                    {event.budget_range || `₹${Number(event.total_budget || 0).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {event.special_requirements && (
                <div className="space-y-1.5 pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] text-xs">
                  <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Special Requirements / Notes</span>
                  <p className="p-3.5 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/75 dark:text-[#eee5d7]/70 font-light leading-relaxed">
                    {event.special_requirements}
                  </p>
                </div>
              )}

              {event.reference_video_url && (
                <div className="pt-2">
                  <a
                    href={event.reference_video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#a17a34] dark:text-[#d2b56b] hover:underline"
                  >
                    <Video className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                    <span>View Reference Video Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Managed Items List */}
            <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">
                Selected Services & Packages ({event.request_items?.length || 0})
              </h3>
              <div className="divide-y divide-[#173d2c]/10 dark:divide-white/[0.08] text-xs">
                {event.request_items?.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] block">{item.service_items?.name || "Service Item"}</span>
                      <span className="text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono">Qty: {item.quantity} · {item.pricing_unit || item.pricing_type}</span>
                    </div>
                    <span className="font-mono font-bold text-[#a17a34] dark:text-[#d2b56b]">
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Event Coordinator Card */}
            <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
              <span className="text-[8px] uppercase font-bold tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b] block">SAI EVENTS Operations</span>
              <h3 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Event Coordinator
              </h3>

              {coordinator ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#f3eadf] dark:bg-white/[0.03] border border-[#173d2c]/15 dark:border-white/[0.10] flex items-center justify-center text-[#9a742e] dark:text-[#d2b56b] font-bold text-sm uppercase shrink-0">
                      {coordinator.full_name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#143d2b] dark:text-[#f0e8db]">{coordinator.full_name}</h4>
                      <span className="text-[8px] font-bold text-[#9a742e] dark:text-[#d2b56b] uppercase tracking-[0.2em]">Assigned Coordinator</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-[#173d2c]/60 dark:text-[#eee5d7]/50 border-t border-[#173d2c]/10 dark:border-white/[0.08] pt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                      <span>{coordinator.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                      <span className="truncate">{coordinator.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] text-center text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 space-y-2 font-light">
                  <UserCheck className="w-6 h-6 text-[#a17a34] dark:text-[#d2b56b] mx-auto animate-pulse" />
                  <p className="text-[11px]">Pending Coordinator allocation. Our team is assigning your event manager.</p>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">
                Workspace Shortcuts
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("edits")}
                  className="w-full p-3.5 bg-[#f3eadf]/40 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 text-left font-semibold text-[#143d2b] dark:text-[#f0e8db] flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                    <span>Request Edit Access</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#173d2c]/40 dark:text-white/30" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("meetings")}
                  className="w-full p-3.5 bg-[#f3eadf]/40 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 text-left font-semibold text-[#143d2b] dark:text-[#f0e8db] flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                    <span>Request Event Meeting</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: SUB-EVENTS & FUNCTION LOCATIONS
      ──────────────────────────────────────────────────────── */}
      {activeTab === "subevents" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Function Breakdown</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                Selected Sub-Events & Venues
              </h2>
              <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 mt-1 font-light">
                Overview of ceremonies, function locations, dates, and required service modules for {event.event_type}.
              </p>
            </div>
          </div>

          {event.customer_event_parts && event.customer_event_parts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.customer_event_parts.map((part: any, idx: number) => (
                <div
                  key={part.id || idx}
                  className="p-6 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-3">
                    <div>
                      <span className="text-[8px] uppercase font-bold tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b] block">Function #{idx + 1}</span>
                      <h3 className="text-lg font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {part.event_part_name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-[#143d2b]/10 text-[#143d2b] dark:bg-[#d2b56b]/10 dark:text-[#d2b56b] font-mono text-[9px] font-bold uppercase tracking-wider">
                      {part.event_date || event.event_date || "Date Pending"}
                    </span>
                  </div>

                  {/* Function Location / Venue Address */}
                  <div className="space-y-1">
                    <span className="text-[8.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-wider block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                      Function Venue / Location
                    </span>
                    <p className="text-xs font-semibold text-[#143d2b] dark:text-[#f0e8db] pl-4.5 leading-relaxed">
                      {part.venue_location || part.venue_address || part.venue_name || event.venue_address || "Venue to be finalized"}
                    </p>
                  </div>

                  {/* Required Service Modules */}
                  <div className="space-y-2 pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                    <span className="text-[8.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-wider block">
                      Required Service Modules
                    </span>
                    {part.required_services && part.required_services.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {part.required_services.map((srv: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 bg-[#f3eadf] dark:bg-white/[0.04] border border-[#173d2c]/15 dark:border-white/10 text-[10px] font-semibold text-[#143d2b] dark:text-[#f0e8db]"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {["Decor & Stage", "Food & Catering"].map((srv, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 bg-[#f3eadf] dark:bg-white/[0.04] border border-[#173d2c]/15 dark:border-white/10 text-[10px] font-semibold text-[#143d2b] dark:text-[#f0e8db]"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08]">
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 italic">
                No specific sub-events listed for this celebration. Main event venue: {event.venue_address || event.location}
              </p>
            </div>
          )}

          {/* Selected Food & Catering Menu & Services Section */}
          {event.request_items && event.request_items.length > 0 && (
            <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Confirmed Menu & Services</span>
                </div>
                <h3 className="text-xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Selected Food & Service Catalog Items
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.request_items.map((item: any) => (
                  <div key={item.id} className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] text-xs block">{item.service_items?.name || "Service Item"}</span>
                      <span className="text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono">Qty: {item.quantity} · {item.pricing_unit || item.pricing_type}</span>
                    </div>
                    <span className="font-mono font-bold text-[#a17a34] dark:text-[#d2b56b] text-xs">
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: EVENT JOURNEY (TIMELINE FOR THIS EVENT)
      ──────────────────────────────────────────────────────── */}
      {activeTab === "journey" && (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Automated Case Journey</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Event Milestone Timeline
              </h2>
              <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light mt-1">
                Track execution milestones for your <strong className="text-[#143d2b] dark:text-[#f0e8db]">{event.event_type}</strong> celebration.
              </p>
            </div>

            {/* Stepper Timeline Bar */}
            <div className="relative py-4">
              <div className="space-y-6">
                {MILESTONES.map((m, idx) => {
                  const isCurrent = activeMilestoneIdx === idx;
                  const isCompleted = activeMilestoneIdx > idx;

                  return (
                    <div key={m.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-mono transition-all ${
                            isCurrent
                              ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-md"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/40 dark:text-white/30"
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < MILESTONES.length - 1 && (
                          <div className={`w-[1px] h-10 my-1 ${isCompleted ? "bg-emerald-600" : "bg-[#173d2c]/15 dark:bg-white/10"}`} />
                        )}
                      </div>

                      <div className="pt-1 space-y-0.5">
                        <h4 className={`text-sm font-semibold ${isCurrent ? "text-[#a17a34] dark:text-[#d2b56b]" : isCompleted ? "text-[#143d2b] dark:text-[#f0e8db]" : "text-[#173d2c]/40 dark:text-white/30"}`}>
                          {m.label}
                        </h4>
                        <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 3: MEETINGS FOR THIS EVENT
      ──────────────────────────────────────────────────────── */}
      {activeTab === "meetings" && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Staging Consultations</span>
              </div>
              <h3 className="text-xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Event Consultation Meetings
              </h3>
              <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light">
                Schedule video calls or staging discussions for this event with your Coordinator.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMeetingModal(true)}
              className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Request Meeting
            </button>
          </div>

          {meetings.length === 0 ? (
            <div className="p-12 border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] bg-[#fbf7f0] dark:bg-[#161813] text-center space-y-3">
              <Video className="w-8 h-8 text-[#a17a34] dark:text-[#d2b56b] mx-auto" />
              <h4 className="text-sm font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>No Meetings Requested Yet</h4>
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 max-w-sm mx-auto font-light leading-relaxed">
                Click "Request Meeting" to schedule a sync with your SAI EVENTS Operational Manager.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((m) => (
                <div key={m.id} className="p-5 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Meeting Purpose</span>
                      <h4 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-1" style={{ fontFamily: '"Playfair Display", serif' }}>{m.purpose}</h4>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.18em] border ${
                        m.status === "Scheduled"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : m.status === "Rejected"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08] font-mono">
                    <div>
                      <span className="text-[#173d2c]/40 dark:text-white/30 block text-[8px] uppercase font-bold tracking-[0.18em]">Preferred Window</span>
                      <span className="text-[#143d2b] dark:text-[#f0e8db] font-semibold">{m.preferred_date} ({m.preferred_time_window})</span>
                    </div>
                    {m.confirmed_date && (
                      <div>
                        <span className="text-[#173d2c]/40 dark:text-white/30 block text-[8px] uppercase font-bold tracking-[0.18em]">Confirmed Time</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{m.confirmed_date} at {m.confirmed_time}</span>
                      </div>
                    )}
                  </div>

                  {m.meeting_link && (
                    <div className="pt-2">
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow inline-flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meeting Link
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 4: EDIT ACCESS & CHANGES FOR THIS EVENT
      ──────────────────────────────────────────────────────── */}
      {activeTab === "edits" && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          {/* Status Explanation Card */}
          <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Event Security Policy</span>
                </div>
                <h3 className="text-xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>Edit Access Status</h3>
              </div>
              {isEditingAllowed ? (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[8px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" /> Editing Unlocked
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[8px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Editing Locked
                </span>
              )}
            </div>

            <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light leading-relaxed">
              {isPreAcceptance ? (
                "This event is currently in pending review status. You may directly modify permitted event specifications."
              ) : activeApprovedEdit ? (
                "Edit access has been enabled by the SAI EVENTS team for this event. Submit your changes when finished."
              ) : activePendingEdit ? (
                "Your edit access request is currently pending review by our Operations Team."
              ) : (
                "This event has already been accepted by our team. Request edit access if you need to make changes to dates, venue, guest count, or budget."
              )}
            </p>

            <div className="pt-2">
              {isEditingAllowed ? (
                <button
                  type="button"
                  onClick={() => router.push(`/customer/request`)}
                  className="px-6 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Edit className="w-3.5 h-3.5" /> Modify Event Parameters Now
                </button>
              ) : activePendingEdit ? (
                <button
                  disabled
                  className="px-6 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl opacity-80 cursor-not-allowed flex items-center gap-2 uppercase tracking-wider"
                >
                  <Clock className="w-4 h-4" /> Request Pending Admin Review
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3 bg-accent-gold text-black font-bold text-xs uppercase tracking-wider rounded-xl transition shadow cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Request Edit Access
                </button>
              )}
            </div>
          </div>

          {/* Edit Request History */}
          {editRequests.length > 0 && (
            <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b]">
                Edit Request History
              </h4>
              <div className="space-y-3 text-xs">
                {editRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">Requested Categories: {req.requested_categories?.join(", ")}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : req.status === "rejected"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light text-[11px] leading-relaxed">{req.description}</p>
                    <div className="text-[9px] text-[#173d2c]/40 dark:text-white/30 font-mono pt-1">
                      Submitted on {formatDate(req.requested_at || req.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 5: ACTIVITY LOG
      ──────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Operational Audit Trail</span>
              </div>
              <h3 className="text-2xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>Customer Activity Log</h3>
              <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light mt-1">
                Audit timeline of major operational milestones registered for this event.
              </p>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
                <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">Event Case Registered</span>
                <span className="text-[#a17a34] dark:text-[#d2b56b] font-mono text-[10px] font-bold">{formatDate(event.created_at)}</span>
              </div>
              {event.event_assignments?.length > 0 && (
                <div className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">Operational Manager Allocated</span>
                  <span className="text-[#a17a34] dark:text-[#d2b56b] font-mono text-[10px] font-bold">{formatDate(event.event_assignments[0].created_at || event.created_at)}</span>
                </div>
              )}
              {editRequests.map((e) => (
                <div key={e.id} className="p-4 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
                  <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">Edit Access Requested ({e.status})</span>
                  <span className="text-[#a17a34] dark:text-[#d2b56b] font-mono text-[10px] font-bold">{formatDate(e.requested_at || e.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Request Edit Access Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleEditRequestSubmit} className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b]">SAI EVENTS Operations</span>
                <h3 className="text-lg font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>Request Edit Access</h3>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 text-[#173d2c]/60 dark:text-[#eee5d7]/50 hover:text-[#143d2b] dark:hover:text-[#f0e8db]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50 uppercase text-[9.5px] tracking-wider">Select Categories to Modify *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EDIT_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label key={cat} className={`p-2.5 border text-xs font-semibold flex items-center gap-2 cursor-pointer transition ${
                        isChecked ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] border-transparent" : "bg-[#f3eadf]/50 dark:bg-white/[0.02] border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/70 dark:text-[#eee5d7]/60"
                      }`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCategories((prev) => [...prev, cat]);
                            else setSelectedCategories((prev) => prev.filter((c) => c !== cat));
                          }}
                          className="w-4 h-4 text-[#a17a34] focus:ring-[#a17a34]/30 accent-[#a17a34]"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50 uppercase text-[9.5px] tracking-wider">Describe Requested Changes *</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. Need to update venue to Novotel and change expected guest count from 200 to 350..."
                  className="w-full p-3.5 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] placeholder:text-[#173d2c]/35 dark:placeholder:text-white/30 resize-none font-light leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-bold uppercase tracking-wider">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEditRequest}
                className="px-6 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:brightness-110 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingEditRequest ? "Submitting..." : "Submit Edit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── REQUEST MEETINGS MODAL ─── */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleMeetingRequestSubmit} className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b]">SAI EVENTS Operations</span>
                <h3 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Request Event Sync Meeting
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMeetingModal(false)} 
                className="text-[#173d2c]/50 dark:text-[#eee5d7]/40 hover:text-[#143d2b] dark:hover:text-[#f0e8db] transition cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Meeting Purpose *</label>
                <input
                  type="text"
                  required
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  placeholder="e.g. Venue decor staging & catering menu sync"
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] text-xs font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Time Window *</label>
                  <select
                    value={preferredTimeWindow}
                    onChange={(e) => setPreferredTimeWindow(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] cursor-pointer text-xs"
                  >
                    <option value="10:00 AM - 1:00 PM" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">10:00 AM - 1:00 PM</option>
                    <option value="2:00 PM - 5:00 PM" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">2:00 PM - 5:00 PM</option>
                    <option value="5:00 PM - 8:00 PM" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">5:00 PM - 8:00 PM</option>
                    <option value="Evening Call (After 6:00 PM)" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">Evening Call (After 6:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Additional Notes / Specific Questions</label>
                <textarea
                  rows={3}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Mention any specific topics or participants..."
                  className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] font-light text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="px-4.5 py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingMeeting}
                className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md disabled:opacity-50"
              >
                {submittingMeeting ? "Submitting..." : "Submit Meeting Request"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
