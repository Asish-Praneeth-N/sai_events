"use client";

import { useState, useTransition } from "react";
import { updateVendorStatus } from "@/app/admin/actions";
import { 
  Store, User, Phone, Mail, MapPin, Award, ShieldCheck, 
  XOctagon, Power, Eye, CheckCircle2, Clock, Truck, Warehouse, FileCheck, Sliders
} from "lucide-react";
import Link from "next/link";
import { Profile } from "@/lib/types";

interface Mapping {
  category_id: string;
  categories: {
    name: string;
  } | null;
}

interface Vendor extends Profile {
  vendor_category_mappings: Mapping[];
}

interface VendorsListProps {
  vendors: Vendor[];
}

export default function VendorsList({ vendors }: VendorsListProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingVendors = vendors.filter((v) => v.status === "Pending");
  const approvedVendors = vendors.filter((v) => v.status !== "Pending");

  const handleStatusChange = async (id: string, nextStatus: "Approved" | "Rejected" | "Active" | "Inactive") => {
    if (!confirm(`Are you sure you want to change vendor status to ${nextStatus}?`)) {
      return;
    }
    setLoadingId(id);
    startTransition(async () => {
      try {
        await updateVendorStatus(id, nextStatus);
      } catch (err: any) {
        alert(err.message || "Failed to update vendor status.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const getAvailabilityBadge = (status?: string | null) => {
    const st = status || "Available";
    switch (st) {
      case "Available":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">Available</span>;
      case "Busy":
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">Busy</span>;
      case "Leave":
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold">Leave</span>;
      case "In Work":
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">In Work</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold">Not Available</span>;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Tab selectors */}
      <div className="flex gap-6 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-accent-gold text-accent-gold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Registrations ({pendingVendors.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-2 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "approved"
              ? "border-accent-gold text-accent-gold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Approved Suppliers ({approvedVendors.length})
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(activeTab === "pending" ? pendingVendors : approvedVendors).map((vendor) => (
          <div
            key={vendor.id}
            className="bg-surface border border-border rounded-3xl p-6 hover:border-accent-gold/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <h4 className="text-base font-bold font-heading text-foreground truncate">{vendor.business_name || "N/A"}</h4>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">Owner: {vendor.full_name}</p>
                </div>
                <div className="shrink-0">{getAvailabilityBadge(vendor.availability_status)}</div>
              </div>

              {/* Specs & Capacity Radar */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-background p-3 rounded-2xl border border-border font-mono">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase">Daily Capacity</span>
                  <span className="font-bold text-accent-gold">{vendor.max_daily_capacity || 5} Max Events/Day</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase">Service Radius</span>
                  <span className="font-bold text-foreground">{vendor.service_radius_km || 100} KM</span>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span className="font-mono">{vendor.phone_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0 font-mono" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span className="truncate">{vendor.primary_city || vendor.address || "N/A"}</span>
                </div>
              </div>

              {/* Categories mappings */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Service Categories
                </span>
                <div className="flex flex-wrap gap-1">
                  {vendor.vendor_category_mappings?.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-background border border-border text-foreground rounded text-[9px] font-bold"
                    >
                      {m.categories?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
              {activeTab === "pending" ? (
                <>
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Rejected")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition hover:bg-red-500/20 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Approved")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-accent-gold text-black rounded-xl text-xs font-bold transition hover:brightness-110 cursor-pointer shadow"
                  >
                    Approve Supplier
                  </button>
                </>
              ) : (
                <>
                  {vendor.status === "Approved" || vendor.status === "Active" ? (
                    <button
                      onClick={() => handleStatusChange(vendor.id, "Inactive")}
                      disabled={loadingId === vendor.id}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition hover:bg-red-500/20 cursor-pointer"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(vendor.id, "Active")}
                      disabled={loadingId === vendor.id}
                      className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => alert(`Supplier Verification Audit: Bank ${vendor.bank_name || 'N/A'}, Account ${vendor.account_number || 'N/A'}`)}
                    className="w-full py-2 border border-border bg-background hover:bg-surface-raised rounded-xl text-xs font-bold text-foreground text-center transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Audit Docs</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
