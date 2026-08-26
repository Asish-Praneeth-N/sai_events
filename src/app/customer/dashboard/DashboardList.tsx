"use client";

import React, { useState, useTransition, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { 
  Calendar, MapPin, Users, DollarSign, Clock, FileText, 
  Phone, Mail, ArrowRight, UserCheck, Sparkles, Upload, 
  Trash2, Download, AlertCircle, Shield, CheckCircle2, 
  MessageSquare, Video, HelpCircle, Plus, X, ArrowUpRight,
  ChevronRight, CalendarDays, Compass, Info, Award, Bell,
  ChevronDown, Check
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cancelEventRequest, uploadCustomerDocument, deleteCustomerDocument, requestEventMeeting } from "../actions";
import CustomerMediaStudio from "@/components/customer/CustomerMediaStudio";

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

interface CustomerDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

interface EventTimeline {
  id: string;
  milestone_name: string;
  description: string;
  is_internal: boolean;
  created_at: string;
}

interface EventRequest {
  id: string;
  event_type: string;
  location: string;
  guest_count: number;
  status: string;
  total_budget: number;
  event_date: string;
  created_at: string;
  request_items?: RequestItem[];
  event_assignments?: EventAssignment[];
  documents?: CustomerDocument[];
  timelines?: EventTimeline[];
}

interface Notification {
  id: string;
  message: string;
  user_type: string;
  created_at: string;
  status?: string;
}

interface GuestEnquiryItem {
  id: string;
  event_type: string;
  event_description: string;
  status: string;
  created_at: string;
}

interface DashboardListProps {
  requests: EventRequest[];
  notifications: Notification[];
  enquiries?: GuestEnquiryItem[];
  meetings?: any[];
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

const CANCELLATION_REASONS = [
  "Change in event date or schedule",
  "Venue relocated or unavailable",
  "Budget constraints / financial adjustment",
  "Booked another event planner / vendor directly",
  "Event postponed indefinitely",
  "Personal / family circumstances",
  "Other (Specify custom reason)"
];

function DashboardListInner({
  requests,
  notifications,
  enquiries = [],
  meetings = []
}: DashboardListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const [activeEventId, setActiveEventId] = useState<string | null>(
    requests.length > 0 ? requests[0].id : null
  );
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("Change in event date or schedule");
  const [cancelCustomReason, setCancelCustomReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Interactive Planning Calendar States
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [meetingFilter, setMeetingFilter] = useState<string>("all");

  const handlePrevMonth = () => {
    setSelectedCalendarDay(null);
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedCalendarDay(null);
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const activeMeetingDays = useMemo(() => {
    const daysSet = new Set<number>();
    meetings.forEach((m) => {
      const dateStr = m.confirmed_date || m.preferred_date;
      if (dateStr) {
        const d = new Date(dateStr);
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
          daysSet.add(d.getDate());
        }
      }
    });
    requests.forEach((r) => {
      if (r.event_date) {
        const d = new Date(r.event_date);
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
          daysSet.add(d.getDate());
        }
      }
    });
    return daysSet;
  }, [meetings, requests, calendarYear, calendarMonth]);

  const filteredMeetingsList = useMemo(() => {
    let list = [...meetings];

    if (selectedCalendarDay !== null) {
      list = list.filter((m) => {
        const dateStr = m.confirmed_date || m.preferred_date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return (
          d.getFullYear() === calendarYear &&
          d.getMonth() === calendarMonth &&
          d.getDate() === selectedCalendarDay
        );
      });
    }

    if (meetingFilter === "scheduled") {
      list = list.filter((m) => m.status === "Scheduled");
    } else if (meetingFilter === "pending") {
      list = list.filter((m) => m.status === "Pending");
    } else if (meetingFilter === "completed") {
      list = list.filter((m) => m.status === "Completed" || m.status === "Rejected");
    }

    return list;
  }, [meetings, selectedCalendarDay, calendarYear, calendarMonth, meetingFilter]);

  // Document Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState("inspiration");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Document filter category
  const [activeDocCategory, setActiveDocCategory] = useState("all");

  // Meetings Request Modal States
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTimeWindow, setMeetingTimeWindow] = useState("10:00 AM - 1:00 PM");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [requestingMeeting, setRequestingMeeting] = useState(false);

  // New Enquiry Modal States
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryEventType, setEnquiryEventType] = useState("Wedding Ceremony");
  const [enquiryDescription, setEnquiryDescription] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryDescription.trim()) {
      setError("Please provide enquiry details.");
      return;
    }
    setSubmittingEnquiry(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone_number")
        .eq("id", user.id)
        .single();

      const { error: insertErr } = await supabase
        .from("guest_enquiries")
        .insert({
          full_name: profile?.full_name && profile.full_name !== "Unnamed User" ? profile.full_name : "Customer",
          email: profile?.email || user.email || "",
          phone: profile?.phone_number && profile.phone_number !== "0000000000" ? profile.phone_number : "N/A",
          event_type: enquiryEventType,
          event_description: enquiryDescription.trim(),
          linked_user_id: user.id,
          status: "new",
        });

      if (insertErr) throw insertErr;

      setSuccess("Your consultation enquiry has been submitted! Our admin team will respond shortly.");
      setShowEnquiryModal(false);
      setEnquiryDescription("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit enquiry.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const activeRequest = requests.find((r) => r.id === activeEventId) || null;

  const openCancelModal = (id: string) => {
    setCancelTargetId(id);
    setCancelReasonPreset("Change in event date or schedule");
    setCancelCustomReason("");
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTargetId) return;

    const finalReason = cancelReasonPreset === "Other (Specify custom reason)"
      ? cancelCustomReason.trim()
      : cancelReasonPreset;

    if (!finalReason) {
      setError("Please select or specify a cancellation reason.");
      return;
    }

    setCancellingId(cancelTargetId);
    setError(null);
    try {
      await cancelEventRequest(cancelTargetId, finalReason);
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

  const handleRequestMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) {
      setError("Please select an active event request first.");
      return;
    }
    if (!meetingPurpose.trim()) {
      setError("Meeting purpose is required.");
      return;
    }
    if (!meetingDate) {
      setError("Preferred date is required.");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (meetingDate < todayStr) {
      setError("Meeting date cannot be in the past. Please select today or a future date.");
      return;
    }
    setRequestingMeeting(true);
    setError(null);
    try {
      await requestEventMeeting(
        activeRequest.id,
        meetingPurpose.trim(),
        meetingDate,
        meetingTimeWindow,
        meetingNotes.trim()
      );
      setSuccess("Meeting request submitted to SAI EVENTS Admin!");
      setShowMeetingModal(false);
      setMeetingPurpose("");
      setMeetingDate("");
      setMeetingTimeWindow("10:00 AM - 1:00 PM");
      setMeetingNotes("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit meeting request.");
    } finally {
      setRequestingMeeting(false);
    }
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
    <div className="space-y-7 sm:space-y-8">
      
      {/* ── Custom Status & Alerts banner ── */}
      {error && (
        <div className="p-4.5 bg-red-100/90 border border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 text-xs rounded-xl flex items-center gap-3 animate-fade-in max-w-4xl font-medium shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4.5 bg-emerald-100/90 border border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-3 animate-fade-in max-w-4xl font-medium shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {requests.length === 0 ? (
        // Empty State — When customer has no events
        <div className="flex flex-col items-center justify-center py-24 px-6 border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] bg-[#fbf7f0] dark:bg-[#1f221c] text-center max-w-4xl mx-auto shadow-sm">
          <div className="w-16 h-16 border border-[#a17a34]/30 bg-[#f3eadf]/60 dark:bg-white/[0.02] flex items-center justify-center mb-6 text-[#9a742e] dark:text-[#d2b56b]">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-normal text-[#173d2c] dark:text-[#f0e8db] font-heading tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>
            Begin Your Celebration Journey
          </h2>
          <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 max-w-sm mx-auto mt-2.5 leading-relaxed font-light">
            Orchestrate an extraordinary ceremony, banquet, or private gala managed end-to-end by SAI EVENTS.
          </p>
          <a
            href="/customer/request"
            className="px-6 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] uppercase tracking-[0.22em] font-bold transition shadow-md mt-7.5 hover:brightness-110"
          >
            Create Your First Event Case
          </a>
        </div>
      ) : (
        <div>
          {/* Active Event Case Selector Switcher — Rendered exclusively for Overview tab */}
          {requests.length > 1 && activeRequest && currentTab === "overview" && (
            <div className="flex flex-wrap items-center gap-3.5 mb-6 px-1.5 relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#173d2c]/50 dark:text-[#eee5d7]/45">
                Select Active Project:
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 bg-[#f8f2e9] dark:bg-[#171914] border border-[#a17a34]/35 dark:border-[#d2b56b]/35 px-4 py-2 text-xs font-semibold text-[#173d2c] dark:text-[#f0e8db] hover:border-[#a17a34] dark:hover:border-[#d2b56b] transition cursor-pointer shadow-sm"
                >
                  <span className="font-heading font-medium">{activeRequest.event_type}</span>
                  <span className="font-mono text-[10.5px] text-[#9a742e] dark:text-[#d2b56b]">({activeRequest.event_date})</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#9a742e] dark:text-[#d2b56b] transition-transform duration-200 ${projectDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {projectDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProjectDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 z-50 bg-[#f8f2e9] dark:bg-[#171914] border border-[#173d2c]/15 dark:border-white/[0.10] shadow-2xl p-1.5 animate-scale-in max-h-64 overflow-y-auto no-scrollbar scrollbar-none">
                      <span className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] px-3 py-1.5 block border-b border-[#173d2c]/10 dark:border-white/[0.08] mb-1">
                        Your Event Projects ({requests.length})
                      </span>
                      {requests.map((r) => {
                        const isCurrent = r.id === activeEventId;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setActiveEventId(r.id);
                              setProjectDropdownOpen(false);
                              setError(null);
                              setSuccess(null);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                              isCurrent
                                ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] font-bold"
                                : "text-[#173d2c]/75 dark:text-[#eee5d7]/70 hover:bg-[#173d2c]/[0.04] dark:hover:bg-white/[0.04] hover:text-[#143d2b] dark:hover:text-[#f0e8db]"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block truncate font-heading font-medium">{r.event_type}</span>
                              <span className={`text-[9.5px] font-mono block ${isCurrent ? "text-[#fffaf1]/80 dark:text-[#161812]/80" : "text-[#173d2c]/50 dark:text-[#eee5d7]/40"}`}>
                                {r.event_date} · ₹{Number(r.total_budget).toLocaleString("en-IN")}
                              </span>
                            </div>
                            {isCurrent && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
                <div
                  onClick={() => router.push(`/customer/events/${activeRequest.id}`)}
                  className="p-6 sm:p-8 md:p-9 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/45 dark:hover:border-[#d2b56b]/45 shadow-[0_12px_40px_rgba(70,45,22,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 cursor-pointer transition-all duration-300 group"
                >
                  <div className="light-leak" />

                  {/* Left Side: Greeting & Event Summary */}
                  <div className="space-y-5 relative z-10 max-w-xl">
                    <div>
                      <div className="mb-2 flex items-center gap-2.5">
                        <span className="h-px w-6 bg-[#a17a34]/50" />
                        <Sparkles className="h-3 w-3 text-[#a17a34] dark:text-[#d2b56b]" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#9a742e] dark:text-[#d2b56b]">SAI EVENTS Concierge</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-normal font-heading tracking-[-0.035em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Your Event Planning Studio
                      </h2>
                    </div>

                    <div className="space-y-2 border-l-2 border-[#a17a34]/40 dark:border-[#d2b56b]/40 pl-4 py-1">
                      <p className="text-xs text-[#173d2c]/70 dark:text-[#eee5d7]/60 font-light leading-relaxed">
                        Currently coordinating the <span className="text-[#143d2b] dark:text-[#f0e8db] font-semibold">{activeRequest.event_type} Case</span> expected at <span className="text-[#143d2b] dark:text-[#f0e8db] font-semibold">{activeRequest.location}</span>.
                      </p>
                      <div className="flex gap-4.5 text-[10px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-mono mt-2">
                        <span>Guests: <strong className="text-[#143d2b] dark:text-[#f0e8db] font-bold">{activeRequest.guest_count}</strong></span>
                        <span>·</span>
                        <span>Date: <strong className="text-[#143d2b] dark:text-[#f0e8db] font-bold">{activeRequest.event_date}</strong></span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-[#173d2c]/10 dark:text-white/10" strokeWidth="3" fill="transparent" />
                          <circle 
                            cx="24" 
                            cy="24" 
                            r="20" 
                            stroke="currentColor" 
                            className="text-[#a17a34] dark:text-[#d2b56b]" 
                            strokeWidth="3.5" 
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono text-[#a17a34] dark:text-[#d2b56b]">
                          {progressPercent}%
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold tracking-[0.22em] text-[#173d2c]/45 dark:text-white/35 block">Current Stage</span>
                        <span className="text-xs font-bold text-[#143d2b] dark:text-[#f0e8db] mt-0.5 block">{activeRequest.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status Countdown & Actions */}
                  <div className="bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] p-6 relative z-10 w-full lg:w-auto shrink-0 flex flex-col justify-between gap-5 min-w-[270px] text-center lg:text-left">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase font-bold tracking-[0.22em] text-[#173d2c]/45 dark:text-white/35 block">Event Countdown</span>
                      {activeRequest.status !== "Cancelled" ? (
                        <h3 className="text-2xl font-normal text-[#9a742e] dark:text-[#d2b56b] font-mono tracking-wide mt-1">
                          {getCountdown(activeRequest.event_date)}
                        </h3>
                      ) : (
                        <h3 className="text-lg font-bold text-red-500 mt-1">Cancelled</h3>
                      )}
                    </div>

                    <div className="border-t border-[#173d2c]/10 dark:border-white/[0.08] pt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50">
                        <span className="font-light">Estimated Budget:</span>
                        <span className="font-bold text-[#143d2b] dark:text-[#f0e8db] font-mono">
                          ₹{Number(activeRequest.total_budget).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {activeRequest.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMeetingModal(true);
                          }}
                          className="w-full text-center px-4 py-2.5 bg-[#a17a34]/15 border border-[#a17a34]/40 hover:bg-[#a17a34]/25 text-[#9a742e] dark:text-[#d2b56b] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Request Meeting for Project</span>
                        </button>
                      )}

                      {activeRequest.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCancelModal(activeRequest.id);
                          }}
                          className="w-full text-center px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
                        >
                          Cancel Event Request
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customer/events/${activeRequest.id}`);
                      }}
                      className="w-full text-center px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition shadow-md hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer block"
                    >
                      View Event Details & Journey
                    </button>
                  </div>
                </div>

                {/* Editorial Information Panels (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Workspace Panel: Itinerary Details & Quick Actions */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Active Event luxury Itinerary */}
                    <div
                      onClick={() => router.push(`/customer/events/${activeRequest.id}`)}
                      className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/45 dark:hover:border-[#d2b56b]/45 shadow-sm space-y-5 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                        <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">
                          Active Event Specification
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.2em]">Event Archetype</span>
                          <p className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>{activeRequest.event_type}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.2em]">Planning Coordinator</span>
                          <p className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {activeRequest.event_assignments?.[0]?.profiles?.full_name || "Assigning Partner..."}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.2em]">Venue Location</span>
                          <p className="text-sm font-semibold text-[#143d2b] dark:text-[#f0e8db] truncate">{activeRequest.location}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.2em]">Services Invoiced</span>
                          <p className="text-sm font-semibold text-[#143d2b] dark:text-[#f0e8db]">{activeRequest.request_items?.length || 0} Managed Options</p>
                        </div>
                      </div>
                      
                      {/* Managed note */}
                      <div className="p-3.5 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex gap-2.5 items-start">
                        <Info className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light leading-relaxed">
                          All vendor scheduling, catering staging, and layout decorations are fully managed under SAI EVENTS.
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Tiles */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pl-1">
                        <span className="h-px w-6 bg-[#a17a34]/50" />
                        <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#173d2c]/45 dark:text-white/35">
                          Planning Workspace Controls
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setShowMeetingModal(true)} 
                          className="p-5 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 dark:hover:border-[#d2b56b]/40 hover:bg-[#173d2c]/[0.025] dark:hover:bg-white/[0.025] text-left flex flex-col justify-between h-[115px] group transition-all duration-300 cursor-pointer"
                        >
                          <Video className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                          <div>
                            <span className="text-xs font-semibold text-[#143d2b] dark:text-[#f0e8db] block">Request Consultation</span>
                            <span className="text-[8.5px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 block mt-0.5">Schedule sync for {activeRequest.event_type}</span>
                          </div>
                        </button>
                        <button 
                          type="button"
                          onClick={() => router.push(`/customer/events/${activeRequest.id}?tab=journey`)}
                          className="p-5 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 dark:hover:border-[#d2b56b]/40 hover:bg-[#173d2c]/[0.025] dark:hover:bg-white/[0.025] text-left flex flex-col justify-between h-[115px] group transition-all duration-300 cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                          <div>
                            <span className="text-xs font-semibold text-[#143d2b] dark:text-[#f0e8db] block">Event Journey</span>
                            <span className="text-[8.5px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 block mt-0.5">View timeline</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Panel: Coordinator experience */}
                  <div className="lg:col-span-4 space-y-8 w-full">
                    
                    {/* Concierge Coordinator Details Card */}
                    <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
                      <div className="space-y-4">
                        <span className="text-[8px] uppercase font-bold tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b] block">Your Dedicated Partner</span>
                        <h3 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                          Event Coordinator
                        </h3>

                        {activeRequest.event_assignments && activeRequest.event_assignments.length > 0 && activeRequest.event_assignments[0].profiles ? (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 bg-[#f3eadf] dark:bg-white/[0.03] border border-[#173d2c]/15 dark:border-white/[0.10] flex items-center justify-center text-[#9a742e] dark:text-[#d2b56b] font-bold text-sm uppercase relative overflow-hidden shrink-0">
                                <span className="relative z-10">{activeRequest.event_assignments[0].profiles.full_name.substring(0, 2)}</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#143d2b] dark:text-[#f0e8db]">
                                  {activeRequest.event_assignments[0].profiles.full_name}
                                </h4>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] font-bold mt-0.5">
                                  Dedicated Planning Partner
                                </p>
                              </div>
                            </div>

                            <p className="text-[11px] text-[#173d2c]/65 dark:text-[#eee5d7]/55 leading-relaxed font-light">
                              {activeRequest.event_assignments[0].handover_notes || 
                               "Your coordinator is coordinating setups, decor timelines, and layout parameters for staging."}
                            </p>

                            <div className="space-y-2.5 pt-3.5 text-[10px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 border-t border-[#173d2c]/10 dark:border-white/[0.08] font-mono">
                              <div className="flex items-center gap-2.5">
                                <Phone className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                                <span>{activeRequest.event_assignments[0].profiles.phone_number}</span>
                              </div>
                              <div className="flex items-center gap-2.5 truncate">
                                <Mail className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                                <span className="truncate">{activeRequest.event_assignments[0].profiles.email}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-1.5">
                              <a
                                href={`tel:${activeRequest.event_assignments[0].profiles.phone_number}`}
                                className="px-3 py-2 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.18em] text-center transition cursor-pointer"
                              >
                                Call
                              </a>
                              <a
                                href={`mailto:${activeRequest.event_assignments[0].profiles.email}`}
                                className="px-3 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.18em] text-center transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer"
                              >
                                Email
                              </a>
                            </div>

                            <button
                              onClick={() => setShowMeetingModal(true)}
                              className="w-full py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.18em] text-center cursor-pointer transition duration-200 mt-2"
                            >
                              Request Consultation
                            </button>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light flex flex-col items-center justify-center gap-3 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-dashed border-[#173d2c]/15 dark:border-white/[0.08]">
                            <UserCheck className="w-6 h-6 text-[#a17a34] dark:text-[#d2b56b] animate-pulse" />
                            <p className="max-w-[190px] leading-relaxed mx-auto text-[11px]">
                              Pending Coordinator allocation. Our dispatch team is allocating your private consultant.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick milestone update tracker */}
                    {activeRequest.status !== "Cancelled" && (
                      <div className="p-6 sm:p-7 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-4">
                        <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b] block">
                          Latest Progress Update
                        </span>
                        <div className="space-y-3.5">
                          {activeRequest.timelines && activeRequest.timelines.filter(t => !t.is_internal).length > 0 ? (
                            activeRequest.timelines
                              .filter(t => !t.is_internal)
                              .slice(0, 2)
                              .map((timeline) => (
                                <div key={timeline.id} className="text-xs space-y-1.5 border-l-2 border-[#a17a34] dark:border-[#d2b56b] pl-3">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-[#143d2b] dark:text-[#f0e8db]">{timeline.milestone_name}</span>
                                    <span className="text-[8.5px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono">{formatDate(timeline.created_at)}</span>
                                  </div>
                                  <p className="text-[11px] text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light leading-relaxed">
                                    {timeline.description}
                                  </p>
                                </div>
                              ))
                          ) : (
                            <p className="text-[11px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-light py-2 text-center">
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
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Portfolio History</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                    My Events Chronicle
                  </h2>
                  <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 mt-1 font-light">
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
                        onClick={() => router.push(`/customer/events/${req.id}`)}
                        className={`bg-[#fbf7f0] dark:bg-[#161813] border p-6 flex flex-col justify-between gap-6 transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm ${
                          isCancelled 
                            ? "border-[#173d2c]/10 dark:border-white/[0.08] opacity-60 hover:opacity-85" 
                            : isCompleted 
                            ? "border-[#173d2c]/10 dark:border-white/[0.08] grayscale hover:grayscale-0 hover:border-[#a17a34]/40" 
                            : isActiveCase
                            ? "border-[#a17a34]/60 dark:border-[#d2b56b]/60 shadow-md" 
                            : "border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/45"
                        }`}
                      >
                        {/* Status Ribbon Ribbon */}
                        <div className="absolute right-0 top-0 overflow-hidden w-28 h-28 pointer-events-none">
                          <div className={`absolute text-[7.5px] font-bold uppercase tracking-[0.16em] text-center py-1.5 w-[140px] rotate-45 top-6 -right-7 shadow-sm ${
                            isCancelled 
                              ? "bg-red-950/40 text-red-400 border border-red-900/30" 
                              : isCompleted 
                              ? "bg-zinc-800 text-zinc-300" 
                              : "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812]"
                          }`}>
                            {req.status}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-[0.2em]">Archived ID: {req.id.substring(0, 8)}</span>
                            <h3 className="text-xl font-normal text-[#143d2b] dark:text-[#f0e8db] font-heading pr-12" style={{ fontFamily: '"Playfair Display", serif' }}>{req.event_type}</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#173d2c]/40 dark:text-white/30 uppercase font-bold tracking-[0.18em]">Event Date</span>
                              <p className="font-semibold text-[#143d2b] dark:text-[#f0e8db] font-mono">{req.event_date}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#173d2c]/40 dark:text-white/30 uppercase font-bold tracking-[0.18em]">Total Budget</span>
                              <p className="font-semibold text-[#143d2b] dark:text-[#f0e8db] font-mono">₹{Number(req.total_budget).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#173d2c]/40 dark:text-white/30 uppercase font-bold tracking-[0.18em]">Guest Parameters</span>
                              <p className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">{req.guest_count} Guests</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#173d2c]/40 dark:text-white/30 uppercase font-bold tracking-[0.18em]">Staging Venue</span>
                              <p className="font-semibold text-[#143d2b] dark:text-[#f0e8db] truncate max-w-[130px]">{req.location.split(",")[0]}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#173d2c]/10 dark:border-white/[0.08] pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#f3eadf] dark:bg-white/[0.03] border border-[#173d2c]/15 dark:border-white/[0.10] flex items-center justify-center text-[#9a742e] dark:text-[#d2b56b] font-mono font-bold text-[9px] uppercase">
                              {req.event_assignments?.[0]?.profiles?.full_name?.substring(0, 2) || "OM"}
                            </div>
                            <span className="text-[10px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light">
                              Partner: {req.event_assignments?.[0]?.profiles?.full_name || "Pending Allocation"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/customer/events/${req.id}`);
                            }}
                            className="px-4 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3. EVENT JOURNEY CONSOLIDATED INTO EVENT WORKSPACE */}
            {currentTab === "journey" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] text-center space-y-4 max-w-2xl mx-auto shadow-sm"
              >
                <Compass className="w-9 h-9 text-[#a17a34] dark:text-[#d2b56b] mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Event Journey Consolidated
                </h2>
                <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light leading-relaxed">
                  The Event Journey timeline is now integrated directly inside each event workspace under My Events. Select an event to view its live execution journey.
                </p>
                {activeRequest && (
                  <button
                    type="button"
                    onClick={() => router.push(`/customer/events/${activeRequest.id}?tab=journey`)}
                    className="px-6 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer inline-flex items-center gap-2 mt-2"
                  >
                    <span>View Journey for {activeRequest.event_type}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}

            {/* 4. MEDIA STUDIO TAB */}
            {currentTab === "media" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <CustomerMediaStudio />
              </motion.div>
            )}

            {/* 5. MEETINGS SCHEDULE TAB */}
            {currentTab === "meetings" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Consultation Schedule</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                      Meetings & Consultations
                    </h2>
                    <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 mt-1 font-light">
                      Sync with your dedicated planner partner to coordinate decor details, staging, and catering layouts.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMeetingModal(true)}
                    className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Request Meeting
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Interactive Moving Planning Calendar */}
                  <div className="lg:col-span-4 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-5.5 space-y-4 w-full shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Planning Calendar</h3>
                      {selectedCalendarDay !== null && (
                        <button
                          onClick={() => setSelectedCalendarDay(null)}
                          className="text-[9px] uppercase font-bold text-[#a17a34] dark:text-[#d2b56b] hover:underline cursor-pointer tracking-[0.16em]"
                        >
                          Clear Day Filter
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* Calendar Month Header with Working Prev/Next Month Controls */}
                      <div className="flex justify-between items-center text-xs border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-2.5">
                        <span className="font-normal text-[#143d2b] dark:text-[#f0e8db] font-heading tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>
                          {MONTH_NAMES[calendarMonth]} {calendarYear}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-7 h-7 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-center text-[#173d2c] dark:text-[#f0e8db] hover:border-[#a17a34]/40 hover:text-[#a17a34] transition cursor-pointer text-xs font-bold"
                            title="Previous Month"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-7 h-7 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-center text-[#173d2c] dark:text-[#f0e8db] hover:border-[#a17a34]/40 hover:text-[#a17a34] transition cursor-pointer text-xs font-bold"
                            title="Next Month"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                          <span key={d} className="text-[#173d2c]/40 dark:text-white/30 font-bold py-1">{d}</span>
                        ))}
                        
                        {/* Blank padding cells before 1st day of month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                          <span key={`blank-${idx}`} className="py-1" />
                        ))}

                        {/* Actual days of month */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const day = idx + 1;
                          const hasActivity = activeMeetingDays.has(day);
                          const isSelected = selectedCalendarDay === day;

                          return (
                            <button 
                              key={day} 
                              type="button"
                              onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                              className={`py-1.5 font-bold transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-sm scale-105"
                                  : hasActivity
                                  ? "bg-[#a17a34]/15 text-[#a17a34] dark:bg-[#d2b56b]/15 dark:text-[#d2b56b] border border-[#a17a34]/40 dark:border-[#d2b56b]/40 hover:bg-[#143d2b] hover:text-white"
                                  : "hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[#173d2c]/75 dark:text-[#eee5d7]/70"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[9.5px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 flex items-center gap-1.5 font-light pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                        <span className="w-2 h-2 rounded-full bg-[#a17a34] dark:bg-[#d2b56b] inline-block shrink-0" />
                        <span>Highlighted days represent active staging calls or event dates.</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Dynamic Database Meetings List */}
                  <div className="lg:col-span-8 space-y-5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">
                          Staging Calls & Consultations ({filteredMeetingsList.length})
                        </h3>
                        {selectedCalendarDay !== null && (
                          <span className="text-[10px] font-bold text-[#a17a34] dark:text-[#d2b56b] block mt-0.5">
                            Filtered for {MONTH_NAMES[calendarMonth]} {selectedCalendarDay}, {calendarYear}
                          </span>
                        )}
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {[
                          { id: "all", label: "All Calls" },
                          { id: "scheduled", label: "Scheduled" },
                          { id: "pending", label: "Pending" },
                          { id: "completed", label: "Past / Closed" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setMeetingFilter(f.id)}
                            className={`px-3 py-1 text-[8px] font-bold uppercase tracking-[0.18em] transition cursor-pointer ${
                              meetingFilter === f.id
                                ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812]"
                                : "bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/60 dark:text-[#eee5d7]/50 hover:text-[#143d2b]"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredMeetingsList.length === 0 ? (
                      <div className="p-10 border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] bg-[#fbf7f0] dark:bg-[#161813] text-center space-y-3">
                        <Video className="w-8 h-8 text-[#a17a34] dark:text-[#d2b56b] mx-auto" />
                        <h4 className="text-sm font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>No Consultations Found</h4>
                        <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 max-w-sm mx-auto font-light leading-relaxed">
                          {selectedCalendarDay !== null
                            ? `No meetings scheduled on ${MONTH_NAMES[calendarMonth]} ${selectedCalendarDay}, ${calendarYear}.`
                            : "Click 'Request Meeting' above to schedule a sync with your SAI EVENTS Operational Manager."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredMeetingsList.map((m) => {
                          const isScheduled = m.status === "Scheduled";
                          const isPending = m.status === "Pending";
                          const isRejected = m.status === "Rejected";

                          return (
                            <div
                              key={m.id}
                              className={`p-5 sm:p-6 bg-[#fbf7f0] dark:bg-[#161813] border transition-all space-y-4 shadow-sm ${
                                isScheduled
                                  ? "border-[#a17a34]/60 dark:border-[#d2b56b]/60"
                                  : isPending
                                  ? "border-amber-500/40"
                                  : "border-[#173d2c]/10 dark:border-white/[0.08]"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 border ${
                                      isScheduled
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                        : isPending
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                        : isRejected
                                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                                        : "bg-[#f3eadf]/50 text-[#173d2c]/60 border-[#173d2c]/10 dark:border-white/[0.08]"
                                    }`}>
                                      {m.status} Sync
                                    </span>
                                    {m.event_requests?.event_type && (
                                      <span className="text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono">
                                        · {m.event_requests.event_type}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-normal text-[#143d2b] dark:text-[#f0e8db] font-heading mt-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                                    {m.purpose}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-mono shrink-0">
                                  <CalendarDays className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                                  <span>
                                    {m.confirmed_date || m.preferred_date} {m.confirmed_time ? `· ${m.confirmed_time}` : `(${m.preferred_time_window})`}
                                  </span>
                                </div>
                              </div>

                              {m.notes && (
                                <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 leading-relaxed font-light bg-[#f3eadf]/50 dark:bg-white/[0.02] p-3 border border-[#173d2c]/10 dark:border-white/[0.08]">
                                  {m.notes}
                                </p>
                              )}

                              {m.admin_notes && (
                                <div className="text-xs text-[#9a742e] dark:text-[#d2b56b] bg-[#f3eadf]/60 dark:bg-white/[0.02] p-3 border border-[#a17a34]/30 dark:border-[#d2b56b]/30 space-y-1">
                                  <span className="text-[8px] uppercase font-bold tracking-[0.2em] block text-[#9a742e] dark:text-[#d2b56b]">Admin Response Note:</span>
                                  <p className="font-light">{m.admin_notes}</p>
                                </div>
                              )}

                              <div className="border-t border-[#173d2c]/10 dark:border-white/[0.08] pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                                <div className="flex items-center gap-2 text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-mono text-[10px]">
                                  <Video className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                                  <span>
                                    {isScheduled ? "Live Sync Link Available" : "Waiting for Admin Link Allocation"}
                                  </span>
                                </div>

                                {isScheduled && m.meeting_link && (
                                  <a
                                    href={m.meeting_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow flex items-center gap-1.5"
                                  >
                                    Join Video Call <ArrowUpRight className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                  <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#173d2c] dark:text-[#f0e8db]">Notifications Activity Log</h2>
                  <p className="text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/45 mt-1 font-light">
                    Review milestones updates, document registry logs, and coordination status changes.
                  </p>
                </div>

                <div className="p-6 sm:p-8 md:p-10 rounded-[28px] bg-[#f8f2e9]/80 dark:bg-[#171914]/80 border border-[#173d2c]/10 dark:border-white/[0.08] shadow-md">
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
                                ? "bg-[#a17a34] dark:bg-[#d2b56b] shadow-[0_0_6px_rgba(212,175,55,0.8)] animate-pulse" 
                                : "bg-border"
                            }`} />

                            <div className="space-y-1.5 flex-1 bg-[#173d2c]/[0.02] dark:bg-black/10 border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/15 dark:border-[#d2b56b]/15 p-4.5 rounded-xl transition duration-250">
                              <div className="flex justify-between items-center gap-2.5">
                                <span className="text-[8.5px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-widest font-mono">SAI SYSTEM UPDATE</span>
                                <span className="text-[8.5px] text-[#173d2c]/50 dark:text-[#eee5d7]/45 font-mono">{formatDate(notif.created_at)}</span>
                              </div>
                              <p className="text-xs text-[#173d2c] dark:text-[#f0e8db]/80 leading-relaxed font-light">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/45 font-light flex flex-col items-center justify-center gap-3">
                      <Bell className="w-7 h-7 text-[#173d2c]/50 dark:text-[#eee5d7]/45/35" />
                      <p>No activity logs or alerts registered yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}



            {/* 8. MY ENQUIRIES TAB */}
            {currentTab === "enquiries" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#173d2c]/10 dark:border-white/[0.08]">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Concierge History</span>
                      </div>
                      <h3 className="text-2xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Previous Enquiries & Consultations
                      </h3>
                      <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 mt-1 font-light">
                        Historical record of enquiries raised with SAI EVENTS before or after creating your account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEnquiryModal(true)}
                      className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] inline-flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      New Consultation
                    </button>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] bg-[#f3eadf]/40 dark:bg-white/[0.015] space-y-4">
                      <HelpCircle className="w-8 h-8 text-[#a17a34] dark:text-[#d2b56b] mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>No Previous Enquiries Found</h4>
                        <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 max-w-sm mx-auto leading-relaxed font-light">
                          You have not submitted any consultation enquiries with your registered email address yet.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEnquiryModal(true)}
                        className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer"
                      >
                        Submit Consultation Enquiry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enquiries.map((enquiry) => (
                        <div
                          key={enquiry.id}
                          className="p-5 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 transition-all space-y-3 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="px-3 py-1 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.18em]">
                                {enquiry.event_type}
                              </span>
                              <span className="text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono">
                                Submitted: {formatDate(enquiry.created_at)}
                              </span>
                            </div>

                            <div>
                              {enquiry.status === "resolved" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[8px] font-bold uppercase tracking-[0.18em]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Resolved
                                </span>
                              ) : enquiry.status === "in_progress" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[8px] font-bold uppercase tracking-[0.18em]">
                                  <Clock className="w-3.5 h-3.5" />
                                  In Progress
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[8px] font-bold uppercase tracking-[0.18em]">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Submitted
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/50 dark:text-white/40">
                              Enquiry Details:
                            </span>
                            <p className="text-xs text-[#173d2c]/75 dark:text-[#eee5d7]/70 leading-relaxed whitespace-pre-wrap font-light">
                              {enquiry.event_description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08] flex items-center gap-2 text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-light">
                            <Shield className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                            <span>SAI EVENTS Managed Operations: Our team directly coordinates all consultation requests.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

      {/* ─── UPLOAD DOCUMENT MODAL ─── */}
      {showUploadModal && activeRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <h3 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Add Reference Document
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-[#173d2c]/50 dark:text-[#eee5d7]/40 hover:text-[#143d2b] dark:hover:text-[#f0e8db] transition cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Document Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Mandap Decor Inspiration"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] text-xs font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">File Category *</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] cursor-pointer text-xs"
                >
                  <option value="inspiration">Inspiration Image</option>
                  <option value="reference">Reference Document</option>
                  <option value="venue">Venue Information</option>
                </select>
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4.5 py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
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

            <form onSubmit={handleRequestMeetingSubmit} className="space-y-4 text-xs">
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
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] text-xs font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Time Window *</label>
                  <select
                    value={meetingTimeWindow}
                    onChange={(e) => setMeetingTimeWindow(e.target.value)}
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
                  placeholder="Mention any specific topics or participants..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] font-light text-xs resize-none"
                />
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
                  disabled={requestingMeeting}
                  className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md disabled:opacity-50"
                >
                  {requestingMeeting ? "Submitting..." : "Submit Meeting Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANCEL EVENT REQUEST MODAL ─── */}
      {showCancelModal && cancelTargetId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <h3 className="text-base font-normal font-heading text-red-600 dark:text-red-400" style={{ fontFamily: '"Playfair Display", serif' }}>
                Cancel Event Request
              </h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-[#173d2c]/50 dark:text-[#eee5d7]/40 hover:text-[#143d2b] dark:hover:text-[#f0e8db] transition cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <p className="text-[#173d2c]/65 dark:text-[#eee5d7]/55 text-xs font-light leading-relaxed">
                Are you sure you want to cancel this event request? Please select a cancellation reason.
              </p>

              <div className="space-y-2">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Select Cancellation Reason *</label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-red-500/30 text-[#173d2c] focus:border-red-500 focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] cursor-pointer text-xs font-medium"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">
                      {r}
                    </option>
                  ))}
                </select>

                {cancelReasonPreset === "Other (Specify custom reason)" && (
                  <div className="space-y-1.5 pt-2 animate-fade-in">
                    <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Specify Custom Reason *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Please specify your cancellation reason details..."
                      value={cancelCustomReason}
                      onChange={(e) => setCancelCustomReason(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-red-500/30 text-[#173d2c] focus:border-red-500 focus:outline-none dark:bg-white/[0.02] dark:text-[#f0e8db] font-light text-xs resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
                >
                  Keep Event
                </button>
                <button
                  type="submit"
                  disabled={cancellingId !== null}
                  className="px-5 py-3 bg-red-700 text-white font-bold text-[8px] uppercase tracking-[0.2em] transition hover:bg-red-800 cursor-pointer shadow-md"
                >
                  {cancellingId !== null ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── NEW CONSULTATION ENQUIRY MODAL ─── */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <form onSubmit={handleEnquirySubmit} className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-md w-full overflow-hidden p-6.5 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b]">SAI EVENTS Operations</span>
                <h3 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>Submit Consultation Enquiry</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowEnquiryModal(false)}
                className="p-1 text-[#173d2c]/50 dark:text-[#eee5d7]/40 hover:text-[#143d2b] dark:hover:text-[#f0e8db] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Event Archetype *</label>
                <select
                  value={enquiryEventType}
                  onChange={(e) => setEnquiryEventType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] cursor-pointer text-xs"
                >
                  <option value="Wedding Ceremony">Wedding Ceremony</option>
                  <option value="Wedding Reception">Wedding Reception</option>
                  <option value="Engagement Party">Engagement Party</option>
                  <option value="Birthday Celebration">Birthday Celebration</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Anniversary Gala">Anniversary Gala</option>
                  <option value="Housewarming">Housewarming</option>
                  <option value="Sreemantham / Baby Shower">Sreemantham / Baby Shower</option>
                  <option value="General Consultation">General Consultation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em]">Enquiry / Requirements Description *</label>
                <textarea
                  required
                  rows={4}
                  value={enquiryDescription}
                  onChange={(e) => setEnquiryDescription(e.target.value)}
                  placeholder="Describe your event ideas, dates, estimated budget, or specific questions..."
                  className="w-full p-3.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] font-light text-xs resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowEnquiryModal(false)} 
                className="px-4 py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEnquiry}
                className="px-5 py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md disabled:opacity-50"
              >
                {submittingEnquiry ? "Submitting..." : "Submit Enquiry"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default function DashboardList(props: DashboardListProps) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" /></div>}>
      <DashboardListInner {...props} />
    </Suspense>
  );
}