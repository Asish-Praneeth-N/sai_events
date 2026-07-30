"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, MapPin, Users, DollarSign, Clock, FileText, 
  Phone, Mail, ArrowRight, UserCheck, Sparkles, Upload, 
  Trash2, Download, AlertCircle, Shield, CheckCircle2, 
  MessageSquare, Video, HelpCircle, Plus, X, ArrowUpRight,
  ChevronRight, CalendarDays, Compass, Info, Award, Bell
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cancelEventRequest, uploadCustomerDocument, deleteCustomerDocument } from "../actions";

interface RequestItem {
  quantity: number;
  unit_price: number;
  pricing_type: string;
  service_items: {
    name: string;
  } | null;
}

interface EventAssignment {
  id: string;
  expected_completion: string | null;
  handover_notes: string | null;
  profiles: {
    full_name: string;
    phone_number: string;
    email: string;
  } | null;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

interface MilestoneTimeline {
  id: string;
  milestone_name: string;
  description: string;
  is_internal: boolean;
  created_at: string;
}

interface EventRequest {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  status: string;
  total_budget: number;
  created_at: string;
  request_items: RequestItem[];
  event_assignments: EventAssignment[];
  documents: Document[];
  timelines: MilestoneTimeline[];
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: string;
}

interface DashboardListProps {
  requests: EventRequest[];
  notifications: Notification[];
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

export default function DashboardList({ requests, notifications }: DashboardListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const [activeEventId, setActiveEventId] = useState<string | null>(
    requests.length > 0 ? requests[0].id : null
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Document Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState("inspiration");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Document filter category
  const [activeDocCategory, setActiveDocCategory] = useState("all");

  // Meetings Request Modal States
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [meetingType, setMeetingType] = useState("video");
  const [requestingMeeting, setRequestingMeeting] = useState(false);

  const activeRequest = requests.find((r) => r.id === activeEventId) || null;

  const openCancelModal = (id: string) => {
    setCancelTargetId(id);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTargetId) return;
    if (!cancellationReason.trim()) {
      setError("Cancellation reason is mandatory.");
      return;
    }

    setCancellingId(cancelTargetId);
    setError(null);
    try {
      await cancelEventRequest(cancelTargetId, cancellationReason.trim());
      setSuccess("Your event request has been cancelled.");
      setShowCancelModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to cancel event request.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !uploadFileName.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const mockUrl = `/documents/${Date.now()}_${encodeURIComponent(uploadFileName)}`;
      await uploadCustomerDocument(
        activeRequest.id,
        uploadFileName,
        mockUrl,
        uploadFileType
      );
      
      setSuccess("Document reference uploaded successfully.");
      setShowUploadModal(false);
      setUploadFileName("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document reference?")) return;
    setError(null);
    try {
      await deleteCustomerDocument(docId);
      setSuccess("Document reference deleted successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete document.");
    }
  };

  const handleRequestMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestingMeeting(true);
    setTimeout(() => {
      setSuccess("Meeting request logged successfully! Your coordinator will confirm shortly.");
      setShowMeetingModal(false);
      setMeetingDate("");
      setMeetingTime("");
      setMeetingNotes("");
      setRequestingMeeting(false);
    }, 1000);
  };

  const getActiveMilestoneIndex = (status: string) => {
    switch (status) {
      case "Request Submitted":
      case "Submitted":
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
        return -1; 
    }
  };

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

