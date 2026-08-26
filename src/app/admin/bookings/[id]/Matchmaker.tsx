"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  User, MapPin, Scale, Clock, Send, ShieldCheck, 
  Briefcase, CheckCircle2, RefreshCw, XCircle, ImageIcon, 
  ExternalLink, Layers, Eye, BookOpen, Shield, CheckSquare, X
} from "lucide-react";
import { 
  updateRequestStatus, 
  assignOperationalManager, 
  reassignOperationalManager, 
  lockPlanningAndFinalize,
  dispatchLeadsToVendors,
  approveVendorAssignment,
  cancelVendorAssignment
} from "../actions";

interface VendorCandidate {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_name?: string;
  address?: string;
  availability_status?: string;
  rating?: number;
  completed_jobs?: number;
}

interface ServiceAssignment {
  id: string;
  vendor_id: string;
  status: string;
  proposed_quote?: number;
  profiles: {
    full_name: string;
    phone_number: string;
    email: string;
    business_name?: string;
    availability_status?: string;
  };
}

interface CategoryGroup {
  category: {
    id: string;
    name: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  mappedVendors: VendorCandidate[];
  assignments: ServiceAssignment[];
}

interface CustomerProfile {
  fullName: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  address: string;
  eventDate?: string;
  eventTime?: string;
  durationHours?: number;
  guestCount?: number;
  minGuestCount?: number;
  maxGuestCount?: number;
  budgetRange?: string;
  celebrantName?: string;
  eventFor?: string;
  additionalContacts?: { name: string; phone: string; relation?: string }[];
  referenceVideoUrl?: string;
  referenceImages?: string[];
  specialRequirements?: string;
}

interface MatchmakerProps {
  requestId: string;
  currentStatus: string;
  customerProfile: CustomerProfile;
  customerEventParts?: any[];
  groups: CategoryGroup[];
  availableOMs: any[];
  activeOMAssignment?: any;
  omAssignments?: any[];
  timelineLogs?: any[];
}

export default function Matchmaker({
  requestId,
  currentStatus,
  customerProfile,
  customerEventParts = [],
  groups,
  availableOMs,
  activeOMAssignment,
}: MatchmakerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    groups.length > 0 ? groups[0].category.id : ""
  );
  
