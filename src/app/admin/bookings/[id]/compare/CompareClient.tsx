"use client";

import { useState } from "react";
import { approveVendorAndNotifyOthers } from "@/app/admin/actions";
import {
  Scale, ArrowUpDown, Filter, CheckCircle2, XCircle, Clock,
  MapPin, Award, Sliders, ShieldCheck, DollarSign
} from "lucide-react";

interface Props {
  requestId: string;
  request: any;
  quotations: any[];
  assignments: any[];
}

export default function CompareClient({ requestId, request, quotations, assignments }: Props) {
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "exp_desc" | "status">("price_asc");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Merge quotations with assignments
  const mergedCandidates = assignments.map((asg) => {
    const q = quotations.find((quote) => quote.vendor_id === asg.vendor_id);
    const profile = asg.vendor_profile || q?.vendor_profile;

    return {
      assignmentId: asg.id,
      quotationId: q?.id,
      vendorId: asg.vendor_id,
      businessName: profile?.business_name || profile?.full_name || "Supplier",
      ownerName: profile?.full_name || "N/A",
      phone: profile?.phone_number || "N/A",
      city: profile?.primary_city || "Hyderabad",
      radiusKm: profile?.service_radius_km || 100,
      yearsExp: profile?.years_of_experience || 3,
      availabilityStatus: profile?.availability_status || "Available",
      status: asg.status, // Approved, Accepted, Pending, Cancelled
      grandTotal: q?.grand_total || Number(request.total_budget || 0) * 0.3,
      items: q?.items || [],
      notes: q?.notes,
    };
  });

  // Filter candidates
  const filteredCandidates = mergedCandidates.filter((c) => {
    if (filterCity !== "all" && c.city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterAvailability !== "all" && c.availabilityStatus !== filterAvailability) return false;
    return true;
  });

  // Sort candidates
  filteredCandidates.sort((a, b) => {
    if (sortBy === "price_asc") return a.grandTotal - b.grandTotal;
    if (sortBy === "price_desc") return b.grandTotal - a.grandTotal;
    if (sortBy === "exp_desc") return b.yearsExp - a.yearsExp;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const handleApproveVendor = async (assignmentId: string, vendorName: string) => {
    if (!confirm(`Finalize supplier "${vendorName}" for this event file? All other candidate suppliers will receive an Opportunity Closed notification.`)) {
      return;
    }

    setLoadingId(assignmentId);
    try {
      await approveVendorAndNotifyOthers(requestId, assignmentId);
      alert("Vendor approved successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to approve vendor.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] uppercase">Approved</span>;
      case "Accepted":
        return <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold text-[9px] uppercase">Vendor Responded</span>;
      case "Pending":
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[9px] uppercase">Waiting Response</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[9px] uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Controls Bar: Sorting & Filtering */}
      <div className="p-5 rounded-3xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-accent-gold" />
            <span className="font-bold text-muted-foreground uppercase">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-background border border-border rounded-xl text-foreground font-bold"
            >
              <option value="price_asc">Lowest Price (₹ → ₹₹₹)</option>
              <option value="price_desc">Highest Price (₹₹₹ → ₹)</option>
              <option value="exp_desc">Highest Experience (Years)</option>
              <option value="status">Response Status</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-gold" />
            <span className="font-bold text-muted-foreground uppercase">Availability:</span>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-3 py-1.5 bg-background border border-border rounded-xl text-foreground font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Busy">Busy Only</option>
              <option value="In Work">In Work Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Comparing <strong className="text-accent-gold">{filteredCandidates.length}</strong> candidate supplier quotation(s)
        </div>
      </div>

      {/* Comparison Grid View */}
      {filteredCandidates.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl bg-surface">
          No vendor quotations or assignments match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((c) => (
            <div
              key={c.assignmentId}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 shadow-sm ${
                c.status === "Approved"
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10 shadow-lg"
                  : "bg-surface border-border hover:border-accent-gold/40 hover:shadow-md"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">{c.businessName}</h3>
                    <span className="text-[11px] text-muted-foreground">Owner: {c.ownerName}</span>
                  </div>
                  {getStatusBadge(c.status)}
                </div>

                {/* Quoted Price Banner */}
                <div className="p-4 rounded-2xl bg-background border border-accent-gold/30 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quoted Grand Total</span>
                  <span className="text-xl font-bold font-mono text-accent-gold">
                    ₹{c.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-background p-3 rounded-2xl border border-border">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Experience</span>
                    <span className="font-bold text-foreground">{c.yearsExp} Years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Service Radius</span>
                    <span className="font-bold text-foreground">{c.radiusKm} KM</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Primary City</span>
                    <span className="font-bold text-foreground">{c.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Availability</span>
                    <span className="font-bold text-emerald-400">{c.availabilityStatus}</span>
                  </div>
                </div>

                {/* Itemized Services Breakdown */}
                {c.items.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Itemized Quotation Breakdown</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {c.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-[10px] p-2 bg-background rounded-xl border border-border">
                          <span className="text-foreground">{item.service_item?.name || "Service Item"} x{item.quantity}</span>
                          <span className="font-mono font-bold text-accent-gold">₹{item.subtotal?.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-border/40">
                {c.status === "Approved" ? (
                  <div className="w-full py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow">
                    <ShieldCheck className="w-4 h-4" /> Finalized Supplier
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApproveVendor(c.assignmentId, c.businessName)}
                    disabled={loadingId === c.assignmentId}
                    className="w-full py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                  >
                    {loadingId === c.assignmentId ? "Finalizing..." : "Approve & Notify Others"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
