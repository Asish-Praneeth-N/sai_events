"use client";

import { useState, useTransition } from "react";
import { updateVendorStatus } from "@/app/admin/actions";
import { 
  Store, User, Phone, Mail, MapPin, Award, ShieldCheck, 
  XOctagon, Power, Eye, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

interface Mapping {
  category_id: string;
  categories: {
    name: string;
  } | null;
}

interface Vendor {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_name: string | null;
  address: string | null;
  status: string;
  created_at: string;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Active":
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
            <ShieldCheck className="w-3 h-3" /> Active
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
            <ClockIcon /> Pending
          </span>
        );
      case "Rejected":
      case "Inactive":
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
            <XOctagon className="w-3 h-3" /> Suspended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
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
      {activeTab === "pending" ? (
        pendingVendors.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/5">
            No pending registration approvals.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingVendors.map((vendor) => (
              <div 
                key={vendor.id}
                className="bg-surface border border-border rounded-2xl p-5 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{vendor.business_name || "N/A"}</h4>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">Owner: {vendor.full_name}</p>
                    </div>
                    <div className="shrink-0">{getStatusBadge(vendor.status)}</div>
                  </div>

                  {/* Vendor Details */}
                  <div className="space-y-2 text-[10px] text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                      <span>{vendor.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0 font-mono" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                      <span className="truncate">{vendor.address || "N/A"}</span>
                    </div>
                  </div>

                  {/* Categories mappings */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block">
                      Services Provided
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {vendor.vendor_category_mappings.map((m, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-background border border-border text-muted-foreground rounded text-[9px] font-bold"
                        >
                          {m.categories?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border/50 mt-5">
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Rejected")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition hover:bg-red-500/20 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Approved")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-accent-gold text-black rounded-xl text-xs font-bold transition hover:scale-[1.01] cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : approvedVendors.length === 0 ? (
        <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/5">
          No approved suppliers mapped.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {approvedVendors.map((vendor) => (
            <div 
              key={vendor.id}
              className="bg-surface border border-border rounded-2xl p-5 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{vendor.business_name || "N/A"}</h4>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">Owner: {vendor.full_name}</p>
                  </div>
                  <div className="shrink-0">{getStatusBadge(vendor.status)}</div>
                </div>

                {/* Vendor Details */}
                <div className="space-y-2 text-[10px] text-muted-foreground pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span>{vendor.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-accent-gold shrink-0 font-mono" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span className="truncate">{vendor.address || "N/A"}</span>
                  </div>
                </div>

                {/* Categories mappings */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Services Provided
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {vendor.vendor_category_mappings.map((m, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-background border border-border text-muted-foreground rounded text-[9px] font-bold"
                      >
                        {m.categories?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border/50 mt-5">
                {vendor.status === "Approved" || vendor.status === "Active" ? (
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Inactive")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition hover:bg-red-500/20 cursor-pointer"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(vendor.id, "Active")}
                    disabled={loadingId === vendor.id}
                    className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold transition hover:bg-emerald-500/20 cursor-pointer"
                  >
                    Activate
                  </button>
                )}
                <Link
                  href={`/admin/vendors/${vendor.id}`}
                  className="w-full py-2 border border-border bg-background hover:bg-surface-raised rounded-xl text-xs font-bold text-foreground text-center transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline small clock icon helper
function ClockIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className="w-3 h-3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