  // Multi-vendor selection per category
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // OM Assignment form states
  const [selectedOMId, setSelectedOMId] = useState<string>("");
  const [expectedCompletion, setExpectedCompletion] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  // OM Reassign form states
  const [isReassigning, setIsReassigning] = useState<boolean>(false);
  const [reassignOMId, setReassignOMId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState<string>("");
  const [reassignNotes, setReassignNotes] = useState<string>("");

  // Zoom Image Lightbox Modal state
  const [zoomImageModalUrl, setZoomImageModalUrl] = useState<string | null>(null);

  const activeGroup = groups.find((g) => g.category.id === activeCategoryId) || groups[0];

  const handleStatusChange = async (newStatus: string) => {
    setLoadingAction("status");
    setError(null);
    try {
      await updateRequestStatus(requestId, newStatus);
      setStatus(newStatus);
      setSuccess(`Status updated to "${newStatus}".`);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVendorToggle = (catId: string, vendorId: string) => {
    setSelectedVendors((prev) => {
      const current = prev[catId] || [];
      const updated = current.includes(vendorId)
        ? current.filter((id) => id !== vendorId)
        : [...current, vendorId];
      return { ...prev, [catId]: updated };
    });
  };

  const handleSelectAllVendors = (catId: string, vendors: VendorCandidate[]) => {
    setSelectedVendors((prev) => {
      const allIds = vendors.map((v) => v.id);
      const current = prev[catId] || [];
      const isAllSelected = allIds.every((id) => current.includes(id));
      return { ...prev, [catId]: isAllSelected ? [] : allIds };
    });
  };

  const handleDispatch = async (catId: string) => {
    const vendorIds = selectedVendors[catId] || [];
    if (vendorIds.length === 0) return;

    setLoadingAction(`dispatch-${catId}`);
    setError(null);
    try {
      await dispatchLeadsToVendors(requestId, catId, vendorIds);
      setSuccess(`Dispatched lead invitations to ${vendorIds.length} vendor(s).`);
      setSelectedVendors((prev) => ({ ...prev, [catId]: [] }));
    } catch (err: any) {
      setError(err.message || "Failed to dispatch invitations.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAssignOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOMId) return;

    setLoadingAction("assign-om");
    setError(null);
    try {
      await assignOperationalManager(requestId, selectedOMId, handoverNotes, expectedCompletion);
      setSuccess("Operational Manager assigned successfully.");
      setStatus("Operational Manager Assigned");
    } catch (err: any) {
      setError(err.message || "Failed to assign Operational Manager.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReassignOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignOMId || !reassignReason.trim()) return;

    setLoadingAction("reassign-om");
    setError(null);
    try {
      await reassignOperationalManager(requestId, reassignOMId, reassignReason, reassignNotes);
      setSuccess("Operational Manager reassigned successfully.");
      setIsReassigning(false);
      setReassignOMId("");
      setReassignReason("");
      setReassignNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to reassign Operational Manager.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLockPlanning = async () => {
    setLoadingAction("lock-planning");
    setError(null);
    try {
      await lockPlanningAndFinalize(requestId);
      setSuccess("Event Planning Locked & Finalized! OM notification sent.");
      setStatus("Ready For Execution");
    } catch (err: any) {
      setError(err.message || "Failed to lock planning.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = async (assignmentId: string) => {
    setLoadingAction(`approve-${assignmentId}`);
    setError(null);
    try {
      await approveVendorAssignment(requestId, assignmentId);
      setSuccess("Vendor finalized and assigned to this service.");
    } catch (err: any) {
      setError(err.message || "Failed to finalize vendor.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to cancel this vendor invitation?")) return;
    setLoadingAction(`cancel-${assignmentId}`);
    setError(null);
    try {
      await cancelVendorAssignment(assignmentId, requestId);
      setSuccess("Vendor invitation cancelled.");
    } catch (err: any) {
      setError(err.message || "Failed to cancel vendor invitation.");
    } finally {
      setLoadingAction(null);
    }
  };

  const allCategoriesFinalized = groups.every((g) =>
    g.assignments.some((asg) => asg.status === "Approved")
  );

  const getAvailabilityBadge = (status?: string) => {
    switch (status) {
      case "Available":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Available</span>;
      case "Busy":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Busy</span>;
      case "Not Available":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Not Available</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Available</span>;
    }
  };

  const assignmentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Accepted":
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Approved":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Cancelled":
      case "Rejected":
        return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-[#173d2c]/60 dark:text-[#eee5d7]/50 bg-black/5 border-black/10";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-100/90 border border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 text-xs rounded-xl flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 font-bold ml-2">✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-100/90 border border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between shadow-sm">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-700 dark:text-emerald-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* ── Top Level Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Case Details */}
        <div className="space-y-6">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-5">
            <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              <User className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
              <span>Customer Specification Details</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Primary Contact</span>
                <div className="font-bold text-[#143d2b] dark:text-[#f0e8db] text-sm mt-0.5">{customerProfile.fullName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] pt-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Phone Number</span>
                  <div className="font-mono text-[#143d2b] dark:text-[#f0e8db] font-semibold mt-0.5">{customerProfile.phone}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Email Address</span>
                  <div className="font-mono text-[#173d2c]/70 dark:text-[#eee5d7]/60 truncate mt-0.5">{customerProfile.email}</div>
                </div>
              </div>

              {customerProfile.additionalContacts && customerProfile.additionalContacts.length > 0 && (
                <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">
                    Secondary Contacts ({customerProfile.additionalContacts.length})
                  </span>
                  {customerProfile.additionalContacts.map((ac: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] text-[11px] space-y-0.5">
                      <div className="font-bold text-[#143d2b] dark:text-[#f0e8db]">{ac.name} <span className="text-[9px] text-[#173d2c]/50 dark:text-white/40 font-normal">({ac.relation || "Contact"})</span></div>
                      <div className="font-mono text-[#9a742e] dark:text-[#d2b56b]">{ac.phone}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Event Main Venue</span>
                <div className="text-[#143d2b] dark:text-[#f0e8db] mt-1 flex items-start gap-1.5 font-light leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0 mt-0.5" />
                  <span>{customerProfile.address || "Venue address pending"}</span>
                </div>
              </div>

              {/* Event Timing & Specifications */}
              <div className="pt-4 border-t border-[#173d2c]/10 dark:border-white/[0.08] space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b] block">
                  Event Parameters & Timing
                </span>
                <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#f3eadf]/50 dark:bg-white/[0.02] p-3 border border-[#173d2c]/10 dark:border-white/[0.08]">
                  <div>
                    <span className="text-[#173d2c]/50 dark:text-white/40 text-[8.5px] uppercase tracking-wider block">Date & Start Time</span>
                    <div className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5">
                      {customerProfile.eventDate || "Date Pending"} {customerProfile.eventTime && `at ${customerProfile.eventTime}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#173d2c]/50 dark:text-white/40 text-[8.5px] uppercase tracking-wider block">Duration</span>
                    <div className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5">
                      {customerProfile.durationHours ? `${customerProfile.durationHours} Hours` : "Standard"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#173d2c]/50 dark:text-white/40 text-[8.5px] uppercase tracking-wider block">Guest Range</span>
                    <div className="font-semibold text-[#143d2b] dark:text-[#f0e8db] mt-0.5">
                      {customerProfile.minGuestCount ? `${customerProfile.minGuestCount}–${customerProfile.maxGuestCount}` : customerProfile.guestCount || "N/A"} Guests
                    </div>
                  </div>
                  <div>
                    <span className="text-[#173d2c]/50 dark:text-white/40 text-[8.5px] uppercase tracking-wider block">Target Budget</span>
                    <div className="font-mono font-bold text-[#9a742e] dark:text-[#d2b56b] mt-0.5">
                      {customerProfile.budgetRange || "Flexible"}
                    </div>
                  </div>
                </div>

                {customerProfile.celebrantName && (
                  <div className="text-[11px]">
                    <span className="text-[#173d2c]/50 dark:text-white/40 text-[9px] uppercase tracking-wider">Celebrant / Host: </span>
                    <span className="font-bold text-[#143d2b] dark:text-[#f0e8db]">{customerProfile.celebrantName} ({customerProfile.eventFor || "Host"})</span>
                  </div>
                )}
              </div>

              {customerProfile.specialRequirements && (
                <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Customer Special Notes</span>
                  <p className="text-xs text-[#173d2c]/80 dark:text-[#eee5d7]/80 font-light mt-1 whitespace-pre-line leading-relaxed italic">
                    "{customerProfile.specialRequirements}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sub-Events & Function Locations Card ── */}
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-4">
            <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center justify-between" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                <span>Selected Sub-Events & Locations</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-[#a17a34] dark:text-[#d2b56b] bg-[#a17a34]/10 px-2 py-0.5 border border-[#a17a34]/20">
                {customerEventParts?.length || 0} Functions
              </span>
            </h3>

            {customerEventParts && customerEventParts.length > 0 ? (
              <div className="space-y-3.5 divide-y divide-[#173d2c]/10 dark:divide-white/[0.08]">
                {customerEventParts.map((part: any, idx: number) => (
                  <div key={part.id || idx} className="pt-3.5 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a17a34] dark:bg-[#d2b56b]" />
                        {part.event_part_name}
                      </span>
                      <span className="text-[9.5px] font-mono font-bold text-[#9a742e] dark:text-[#d2b56b] bg-[#f3eadf] dark:bg-white/[0.04] px-2 py-0.5">
                        {part.event_date || customerProfile.eventDate || "Date Pending"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 pl-3.5 border-l-2 border-[#a17a34]">
                      <div className="flex items-center gap-1.5 text-[#143d2b] dark:text-[#f0e8db] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#a17a34] shrink-0" />
                        <span>{part.venue_location || part.venue_address || part.venue_name || customerProfile.address || "Location to be finalized"}</span>
                      </div>
                      {part.required_services && part.required_services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {part.required_services.map((srv: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-[#f3eadf] dark:bg-white/[0.04] border border-[#173d2c]/10 dark:border-white/10 text-[9.5px] font-semibold text-[#143d2b] dark:text-[#eee5d7]">
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
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 italic font-light">
                No specific sub-events recorded for this event.
              </p>
            )}
          </div>

          {/* Reference Media Card */}
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-4">
            <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center justify-between" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                <span>Reference Media & Attachments</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-[#a17a34] dark:text-[#d2b56b] bg-[#a17a34]/10 px-2 py-0.5 border border-[#a17a34]/20">
                {customerProfile.referenceImages?.length || 0} Attached
              </span>
            </h3>

            {customerProfile.referenceImages && customerProfile.referenceImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {customerProfile.referenceImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setZoomImageModalUrl(imgUrl)}
                    className="relative aspect-[4/3] border border-[#173d2c]/15 bg-black/10 cursor-pointer group hover:border-[#a17a34] transition overflow-hidden"
                  >
                    <img src={imgUrl} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 italic font-light">
                No reference images attached for this event case.
              </p>
            )}

            {customerProfile.referenceVideoUrl && (
              <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] block">Reference Video Link</span>
                <a
                  href={customerProfile.referenceVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#9a742e] hover:underline flex items-center gap-1.5 truncate"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{customerProfile.referenceVideoUrl}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Selected Service List */}
        <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#173d2c]/10 dark:border-white/[0.08]">
            <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              <BookOpen className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
              <span>Selected Service List</span>
            </h3>
          </div>

          <div className="space-y-4">
            {groups.map((group) => {
              const isGroupApproved = group.assignments.some((asg) => asg.status === "Approved");
              const isGroupPending = group.assignments.some((asg) => asg.status === "Pending");
              const isGroupAccepted = group.assignments.some((asg) => asg.status === "Accepted");

              const statusColor = isGroupApproved
                ? "bg-emerald-600"
                : isGroupAccepted
                ? "bg-amber-500 animate-pulse"
                : isGroupPending
                ? "bg-orange-500"
                : "bg-red-600";

              const isSelected = activeCategoryId === group.category.id;

              return (
                <div 
                  key={group.category.id} 
                  onClick={() => setActiveCategoryId(group.category.id)}
                  className={`p-4 border transition cursor-pointer relative ${
                    isSelected
                      ? "bg-[#efe3cc] dark:bg-[#25251d] border-[#a17a34] dark:border-[#d2b56b] ring-1 ring-[#a17a34]/30" 
                      : "bg-[#fffaf3]/60 dark:bg-white/[0.02] border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-heading text-sm font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />
                      {group.category.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#9a742e] dark:text-[#d2b56b]">
                      ₹{group.items.reduce((acc, c) => acc + c.lineTotal, 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3 border-l border-[#173d2c]/15 dark:border-white/10">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-[#173d2c]/75 dark:text-[#eee5d7]/70 font-light">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-mono text-[#9a742e] dark:text-[#d2b56b]">₹{item.lineTotal.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Intelligent Vendor Selection Console & OM Workflow */}
        <div className="space-y-6">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-5">
            <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              <Shield className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
              <span>Vendor Selection & Dispatch Console</span>
            </h3>

            {activeGroup ? (
              <div className="space-y-5">
                <div className="p-3.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] text-xs text-[#173d2c]/75 dark:text-[#eee5d7]/70 leading-relaxed flex items-center justify-between">
                  <span>Category: <strong className="text-[#143d2b] dark:text-[#f0e8db] font-semibold">{activeGroup.category.name}</strong></span>
                  <Link
                    href={`/admin/bookings/${requestId}/compare`}
                    className="text-[#9a742e] dark:text-[#d2b56b] font-bold hover:underline"
                  >
                    Compare All ({activeGroup.assignments.length})
                  </Link>
                </div>

                {/* Candidate Suppliers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b]">Candidate Suppliers</h5>
                    {activeGroup.mappedVendors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSelectAllVendors(activeGroup.category.id, activeGroup.mappedVendors)}
                        className="text-[10px] font-bold text-[#9a742e] dark:text-[#d2b56b] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3" /> Select All
                      </button>
                    )}
                  </div>

                  {activeGroup.mappedVendors.length === 0 ? (
                    <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 py-2 italic font-light">No registered vendors in this category.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {activeGroup.mappedVendors.map((vendor) => {
                        const isAssigned = activeGroup.assignments.some((a) => a.vendor_id === vendor.id);
                        const isSelected = (selectedVendors[activeGroup.category.id] || []).includes(vendor.id);

                        return (
                          <div
                            key={vendor.id}
                            onClick={() => !isAssigned && handleVendorToggle(activeGroup.category.id, vendor.id)}
                            className={`p-3 border flex items-center justify-between transition cursor-pointer select-none text-xs ${
                              isAssigned
                                ? "bg-black/5 opacity-55 cursor-not-allowed"
                                : isSelected
                                ? "bg-[#efe3cc] dark:bg-[#25251d] border-[#a17a34]"
                                : "bg-[#fffaf3]/60 dark:bg-white/[0.02] border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-[#143d2b] dark:text-[#f0e8db]">{vendor.business_name || vendor.full_name}</div>
                              <div className="flex items-center gap-2 text-[9.5px]">
                                <span className="text-[#173d2c]/50 dark:text-white/40">Owner: {vendor.full_name}</span>
                                {getAvailabilityBadge(vendor.availability_status)}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected || isAssigned}
                              disabled={isAssigned}
                              onChange={() => {}}
                              className="h-4 w-4 cursor-pointer accent-[#143d2b] dark:accent-[#d2b56b]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDispatch(activeGroup.category.id)}
                  disabled={
                    loadingAction === `dispatch-${activeGroup.category.id}` || 
                    (selectedVendors[activeGroup.category.id] || []).length === 0
                  }
                  className="w-full py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] font-bold text-xs uppercase tracking-[0.16em] transition disabled:opacity-55 cursor-pointer shadow-md hover:brightness-110"
                >
                  {loadingAction === `dispatch-${activeGroup.category.id}` ? "Dispatching..." : `Dispatch Leads to Selected (${(selectedVendors[activeGroup.category.id] || []).length})`}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 italic">Select a category on the left to review vendor options.</p>
            )}
          </div>

          {/* Operational Manager Assignment Card */}
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#173d2c]/10 dark:border-white/[0.08]">
              <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                <Briefcase className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                <span>Operational Manager Assignment</span>
              </h3>
              {activeOMAssignment && (
                <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {activeOMAssignment.status || "Assigned"}
                </span>
              )}
            </div>

            {activeOMAssignment ? (
              /* If already assigned: Show Current OM Details & Reassign Action */
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8.5px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-wider">Assigned Operations Manager</span>
                      <div className="font-bold text-[#143d2b] dark:text-[#f0e8db] mt-0.5 text-sm">
                        {activeOMAssignment.profiles?.full_name || "Assigned Manager"}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-bold">
                      Active Lead
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                    <div>
                      <span className="block text-[8.5px] uppercase font-bold text-[#173d2c]/50 dark:text-white/40">Phone</span>
                      <span className="font-mono text-[#143d2b] dark:text-[#f0e8db]">{activeOMAssignment.profiles?.phone_number || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[8.5px] uppercase font-bold text-[#173d2c]/50 dark:text-white/40">Email</span>
                      <span className="font-mono text-[#143d2b] dark:text-[#f0e8db] truncate block">{activeOMAssignment.profiles?.email || "N/A"}</span>
                    </div>
                  </div>

                  {activeOMAssignment.expected_completion && (
                    <div className="pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08] text-[10.5px]">
                      <span className="block text-[8.5px] uppercase font-bold text-[#173d2c]/50 dark:text-white/40">Target Completion Date</span>
                      <span className="font-mono font-bold text-[#9a742e] dark:text-[#d2b56b]">{activeOMAssignment.expected_completion}</span>
                    </div>
                  )}

                  {activeOMAssignment.handover_notes && (
                    <div className="pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08] text-[10.5px]">
                      <span className="block text-[8.5px] uppercase font-bold text-[#173d2c]/50 dark:text-white/40">Handover Instructions</span>
                      <p className="text-[#143d2b] dark:text-[#eee5d7] font-light leading-relaxed mt-0.5 italic">"{activeOMAssignment.handover_notes}"</p>
                    </div>
                  )}
                </div>

                {/* Reassign Toggle Button & Form */}
                {!isReassigning ? (
                  <button
                    type="button"
                    onClick={() => setIsReassigning(true)}
                    className="w-full py-2.5 bg-[#143d2b]/10 text-[#143d2b] dark:bg-[#d2b56b]/10 dark:text-[#d2b56b] border border-[#a17a34]/30 hover:bg-[#143d2b] hover:text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reassign Operational Manager</span>
                  </button>
                ) : (
                  <form onSubmit={handleReassignOM} className="p-3.5 bg-[#f3eadf]/80 dark:bg-white/[0.03] border border-amber-500/30 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-2">
                      <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Reassign Manager</span>
                      <button
                        type="button"
                        onClick={() => setIsReassigning(false)}
                        className="text-[#173d2c]/60 hover:text-[#143d2b] dark:text-white/40 text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b]">Select New Manager *</label>
                      <select
                        required
                        value={reassignOMId}
                        onChange={(e) => setReassignOMId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] font-medium cursor-pointer"
                      >
                        <option value="" className="bg-[#fbf7f0] dark:bg-[#161813]">Select Manager...</option>
                        {availableOMs
                          .filter((om) => om.id !== activeOMAssignment.assigned_operational_manager_id)
                          .map((om) => (
                            <option key={om.id} value={om.id} className="bg-[#fbf7f0] dark:bg-[#161813]">
                              {om.full_name} ({om.designation || "Operations"}) · Workload: {om.current_workload} events
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b]">Reassignment Reason *</label>
                      <input
                        type="text"
                        required
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        placeholder="e.g. Schedule conflict / Workload rebalancing"
                        className="w-full px-3 py-2 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b]">Internal Notes (Optional)</label>
                      <textarea
                        rows={2}
                        value={reassignNotes}
                        onChange={(e) => setReassignNotes(e.target.value)}
                        placeholder="Additional transition instructions..."
                        className="w-full p-2.5 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] resize-none font-light"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loadingAction === "reassign-om"}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {loadingAction === "reassign-om" ? "Reassigning..." : "Confirm Reassignment"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* If NOT assigned yet: Show Assignment Form */
              <form onSubmit={handleAssignOM} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-wider">Select Operational Manager *</label>
                  <select
                    required
                    value={selectedOMId}
                    onChange={(e) => setSelectedOMId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] font-semibold cursor-pointer"
                  >
                    <option value="" className="bg-[#fbf7f0] dark:bg-[#161813]">-- Select Active Operational Manager --</option>
                    {availableOMs.map((om) => (
                      <option key={om.id} value={om.id} className="bg-[#fbf7f0] dark:bg-[#161813]">
                        {om.full_name} ({om.designation || "Operations"}) · Workload: {om.current_workload} events
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-wider">Target Completion Date (Optional)</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-wider">Handover Notes / Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Instructions for assigned Operational Manager regarding vendor coordination or customer preferences..."
                    className="w-full p-2.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedOMId || loadingAction === "assign-om"}
                  className="w-full py-3 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] font-bold text-xs uppercase tracking-[0.16em] hover:brightness-110 transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{loadingAction === "assign-om" ? "Assigning Manager..." : "Assign Operational Manager"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Workflow Status Controls */}
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                <Clock className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
                <span>Workflow Controls</span>
              </h3>
              <Link
                href={`/admin/bookings/${requestId}/compare`}
                className="px-3 py-1 bg-[#143d2b]/10 text-[#143d2b] dark:bg-[#d2b56b]/10 dark:text-[#d2b56b] font-mono text-[9px] font-bold uppercase tracking-wider border border-[#a17a34]/30 hover:bg-[#143d2b] hover:text-white dark:hover:bg-[#d2b56b] dark:hover:text-black transition"
              >
                <Scale className="w-3 h-3 inline mr-1" /> Compare Quotes
              </Link>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="status-selector" className="text-[9px] font-bold text-[#9a742e] dark:text-[#d2b56b] uppercase tracking-[0.2em]">
                  Event Case Status
                </label>
                <select
                  id="status-selector"
                  value={status}
                  disabled={loadingAction === "status"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] font-semibold cursor-pointer"
                >
                  <option value="Request Submitted" className="bg-[#fbf7f0] dark:bg-[#161813]">Submitted</option>
                  <option value="Under Admin Review" className="bg-[#fbf7f0] dark:bg-[#161813]">Under Review</option>
                  <option value="Planning" className="bg-[#fbf7f0] dark:bg-[#161813]">Planning</option>
                  <option value="Vendor Selection In Progress" className="bg-[#fbf7f0] dark:bg-[#161813]">Vendor Selection In Progress</option>
                  <option value="Sent to Vendors" className="bg-[#fbf7f0] dark:bg-[#161813]">Sent to Vendors</option>
                  <option value="Vendor Accepted" className="bg-[#fbf7f0] dark:bg-[#161813]">Vendor Finalization In Progress</option>
                  <option value="Vendor Approved by Admin" className="bg-[#fbf7f0] dark:bg-[#161813]">Vendor Finalized</option>
                  <option value="Ready For Execution" className="bg-[#fbf7f0] dark:bg-[#161813]">Ready For Execution</option>
                  <option value="Operational Manager Assigned" className="bg-[#fbf7f0] dark:bg-[#161813]">OM Assigned</option>
                  <option value="Preparation" className="bg-[#fbf7f0] dark:bg-[#161813]">Preparation</option>
                  <option value="Execution" className="bg-[#fbf7f0] dark:bg-[#161813]">Execution</option>
                  <option value="Completed" className="bg-[#fbf7f0] dark:bg-[#161813]">Completed</option>
                  <option value="Closed" className="bg-[#fbf7f0] dark:bg-[#161813]">Closed</option>
                </select>
              </div>

              {(status !== "Ready For Execution" && 
                status !== "Operational Manager Assigned" && 
                status !== "Preparation" && 
                status !== "Execution" && 
                status !== "Completed" && 
                status !== "Closed") && (
                <button
                  type="button"
                  onClick={handleLockPlanning}
                  disabled={!allCategoriesFinalized || loadingAction === "lock-planning"}
                  className="w-full py-3 bg-[#143d2b] text-white dark:bg-[#d2b56b] dark:text-[#161812] font-bold text-xs uppercase tracking-[0.18em] transition disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Lock Planning & Finalize Case</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Zoom Image Modal */}
      {zoomImageModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomImageModalUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImageModalUrl} alt="Reference zoom" className="w-full h-full object-contain shadow-2xl" />
            <button
              onClick={() => setZoomImageModalUrl(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-full hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}