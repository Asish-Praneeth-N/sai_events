"use client";

import { useState } from "react";
import { submitGroupedVendorQuotation } from "../actions";
import { respondToAssignment } from "./actions";
import { formatDate } from "@/lib/utils";
import { Profile, VendorPersonalSchedule } from "@/lib/types";
import {
  Calendar, MapPin, Users, CheckCircle2, AlertCircle, X,
  Check, Info, Clock, Inbox as InboxIcon, Sparkles, AlertTriangle,
  ChevronRight, FileText, CheckSquare, ShieldCheck
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  pricing_unit?: string;
  subcategories: { category_id: string } | null;
}

interface RequestItem {
  service_item_id: string;
  quantity: number;
  unit_price: number;
  pricing_type: string;
  service_items: ServiceItem | null;
}

interface EventRequest {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  total_budget: number;
  request_items: RequestItem[];
}

interface Assignment {
  id: string;
  created_at: string;
  category_id: string;
  categories: { name: string } | null;
  event_requests: EventRequest | null;
}

interface Props {
  assignments: Assignment[];
  profile: Profile | null;
  confirmedBookings: any[];
  personalSchedules: VendorPersonalSchedule[];
}

export default function InboxList({
  assignments,
  profile,
  confirmedBookings,
  personalSchedules,
}: Props) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Per-item quotes state: { serviceItemId: customPrice }
  const [itemQuotes, setItemQuotes] = useState<Record<string, number>>({});
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeAssignment = assignments.find((a) => a.id === selectedLeadId) || null;
  const activeReq = activeAssignment?.event_requests || null;

  // Schedule preview for selected lead date
  const leadDateStr = activeReq?.event_date || "";

  const sameDateBookings = confirmedBookings.filter(
    (b) => b.event_requests?.event_date === leadDateStr
  );

  const sameDatePersonal = personalSchedules.filter((p) => {
    return leadDateStr >= p.start_date && leadDateStr <= p.end_date;
  });

  const totalEventsOnDate = sameDateBookings.length;
  const maxCapacity = profile?.max_daily_capacity || 5;

  const handlePriceChange = (serviceItemId: string, price: number) => {
    setItemQuotes((prev) => ({ ...prev, [serviceItemId]: price }));
  };

  const handleDecline = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to decline this lead?")) return;
    setLoading(true);
    setError(null);
    try {
      await respondToAssignment(assignmentId, false);
      setSuccess("Lead declined successfully.");
      setSelectedLeadId(null);
    } catch (err: any) {
      setError(err.message || "Failed to decline lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !activeReq) return;
    if (!isConfirmed) {
      setError("You must explicitly check the confirmation box before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const itemsPayload = activeReq.request_items.map((item) => {
        const customPrice = itemQuotes[item.service_item_id] ?? item.service_items?.price ?? item.unit_price;
        return {
          serviceItemId: item.service_item_id,
          itemPrice: Number(customPrice),
          quantity: item.quantity,
        };
      });

      await submitGroupedVendorQuotation({
        requestId: activeReq.id,
        items: itemsPayload,
        notes,
        isConfirmed,
      });

      setSuccess("Your grouped quotation has been submitted successfully!");
      setSelectedLeadId(null);
      setIsConfirmed(false);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit quotation.");
    } finally {
      setLoading(false);
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border bg-surface text-center p-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4 text-accent-gold">
          <InboxIcon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Lead Inbox is Clear</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light max-w-xs">
          New dispatch lead invitations will appear here. User identities remain anonymized.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="cursor-pointer text-red-400/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess(null)} className="cursor-pointer text-emerald-400/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invitations List */}
      <div className="space-y-4">
        {assignments.map((assign) => {
          const req = assign.event_requests;
          if (!req) return null;

          const isSelected = selectedLeadId === assign.id;

          return (
            <div
              key={assign.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-surface ${
                isSelected ? "border-accent-gold shadow-lg" : "border-border hover:border-accent-gold/40"
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-bold uppercase tracking-widest text-accent-gold">
                        {assign.categories?.name || "Event Lead"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        REF: #{assign.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-heading text-foreground">{req.event_type}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecline(assign.id)}
                      className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(isSelected ? null : assign.id);
                        setError(null);
                      }}
                      className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                    >
                      {isSelected ? "Close Lead" : "Review Lead & Schedule"}
                    </button>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-background p-3.5 rounded-2xl border border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Date: <strong className="text-foreground">{req.event_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent-gold shrink-0" />
                    <span>Guests: <strong className="text-foreground">{req.guest_count} Guests</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
                    <span className="truncate">Venue: <strong className="text-foreground">{req.location}</strong></span>
                  </div>
                </div>
              </div>

              {/* ── EXPANDED LEAD REVIEW & SCHEDULE PREVIEW DRAWER ── */}
              {isSelected && (
                <div className="border-t border-border bg-background/50 p-6 space-y-6 animate-fade-in-up">
                  
                  {/* 1. Schedule Preview Component */}
                  <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest">Schedule Preview</span>
                        <h4 className="text-sm font-bold text-foreground">Your Schedule for {req.event_date}</h4>
                      </div>

                      <div className="text-xs font-mono font-bold px-3 py-1 bg-background border border-border rounded-xl">
                        Total Events: <span className="text-accent-gold">{totalEventsOnDate}</span> / Max Capacity: {maxCapacity}
                      </div>
                    </div>

                    {totalEventsOnDate >= maxCapacity && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Daily Capacity Reached! Accepting this lead will exceed your maximum daily capacity.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Confirmed Bookings on Date */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Confirmed Bookings ({sameDateBookings.length})</span>
                        {sameDateBookings.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic">No confirmed bookings on this date.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {sameDateBookings.map((b) => (
                              <div key={b.id} className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                                <span className="font-semibold text-foreground">{b.event_requests?.event_type}</span>
                                <span className="text-[10px] font-mono text-accent-gold">{b.event_requests?.event_time || "All Day"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Personal Schedule Entries on Date */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Personal Schedule & Leaves ({sameDatePersonal.length})</span>
                        {sameDatePersonal.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic">No personal schedule blocks on this date.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {sameDatePersonal.map((p) => (
                              <div key={p.id} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between">
                                <div>
                                  <span className="font-bold block">{p.title}</span>
                                  <span className="text-[9px] uppercase tracking-wider">{p.entry_type}</span>
                                </div>
                                <span className="text-[10px] font-mono">{p.start_time ? `${p.start_time} - ${p.end_time}` : "Full Day"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Grouped Multi-Service Quotation Form */}
                  <form onSubmit={handleSubmitQuotation} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent-gold" />
                        <h4 className="text-base font-bold font-heading text-foreground">Grouped Event Services Quotation</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All requested services for this {req.event_type} event are grouped below. Provide customized pricing per service.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {req.request_items.map((item) => {
                        const sItem = item.service_items;
                        const defaultUnitPrice = sItem?.price || item.unit_price;
                        const currentUnitPrice = itemQuotes[item.service_item_id] ?? defaultUnitPrice;
                        const subtotal = currentUnitPrice * item.quantity;

                        return (
                          <div
                            key={item.service_item_id}
                            className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <h5 className="font-bold text-sm text-foreground">{sItem?.name || "Requested Service"}</h5>
                              <p className="text-xs text-muted-foreground">
                                Quantity: {item.quantity} · Pricing Unit: ({sItem?.pricing_unit || item.pricing_type || "fixed"})
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold text-muted-foreground">Your Price (₹)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={currentUnitPrice}
                                  onChange={(e) => handlePriceChange(item.service_item_id, Number(e.target.value))}
                                  className="w-32 px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-bold focus:ring-2 focus:ring-accent-gold/30"
                                />
                              </div>

                              <div className="text-right">
                                <span className="block text-[10px] uppercase text-muted-foreground">Subtotal</span>
                                <span className="font-bold text-accent-gold font-mono text-sm">₹{subtotal.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quotation Grand Total Box */}
                    <div className="p-4 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">Grand Total Quotation</span>
                      <span className="text-xl font-bold font-mono text-accent-gold">
                        ₹
                        {req.request_items
                          .reduce((sum, item) => {
                            const p = itemQuotes[item.service_item_id] ?? (item.service_items?.price || item.unit_price);
                            return sum + p * item.quantity;
                          }, 0)
                          .toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase">Quotation Notes / Terms (Optional)</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Mention staging timeline parameters, logistics inclusions, or payment terms..."
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground resize-none"
                      />
                    </div>

                    {/* Explicit Confirmation Checkbox */}
                    <div className="p-4 rounded-2xl bg-background border border-border">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isConfirmed}
                          onChange={(e) => setIsConfirmed(e.target.checked)}
                          className="mt-0.5 w-5 h-5 rounded border-border text-accent-gold focus:ring-accent-gold bg-surface cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-accent-gold" />
                            ✓ I confirm that I can provide all listed services for this event file.
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            By checking this box, you formally confirm availability and pricing terms for Admin approval.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadId(null)}
                        className="px-4 py-2.5 bg-surface hover:bg-surface-raised border border-border text-foreground text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !isConfirmed}
                        className="px-6 py-2.5 bg-accent-gold hover:brightness-110 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                      >
                        {loading ? "Submitting Quotation..." : "Submit Quotation & Confirm"}
                      </button>
                    </div>
                  </form>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