  // Sort events: Upcoming first, completed monochrome, cancelled muted
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const getScore = (status: string) => {
        if (status === "Cancelled") return 3;
        if (status === "Completed" || status === "Closed") return 2;
        if (status === "Draft") return 1;
        return 0; // Active / Upcoming
      };
      const scoreA = getScore(a.status);
      const scoreB = getScore(b.status);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
  }, [requests]);

  // Active milestone and progress calculations
  const activeMilestoneIdx = activeRequest ? getActiveMilestoneIndex(activeRequest.status) : 0;
  const progressPercent = activeRequest 
    ? activeRequest.status === "Cancelled" 
      ? 0 
      : activeRequest.status === "Completed" || activeRequest.status === "Closed"
      ? 100
      : Math.round(((activeMilestoneIdx + 1) / MILESTONES.length) * 100)
    : 0;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    if (!activeRequest) return [];
    if (activeDocCategory === "all") return activeRequest.documents || [];
    return (activeRequest.documents || []).filter(d => d.file_type === activeDocCategory);
  }, [activeRequest, activeDocCategory]);

  return (
    <div className="space-y-8 select-none">
      
      {/* ── Custom Status & Alerts banner ── */}
      {error && (
        <div className="p-4.5 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4.5 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {requests.length === 0 ? (
        // Empty State — When customer has no events
        <div className="flex flex-col items-center justify-center py-28 px-6 rounded-3xl border border-dashed border-border/80 bg-surface/50 text-center max-w-4xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-6 text-accent-gold">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-light text-foreground font-heading tracking-wide">Begin Your Event Journey</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2.5 leading-relaxed font-light">
            Orchestrate an extraordinary ceremony, banquet, or private gala managed end-to-end by SAI EVENTS.
          </p>
          <a
            href="/customer/request"
            className="px-6 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs uppercase tracking-wider font-bold rounded-xl transition shadow mt-7.5"
          >
            Create Your First Event Case
          </a>
        </div>
      ) : (
        <div>
          {/* Active Event Case Selector Switcher */}
          {requests.length > 1 && (
            <div className="flex items-center gap-3.5 mb-6 px-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Active Project:</span>
              <select
                value={activeEventId || ""}
                onChange={(e) => {
                  setActiveEventId(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className="bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:border-accent-gold/45 cursor-pointer max-w-xs"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>{r.event_type} ({r.event_date})</option>
                ))}
              </select>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              TABS SWITCHER DISPLAY PANEL
          ──────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {currentTab === "overview" && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {/* Dashboard Hero Block */}
                <div className="p-8 md:p-10 rounded-3xl bg-surface border border-border/80 shadow-md relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  {/* Subtle Light leak effect */}
                  <div className="light-leak" />

                  {/* Left Side: Greeting & Event Summary */}
                  <div className="space-y-5 relative z-10 max-w-xl">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">SAI EVENTS Concierge</span>
                      <h2 className="text-3xl font-light font-heading text-foreground mt-1.5">
                        Your Event Planning Studio
                      </h2>
                    </div>

                    <div className="space-y-2 border-l border-accent-gold/25 pl-4 py-1">
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        Currently coordinating the <span className="text-foreground font-semibold">{activeRequest.event_type} Case</span> expected at <span className="text-foreground font-semibold">{activeRequest.location}</span>.
                      </p>
                      <div className="flex gap-4.5 text-[10px] text-muted-foreground font-mono mt-2">
                        <span>Guests: {activeRequest.guest_count}</span>
                        <span>·</span>
                        <span>Date: {activeRequest.event_date}</span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="flex items-center gap-4 pt-1">
                      {/* Circular Progress Ring SVG */}
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-border/40" strokeWidth="3" fill="transparent" />
                          <circle 
                            cx="24" 
                            cy="24" 
                            r="20" 
                            stroke="currentColor" 
                            className="text-accent-gold" 
                            strokeWidth="3.5" 
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono">
                          {progressPercent}%
                        </div>
                      </div>
                      <div>
                        <span className="text-[8.5px] uppercase font-black tracking-widest text-muted-foreground block">Current Stage</span>
                        <span className="text-xs font-bold text-foreground mt-0.5 block">{activeRequest.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Quick Action / Status Countdown Badge */}
                  <div className="bg-background/45 backdrop-blur-md border border-border/60 p-6 rounded-2xl relative z-10 w-full lg:w-auto shrink-0 flex flex-col justify-between gap-5 min-w-[260px] text-center lg:text-left">
                    <div className="space-y-1">
                      <span className="text-[8.5px] uppercase font-bold tracking-widest text-muted-foreground block">Event Countdown</span>
                      {activeRequest.status !== "Cancelled" ? (
                        <h3 className="text-2xl font-black text-accent-gold font-mono tracking-wide mt-1">
                          {getCountdown(activeRequest.event_date)}
                        </h3>
                      ) : (
                        <h3 className="text-lg font-bold text-red-500 mt-1">Cancelled</h3>
                      )}
                    </div>

                    <div className="border-t border-border/40 pt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-light">Estimated Budget:</span>
                        <span className="font-bold text-foreground font-mono">
                          ₹{Number(activeRequest.total_budget).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {activeRequest.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(activeRequest.id)}
                          className="w-full text-center px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                          Cancel Event Request
                        </button>
                      )}
                    </div>

                    <a
                      href="/customer/dashboard?tab=journey"
                      className="w-full text-center px-4 py-2.5 bg-surface-raised border border-border hover:border-accent-gold/40 text-xs font-semibold rounded-xl transition duration-200 block"
                    >
                      View Live Timeline
                    </a>
                  </div>
                </div>

                {/* Editorial Information Panels (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Workspace Panel: Itinerary Details & Quick Actions */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Active Event luxury Itinerary */}
                    <div className="p-6.5 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Active Event Specification
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Event Archetype</span>
                          <p className="text-sm font-semibold text-foreground">{activeRequest.event_type}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Planning Coordinator</span>
                          <p className="text-sm font-semibold text-foreground">
                            {activeRequest.event_assignments?.[0]?.profiles?.full_name || "Assigning Partner..."}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Venue Location</span>
                          <p className="text-sm font-semibold text-foreground truncate">{activeRequest.location}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Services Invoiced</span>
                          <p className="text-sm font-semibold text-foreground">{activeRequest.request_items?.length || 0} Managed Options</p>
                        </div>
                      </div>
                      
                      {/* Managed note */}
                      <div className="p-3.5 bg-background/40 border border-border/50 rounded-xl flex gap-2.5 items-start">
                        <Info className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                        <span className="text-[10px] text-muted-foreground font-light leading-relaxed">
                          All vendor scheduling, catering staging, and layout decorations are fully managed under SAI EVENTS.
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Tiles */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                        Planning Workspace Controls
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <a 
                          href="/customer/request" 
                          className="p-5 bg-surface border border-border/80 hover:border-accent-gold/40 hover:bg-surface-raised rounded-2xl flex flex-col justify-between h-[115px] group transition-all duration-300 hover-lift"
                        >
                          <Plus className="w-5 h-5 text-accent-gold" />
                          <div>
                            <span className="text-xs font-bold text-foreground block">Plan Event</span>
                            <span className="text-[8.5px] text-muted-foreground block mt-0.5">Start wizard</span>
                          </div>
                        </a>
                        <a 
                          href="/customer/dashboard?tab=journey" 
                          className="p-5 bg-surface border border-border/80 hover:border-accent-gold/40 hover:bg-surface-raised rounded-2xl flex flex-col justify-between h-[115px] group transition-all duration-300 hover-lift"
                        >
                          <Compass className="w-5 h-5 text-accent-gold" />
                          <div>
                            <span className="text-xs font-bold text-foreground block">Event Journey</span>
                            <span className="text-[8.5px] text-muted-foreground block mt-0.5">View timeline</span>
                          </div>
                        </a>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="p-5 bg-surface border border-border/80 hover:border-accent-gold/40 hover:bg-surface-raised rounded-2xl flex flex-col justify-between h-[115px] text-left group transition-all duration-300 hover-lift cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-accent-gold" />
                          <div>
                            <span className="text-xs font-bold text-foreground block">Upload Reference</span>
                            <span className="text-[8.5px] text-muted-foreground block mt-0.5">Add document</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => window.print()}
                          className="p-5 bg-surface border border-border/80 hover:border-accent-gold/40 hover:bg-surface-raised rounded-2xl flex flex-col justify-between h-[115px] text-left group transition-all duration-300 hover-lift cursor-pointer"
                        >
                          <FileText className="w-5 h-5 text-accent-gold" />
                          <div>
                            <span className="text-xs font-bold text-foreground block">Print Proposal</span>
                            <span className="text-[8.5px] text-muted-foreground block mt-0.5">Download summary</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Panel: Coordinator experience */}
                  <div className="lg:col-span-4 space-y-8 w-full">
                    
                    {/* Concierge Coordinator Details Card */}
                    <div className="p-6.5 rounded-3xl bg-surface border border-border/80 shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
                      <div className="space-y-4.5">
                        <span className="text-[8.5px] uppercase font-bold tracking-[0.2em] text-accent-gold block">Your dedicated partner</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground -mt-3.5">
                          Event Coordinator
                        </h3>

                        {activeRequest.event_assignments && activeRequest.event_assignments.length > 0 && activeRequest.event_assignments[0].profiles ? (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3.5">
                              {/* Designer avatar ring layout */}
                              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-accent-gold font-bold text-sm uppercase relative overflow-hidden shadow-inner shrink-0">
                                <span className="relative z-10">{activeRequest.event_assignments[0].profiles.full_name.substring(0, 2)}</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold/5 to-transparent pointer-events-none" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground">
                                  {activeRequest.event_assignments[0].profiles.full_name}
                                </h4>
                                <p className="text-[8.5px] uppercase tracking-wider text-accent-gold font-semibold mt-0.5">
                                  Dedicated Planning Partner
                                </p>
                              </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                              {activeRequest.event_assignments[0].handover_notes || 
                               "Your coordinator is coordinating setups, decor timelines, and layout parameters for staging."}
                            </p>

                            <div className="space-y-2.5 pt-3.5 text-[10px] text-muted-foreground border-t border-border/40 font-mono">
                              <div className="flex items-center gap-2.5">
                                <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                                <span>{activeRequest.event_assignments[0].profiles.phone_number}</span>
                              </div>
                              <div className="flex items-center gap-2.5 truncate">
                                <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                                <span className="truncate">{activeRequest.event_assignments[0].profiles.email}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-1.5">
                              <a
                                href={`tel:${activeRequest.event_assignments[0].profiles.phone_number}`}
                                className="px-3 py-2 border border-border bg-background hover:bg-surface-raised rounded-xl text-[9px] font-bold uppercase tracking-wider text-foreground text-center transition cursor-pointer"
                              >
                                Call
                              </a>
                              <a
                                href={`mailto:${activeRequest.event_assignments[0].profiles.email}`}
                                className="px-3 py-2 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[9px] font-bold uppercase tracking-wider text-center rounded-xl transition cursor-pointer"
                              >
                                Email
                              </a>
                            </div>

                            <button
                              onClick={() => setShowMeetingModal(true)}
                              className="w-full py-2.5 bg-background border border-border hover:border-accent-gold/40 text-xs font-semibold rounded-xl text-center cursor-pointer transition duration-200 mt-2"
                            >
                              Request Staging Consultation
                            </button>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-muted-foreground font-light flex flex-col items-center justify-center gap-3 bg-background/40 rounded-2xl border border-dashed border-border/80">
                            <UserCheck className="w-7 h-7 text-muted-foreground/35 animate-pulse" />
                            <p className="max-w-[190px] leading-relaxed mx-auto">
                              Pending Coordinator allocation. Our dispatch team is allocating your private consultant.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick milestone update tracker */}
                    {activeRequest.status !== "Cancelled" && (
                      <div className="p-6.5 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Latest Progress Update
                        </h3>
                        <div className="space-y-3.5">
                          {activeRequest.timelines && activeRequest.timelines.filter(t => !t.is_internal).length > 0 ? (
                            activeRequest.timelines
                              .filter(t => !t.is_internal)
                              .slice(0, 2)
                              .map((timeline) => (
                                <div key={timeline.id} className="text-xs space-y-1.5 border-l-2 border-accent-gold/30 pl-3">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-foreground">{timeline.milestone_name}</span>
                                    <span className="text-[8.5px] text-muted-foreground font-mono">{formatDate(timeline.created_at)}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                                    {timeline.description}
                                  </p>
                                </div>
                              ))
                          ) : (
                            <p className="text-[10px] text-muted-foreground font-light py-2 text-center">
                              No public tracking updates registered yet.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. MY EVENTS HISTORICAL GRID TAB */}
            {currentTab === "events" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-light font-heading text-foreground">My Events Chronicle</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    Browse ongoing planner templates, historical completions, and active booking records.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5">
                  {sortedRequests.map((req) => {
                    const isCancelled = req.status === "Cancelled";
                    const isCompleted = req.status === "Completed" || req.status === "Closed";
                    const isActiveCase = req.id === activeEventId;

                    return (
                      <div
                        key={req.id}
                        onClick={() => {
                          setActiveEventId(req.id);
                          setError(null);
                          setSuccess(null);
                        }}
                        className={`rounded-3xl border p-6 flex flex-col justify-between gap-6 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                          isCancelled 
                            ? "bg-surface/30 border-border/40 opacity-60 hover:opacity-85" 
                            : isCompleted 
                            ? "bg-surface/50 border-border/60 grayscale hover:grayscale-0 hover:border-accent-gold/25" 
                            : isActiveCase
                            ? "bg-surface-raised border-accent-gold/45 shadow-md shadow-[#D4AF37]/5" 
                            : "bg-surface border-border/80 hover:border-accent-gold/25"
                        } hover-lift`}
                      >
                        {/* Status Ribbon Ribbon */}
                        <div className="absolute right-0 top-0 overflow-hidden w-28 h-28 pointer-events-none">
                          <div className={`absolute text-[8px] font-bold font-sans uppercase text-center py-1.5 w-[140px] rotate-45 top-6 -right-7 shadow-sm ${
                            isCancelled 
                              ? "bg-red-950/40 text-red-400 border border-red-900/30" 
                              : isCompleted 
                              ? "bg-zinc-800 text-zinc-300" 
                              : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                          }`}>
                            {req.status}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[8.5px] uppercase font-bold text-accent-gold tracking-[0.2em]">Archived ID: {req.id.substring(0, 8)}</span>
                            <h3 className="text-lg font-bold text-foreground font-heading pr-12">{req.event_type}</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Event Date</span>
                              <p className="font-bold text-foreground/80">{req.event_date}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Total Budget</span>
                              <p className="font-bold text-foreground/80 font-mono">₹{Number(req.total_budget).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Guest Parameters</span>
                              <p className="font-bold text-foreground/80">{req.guest_count} People</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Staging Venue</span>
                              <p className="font-bold text-foreground/80 truncate max-w-[120px]">{req.location.split(",")[0]}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center text-accent-gold font-mono font-bold text-[10px] uppercase">
                              {req.event_assignments?.[0]?.profiles?.full_name?.substring(0, 2) || "OM"}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-light">
                              Partner: {req.event_assignments?.[0]?.profiles?.full_name || "Pending Allocation"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-accent-gold text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1.5 transition-transform">
                            <span>Open Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3. EVENT JOURNEY CENTERPIECE TIMELINE TAB */}
            {currentTab === "journey" && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-light font-heading text-foreground">Interactive Event Journey</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    The core workflow connecting your request to the final event execution.
                  </p>
                </div>

                <div className="p-4 sm:p-8 md:p-10 rounded-3xl bg-surface border border-border/80 shadow-md">
                  {activeRequest.status === "Cancelled" ? (
                    <div className="py-12 text-center text-red-400 text-xs font-light max-w-sm mx-auto space-y-3">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                      <p>This event request has been cancelled. Contact support to coordinate rescheduling options.</p>
                    </div>
                  ) : (
                    <div className="space-y-0 relative">
                      {/* Flex timeline list containing dynamic line heights */}
                      {MILESTONES.map((step, idx) => {
                        const isPast = idx < activeMilestoneIdx;
                        const isCurrent = idx === activeMilestoneIdx;
                        const isFuture = idx > activeMilestoneIdx;

                        // Retrieve database custom timeline milestone
                        const milestoneDbData = activeRequest.timelines?.find(
                          (t) => t.milestone_name.toLowerCase() === step.key.toLowerCase() && !t.is_internal
                        );

                        return (
                          <div 
                            key={step.key} 
                            className={`flex gap-4 sm:gap-6 relative transition-opacity duration-300 ${
                              isFuture ? "opacity-35" : "opacity-100"
                            }`}
                          >
                            {/* Left Side: Auto Centered Circle & Vertical Line */}
                            <div className="flex flex-col items-center shrink-0 w-11 sm:w-14">
                              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 relative z-10 shrink-0 ${
                                isPast 
                                  ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-[#D4AF37]/15" 
                                  : isCurrent 
                                  ? "bg-background border-[#D4AF37] text-accent-gold shadow-[0_0_12px_rgba(212,175,55,0.4)] animate-pulse-glow" 
                                  : "bg-surface border-border text-muted-foreground"
                              }`}>
                                <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                              </div>
                              
                              {idx < MILESTONES.length - 1 && (
                                <div className="w-[1.5px] flex-1 bg-border/60 my-2" />
                              )}
                            </div>

                            {/* Right Side: Details Card */}
                            <div className={`flex-1 pb-8 p-4.5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                              isCurrent 
                                ? "bg-surface-raised border-[#D4AF37]/45 shadow-sm" 
                                : isPast 
                                ? "bg-surface border-border/80" 
                                : "bg-background/25 border-border/40"
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <h4 className={`text-xs uppercase font-bold tracking-wider ${
                                  isCurrent ? "text-accent-gold text-sm font-black" : "text-foreground"
                                }`}>
                                  {step.label}
                                </h4>
                                
                                {isPast && (
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block w-max">
                                    Completed
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37] bg-accent-gold/5 border border-accent-gold/20 px-2 py-0.5 rounded-full inline-block w-max animate-pulse">
                                    Active Stage
                                  </span>
                                )}
                              </div>

                              <p className="text-[10.5px] text-muted-foreground mt-2 leading-relaxed font-light">
                                {milestoneDbData?.description || step.desc}
                              </p>

                              {milestoneDbData && (
                                <div className="mt-3.5 text-[9px] bg-background/50 border border-border/40 px-2.5 py-1.5 rounded-lg text-accent-gold inline-flex items-center gap-1.5 font-mono">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>Sync log: {formatDate(milestoneDbData.created_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. DOCUMENTS TAB */}
            {currentTab === "documents" && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-light font-heading text-foreground">Document Workspace</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-light">
                      Manage inspiration layouts, layouts, and review event proposal agreements.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add File Reference
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Categories Menu — Horizontal scrolling on mobile */}
                  <div className="lg:col-span-3 bg-surface border border-border/80 rounded-2xl p-4.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 no-scrollbar scrollbar-none whitespace-nowrap">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider px-2.5 hidden lg:block mb-2">Workspace Directories</span>
                    {[
                      { key: "all", label: "All References" },
                      { key: "inspiration", label: "Inspirations" },
                      { key: "reference", label: "References" },
                      { key: "venue", label: "Venue Plans" },
                      { key: "quotation", label: "Quotations" },
                      { key: "agreement", label: "Agreements" }
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveDocCategory(cat.key)}
                        className={`px-3.5 py-2.5 text-xs text-left font-semibold rounded-xl border transition-all duration-150 cursor-pointer shrink-0 ${
                          activeDocCategory === cat.key
                            ? "bg-accent-gold/5 border-accent-gold/20 text-accent-gold"
                            : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Right Column Files list */}
                  <div className="lg:col-span-9 bg-surface border border-border/80 rounded-3xl p-6.5 min-h-[380px] flex flex-col justify-between">
                    
                    {filteredDocs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredDocs.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="p-4 bg-background border border-border/70 rounded-2xl flex items-center justify-between gap-4 hover:border-accent-gold/20 transition-all"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">{doc.file_name}</span>
                              <span className="text-[8.5px] uppercase tracking-wider text-accent-gold mt-1 block font-bold">
                                {doc.file_type} · {formatDate(doc.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={doc.file_url}
                                className="p-2 border border-border hover:bg-surface-raised rounded-xl text-muted-foreground hover:text-foreground transition duration-150"
                                title="Download reference"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-2 border border-red-950/20 hover:bg-red-950/15 rounded-xl text-red-400 hover:text-red-300 transition cursor-pointer"
                                title="Delete reference"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Empty state
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-4 text-muted-foreground/60">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-bold text-foreground">No Document files found</h4>
                        <p className="text-[10px] text-muted-foreground max-w-[250px] mt-1.5 leading-relaxed font-light">
                          Provide mandap layouts, menu structures, or visual inspiration PDFs under this folder.
                        </p>
                      </div>
                    )}

                    {/* Drag and Drop Upload Area */}
                    <div 
                      onClick={() => setShowUploadModal(true)}
                      className="border border-dashed border-border/80 hover:border-accent-gold/45 rounded-2xl p-6.5 text-center mt-6 bg-background/25 cursor-pointer hover:bg-background/45 transition duration-300 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5 text-accent-gold animate-bounce" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">Click to upload planning reference</span>
                        <span className="text-[8.5px] text-muted-foreground block mt-0.5">Supports PDF, JPG, PNG, and DOCX (Max 15MB)</span>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 5. MEETINGS SCHEDULE TAB */}
            {currentTab === "meetings" && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-light font-heading text-foreground">Meetings & Consultations</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-light">
                      Sync with your dedicated planner partner to coordinate decor details.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMeetingModal(true)}
                    className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                  >
                    <Plus className="w-4 h-4" /> Request Meeting
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Calendar Mockup */}
                  <div className="lg:col-span-4 bg-surface border border-border/80 rounded-2xl p-5 space-y-4 w-full">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Planning Calendar</h3>
                    
                    {/* Calendar grid mock */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                        <span className="font-bold">July 2026</span>
                        <div className="flex gap-2 text-muted-foreground">
                          <span className="cursor-pointer hover:text-foreground">←</span>
                          <span className="cursor-pointer hover:text-foreground">→</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                          <span key={d} className="text-muted-foreground font-bold">{d}</span>
                        ))}
                        {Array.from({ length: 31 }).map((_, idx) => {
                          const day = idx + 1;
                          const isMeetingDay = day === 10 || day === 15;
                          return (
                            <span 
                              key={idx} 
                              className={`py-1 rounded-md ${
                                isMeetingDay 
                                  ? "bg-accent-gold text-black font-black" 
                                  : "hover:bg-surface-raised text-foreground/75"
                              }`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-[9.5px] text-muted-foreground flex gap-1.5 items-center font-light pt-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold inline-block" />
                        <span>Highlighted days represent active staging calls.</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Meetings list */}
                  <div className="lg:col-span-8 space-y-5 w-full">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Scheduled Staging Calls</h3>
                    
                    {/* Upcoming meetings */}
                    <div className="space-y-4">
                      
                      {/* Meeting 1 */}
                      <div className="p-5.5 bg-surface border border-border/80 rounded-3xl space-y-4 hover:border-accent-gold/25 transition duration-205">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/5 border border-accent-gold/20 px-2 py-0.5 rounded">Upcoming Sync</span>
                            <h4 className="text-sm font-bold text-foreground mt-2">Layout & Theme Finalization</h4>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono shrink-0">
                            <CalendarDays className="w-4 h-4 text-accent-gold" />
                            <span>10th July 2026 · 14:00</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                          Reviewing three alternative layout styles for mandap staging, floral arrangements, and stage decoration presets.
                        </p>

                        <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4.5 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Video className="w-4 h-4 text-accent-gold" />
                            <span className="font-mono text-[10px]">Room Code: sai-decor-sync</span>
                          </div>

                          <a
                            href="https://meet.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="px-4.5 py-1.5 bg-gradient-to-r from-accent-gold to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            Join Video Call <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Meeting 2 */}
                      <div className="p-5.5 bg-surface border border-border/80 rounded-3xl space-y-4 hover:border-accent-gold/25 transition duration-205">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/5 border border-accent-gold/20 px-2 py-0.5 rounded">Upcoming Sync</span>
                            <h4 className="text-sm font-bold text-foreground mt-2">Menu Testing & Catering Check</h4>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono shrink-0">
                            <CalendarDays className="w-4 h-4 text-accent-gold" />
                            <span>15th July 2026 · 11:30</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                          Selecting catering layouts, platings configuration, and final plate pricing under our managed catering services.
                        </p>

                        <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4.5 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Video className="w-4 h-4 text-accent-gold" />
                            <span className="font-mono text-[10px]">Room Code: sai-catering- tasting</span>
                          </div>

                          <a
                            href="https://meet.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="px-4.5 py-1.5 bg-gradient-to-r from-accent-gold to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            Join Video Call <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. NOTIFICATIONS WORKSPACE TAB */}
            {currentTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-light font-heading text-foreground">Notifications Activity Log</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    Review milestones updates, document registry logs, and coordination status changes.
                  </p>
                </div>

                <div className="p-8 md:p-10 rounded-3xl bg-surface border border-border/80 shadow-md">
                  {notifications.length > 0 ? (
                    <div className="relative pt-2 pb-2">
                      {/* Vertical line indicator */}
                      <div className="absolute left-4.5 top-4 bottom-4 w-px bg-border/60" />

                      <div className="space-y-6">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="flex gap-4 relative pl-10 group">
                            
                            {/* Glowing Ring */}
                            <div className={`absolute left-4.5 top-1.5 w-2 h-2 rounded-full -translate-x-1/2 z-10 transition-all ${
                              notif.status === "Delivered" 
                                ? "bg-accent-gold shadow-[0_0_6px_rgba(212,175,55,0.8)] animate-pulse" 
                                : "bg-border"
                            }`} />

                            <div className="space-y-1.5 flex-1 bg-background/25 border border-border/40 hover:border-accent-gold/15 p-4.5 rounded-2xl transition duration-250">
                              <div className="flex justify-between items-center gap-2.5">
                                <span className="text-[8.5px] uppercase font-bold text-accent-gold tracking-widest font-mono">SAI SYSTEM UPDATE</span>
                                <span className="text-[8.5px] text-muted-foreground font-mono">{formatDate(notif.created_at)}</span>
                              </div>
                              <p className="text-xs text-foreground/80 leading-relaxed font-light">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-muted-foreground font-light flex flex-col items-center justify-center gap-3">
                      <Bell className="w-7 h-7 text-muted-foreground/35" />
                      <p>No activity logs or alerts registered yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 7. SUPPORT CONCIERGE HUB TAB */}
            {currentTab === "support" && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-light font-heading text-foreground">Dedicated Concierge Hub</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    Direct communication workspace to resolve planning queries and stage coordination items.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Coordinator Card */}
                  <div className="lg:col-span-5 bg-surface border border-border/80 rounded-3xl p-8 space-y-6 relative overflow-hidden w-full">
                    <div className="space-y-4">
                      <span className="text-[8.5px] uppercase font-bold tracking-[0.2em] text-accent-gold block">Assigned Advisor</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground -mt-3.5">
                        Your Event Partner
                      </h3>

                      {activeRequest.event_assignments && activeRequest.event_assignments.length > 0 && activeRequest.event_assignments[0].profiles ? (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-accent-gold font-bold text-sm uppercase shadow-sm">
                              {activeRequest.event_assignments[0].profiles.full_name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">
                                {activeRequest.event_assignments[0].profiles.full_name}
                              </h4>
                              <p className="text-[9px] uppercase tracking-wider text-accent-gold font-semibold mt-0.5">
                                Executive Event Coordinator
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-4 border-t border-border/40 font-mono text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-accent-gold" />
                              <span>{activeRequest.event_assignments[0].profiles.phone_number}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-accent-gold" />
                              <span className="truncate">{activeRequest.event_assignments[0].profiles.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-accent-gold" />
                              <span>Availability: Mon - Sat (9:00 - 18:00)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <a
                              href={`tel:${activeRequest.event_assignments[0].profiles.phone_number}`}
                              className="px-4 py-2.5 border border-border bg-background hover:bg-surface-raised rounded-xl text-xs font-bold uppercase tracking-wider text-foreground text-center transition cursor-pointer"
                            >
                              Call Concierge
                            </a>
                            <a
                              href={`mailto:${activeRequest.event_assignments[0].profiles.email}`}
                              className="px-4 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-wider text-center rounded-xl transition cursor-pointer animate-pulse-glow"
                            >
                              Email Partner
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-xs text-muted-foreground font-light flex flex-col items-center justify-center gap-3 bg-background/30 rounded-2xl border border-dashed border-border/80">
                          <UserCheck className="w-8 h-8 text-muted-foreground/35" />
                          <p className="max-w-[200px] leading-relaxed mx-auto">
                            Advisor Assignment Pending. Our admin team will dispatch your coordinator partner within 24 hours.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column support contact info */}
                  <div className="lg:col-span-7 bg-surface border border-border/80 rounded-3xl p-8 space-y-6 w-full">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Orchestration Philosophy</h3>
                    
                    <div className="space-y-4 text-xs text-muted-foreground leading-relaxed font-light">
                      <p>
                        At <span className="text-foreground font-semibold">SAI EVENTS</span>, we orchestrate experiences. You are not managing decorators, sound systems, or catering timelines; we abstract provider details, scheduling, and staging to ensure a singular premium celebration.
                      </p>
                      <p>
                        Should you require structural alterations to your layout or timeline adjustments, please reach out to your assigned coordinator, or file a consultation query below.
                      </p>
                    </div>

                    <div className="border-t border-border/40 pt-6 space-y-4">
                      <span className="text-[9.5px] uppercase font-bold text-accent-gold tracking-widest block font-mono">SAI concierge standards</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-background border border-border/60 rounded-xl space-y-1">
                          <span className="font-bold text-foreground block">Zero Vendor Anxiety</span>
                          <span className="text-[10px] font-light">No direct vendor calls. We manage everything onsite.</span>
                        </div>
                        <div className="p-4 bg-background border border-border/60 rounded-xl space-y-1">
                          <span className="font-bold text-foreground block">Guaranteed Execution</span>
                          <span className="text-[10px] font-light">Dedicated managers verify decor alignment metrics.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

      {/* ─── UPLOAD DOCUMENT MODAL ─── */}
      {showUploadModal && activeRequest && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border/80 rounded-3xl max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Add Reference Document
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-lg hover:bg-surface-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Mandap Decor Inspiration"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">File Category</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground cursor-pointer text-xs"
                >
                  <option value="inspiration">Inspiration Image</option>
                  <option value="reference">Reference Document</option>
                  <option value="venue">Venue Information</option>
                </select>
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4.5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
                >
                  {isUploading ? "Uploading..." : "Save Reference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REQUEST MEETINGS MODAL ─── */}
      {showMeetingModal && activeRequest && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border/80 rounded-3xl max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Request Consultation Call
              </h3>
              <button 
                onClick={() => setShowMeetingModal(false)}
                className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-lg hover:bg-surface-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestMeetingSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Meeting Medium</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground cursor-pointer text-xs"
                >
                  <option value="video">Google Meet Video Sync</option>
                  <option value="phone">Standard Voice Call</option>
                  <option value="in_person">In-Person Consultation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Consultation Agenda</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify staging questions, catering tasters alignment, or timeline additions..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm resize-none"
                />
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4.5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingMeeting}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
                >
                  {requestingMeeting ? "Logging request..." : "Confirm Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANCEL EVENT REQUEST MODAL ─── */}
      {showCancelModal && cancelTargetId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border/80 rounded-3xl max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
                Cancel Event Request
              </h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-lg hover:bg-surface-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Are you sure you want to cancel this event request? Please provide a mandatory reason for cancellation.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cancellation Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify why you are cancelling (e.g., date changed, venue relocated, budget update)..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-red-500/50 text-foreground placeholder-muted-foreground font-light text-xs resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-xs font-semibold text-foreground transition cursor-pointer"
                >
                  Keep Event
                </button>
                <button
                  type="submit"
                  disabled={cancellingId !== null}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  {cancellingId !== null ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
