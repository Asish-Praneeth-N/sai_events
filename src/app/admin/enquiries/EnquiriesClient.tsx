"use client";

import React, { useState, useTransition } from "react";
import { 
  HelpCircle, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, UserCheck, X, Eye, Phone, 
  Mail, Calendar, ArrowRight, ShieldCheck, Tag, Sparkles, Lock
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { updateEnquiryStatus } from "./actions";

interface GuestEnquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_description: string;
  status: "new" | "in_progress" | "resolved";
  linked_user_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    role: string;
    email: string;
  } | null;
}

interface EnquiriesClientProps {
  initialEnquiries: GuestEnquiry[];
  tableMissing?: boolean;
}

export default function EnquiriesClient({ initialEnquiries, tableMissing }: EnquiriesClientProps) {
  const [enquiries, setEnquiries] = useState<GuestEnquiry[]>(initialEnquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<GuestEnquiry | null>(null);
  
  const [notesText, setNotesText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"new" | "in_progress" | "resolved">("new");
  const [showResolveConfirmModal, setShowResolveConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter logic
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.full_name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.phone.toLowerCase().includes(query) ||
      item.event_type.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const inProgressCount = enquiries.filter((e) => e.status === "in_progress").length;
  const resolvedCount = enquiries.filter((e) => e.status === "resolved").length;

  const handleOpenDetail = (enquiry: GuestEnquiry) => {
    setSelectedEnquiry(enquiry);
    setSelectedStatus(enquiry.status);
    setNotesText(enquiry.admin_notes || "");
    setActionMessage(null);
  };

  const handleUpdateWithStatus = (targetStatus: "new" | "in_progress" | "resolved") => {
    if (!selectedEnquiry) return;
    setActionMessage(null);

    startTransition(async () => {
      const res = await updateEnquiryStatus(selectedEnquiry.id, targetStatus, notesText);
      if (res.success) {
        setActionMessage({ type: "success", text: res.message || "Enquiry updated successfully." });
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === selectedEnquiry.id
              ? {
                  ...e,
                  status: targetStatus,
                  admin_notes: notesText,
                  resolved_at: targetStatus === "resolved" ? (e.resolved_at || new Date().toISOString()) : null,
                }
              : e
          )
        );
        setSelectedEnquiry((prev) =>
          prev
            ? {
                ...prev,
                status: targetStatus,
                admin_notes: notesText,
                resolved_at: targetStatus === "resolved" ? (prev.resolved_at || new Date().toISOString()) : null,
              }
            : null
        );
      } else {
        setActionMessage({ type: "error", text: res.error || "Failed to update enquiry." });
      }
    });
  };

  const handleSaveClick = () => {
    if (!selectedEnquiry) return;
    // If attempting to resolve from new/in_progress, prompt for confirmation
    if (selectedStatus === "resolved" && selectedEnquiry.status !== "resolved") {
      setShowResolveConfirmModal(true);
    } else {
      handleUpdateWithStatus(selectedStatus);
    }
  };

  const handleStatusButtonClick = (targetStatus: "new" | "in_progress" | "resolved") => {
    if (!selectedEnquiry) return;
    // If enquiry is already resolved, prevent changing to new or in_progress
    if (selectedEnquiry.status === "resolved" && targetStatus !== "resolved") {
      return;
    }
    if (targetStatus === "resolved" && selectedEnquiry.status !== "resolved") {
      setShowResolveConfirmModal(true);
    } else {
      setSelectedStatus(targetStatus);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            New
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            <Clock className="w-3 h-3 text-indigo-400" />
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in-up select-none pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              Guest Enquiries
            </h1>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20 font-bold uppercase tracking-wider">
              Operations Concierge
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-light">
            Manage public landing-page inquiries, track customer event consultations, and view account reconciliations.
          </p>
        </div>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-2xl leading-relaxed">
          <strong>⚠️ Database Setup Needed:</strong> The `guest_enquiries` table has not been executed in your Supabase project yet. Execute the SQL script <strong>migration_guest_enquiries.sql</strong> in your Supabase SQL Editor to enable persistent records.
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-accent-gold/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Inquiries</p>
              <h3 className="text-3xl font-light font-heading text-foreground mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-amber-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Requires Attention</p>
              <h3 className="text-3xl font-light font-heading text-amber-400 mt-1">{newCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">In Progress</p>
              <h3 className="text-3xl font-light font-heading text-indigo-400 mt-1">{inProgressCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Resolved</p>
              <h3 className="text-3xl font-light font-heading text-emerald-400 mt-1">{resolvedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-xl overflow-x-auto scrollbar-none">
            {(["all", "new", "in_progress", "resolved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? "bg-accent-gold text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "All" : tab === "in_progress" ? "In Progress" : tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
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

        {/* Table View */}
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-16 text-xs sm:text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No guest enquiries found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 px-3">Visitor Info</th>
                  <th className="pb-3 px-3">Event Type</th>
                  <th className="pb-3 px-3">Submitted Date</th>
                  <th className="pb-3 px-3">Account Status</th>
                  <th className="pb-3 px-3">Lifecycle Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-surface-raised/60 transition-colors">
                    <td className="py-4 px-3">
                      <div className="font-bold text-foreground">{enquiry.full_name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{enquiry.email}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{enquiry.phone}</div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        {enquiry.event_type}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-[11px]">
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td className="py-4 px-3">
                      {enquiry.linked_user_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <UserCheck className="w-3 h-3" />
                          Linked Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                          Guest Visitor
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => handleOpenDetail(enquiry)}
                        className="px-3.5 py-1.5 bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold hover:text-black text-accent-gold text-xs font-bold rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Detail Drawer / Modal */}
      {selectedEnquiry && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div 
            className="w-full max-w-xl h-full bg-surface border-l border-border flex flex-col justify-between shadow-2xl animate-slide-in-right overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold block">
                  Enquiry Operations
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground mt-0.5">
                  {selectedEnquiry.full_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-surface-raised transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6 flex-1">
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold border ${
                    actionMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              {/* Resolved Lock Notice Banner */}
              {selectedEnquiry.status === "resolved" && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 leading-relaxed">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    This enquiry has been marked as <strong>Resolved</strong>. Its status is finalized and cannot be reverted back to New or In Progress. You may view details and update internal notes.
                  </span>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Email Address</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-xs text-accent-gold hover:underline font-mono mt-0.5 block truncate">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Phone Number</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="text-xs text-foreground font-mono mt-0.5 block">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Event Type</span>
                  <span className="text-xs font-bold text-foreground mt-0.5 block">{selectedEnquiry.event_type}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Submitted Date</span>
                  <span className="text-xs text-muted-foreground font-mono mt-0.5 block">{formatDate(selectedEnquiry.created_at)}</span>
                </div>
              </div>

              {/* Account Association */}
              <div className="p-4 rounded-2xl bg-surface-raised border border-border flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Account Association</span>
                  <span className="text-xs font-semibold text-foreground mt-0.5 block">
                    {selectedEnquiry.linked_user_id
                      ? "Associated with registered account"
                      : "Unlinked guest submission"}
                  </span>
                </div>
                {selectedEnquiry.linked_user_id ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase shrink-0">
                    Linked
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-lg text-[10px] font-bold uppercase shrink-0">
                    Unlinked
                  </span>
                )}
              </div>

              {/* Event Description / Customer Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Event Details & Customer Request
                </h4>
                <div className="p-4 rounded-2xl bg-surface-raised border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedEnquiry.event_description}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Update Enquiry Status
                  </h4>
                  {selectedEnquiry.status === "resolved" && (
                    <span className="text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["new", "in_progress", "resolved"] as const).map((st) => {
                    const isLocked = selectedEnquiry.status === "resolved" && st !== "resolved";
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleStatusButtonClick(st)}
                        className={`py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition border flex items-center justify-center gap-1.5 ${
                          isLocked
                            ? "opacity-35 cursor-not-allowed bg-surface-raised border-border/40 text-muted-foreground"
                            : selectedStatus === st
                            ? st === "new"
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm cursor-pointer"
                              : st === "in_progress"
                              ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-sm cursor-pointer"
                              : "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm cursor-pointer"
                            : "bg-surface-raised border-border text-muted-foreground hover:text-foreground cursor-pointer"
                        }`}
                      >
                        {isLocked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                        {st === "in_progress" ? "In Progress" : st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolution details if resolved */}
              {selectedEnquiry.resolved_at && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between">
                  <span>Resolved on {formatDate(selectedEnquiry.resolved_at)}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              {/* Admin Internal Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Internal Operations Notes (Admin Only)
                </h4>
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record customer phone calls, pricing discussions, or internal notes..."
                  className="w-full bg-surface-raised border border-border rounded-xl p-3.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent-gold transition-colors resize-none font-sans"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-border bg-surface sticky bottom-0 flex items-center justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-raised transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveClick}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isPending ? "Saving..." : selectedEnquiry.status === "resolved" ? "Save Notes" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal for Marking Resolved ── */}
      {showResolveConfirmModal && selectedEnquiry && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setShowResolveConfirmModal(false)}
        >
          <div 
            className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold font-heading text-foreground">Confirm Enquiry Resolution</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to mark the enquiry for <strong className="text-foreground">{selectedEnquiry.full_name}</strong> as <strong className="text-emerald-400 font-bold uppercase">Resolved</strong>?
              </p>
              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl font-medium mt-3">
                ⚠️ Once resolved, this enquiry status cannot be changed back to New or In Progress.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowResolveConfirmModal(false);
                  setSelectedStatus("resolved");
                  handleUpdateWithStatus("resolved");
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isPending ? "Saving..." : "Confirm & Mark Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
