"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateVendorStatus } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

interface Mapping {
  categories: { name: string } | null;
}
interface CustomMedia {
  media_url: string;
}
interface CustomService {
  id: string;
  category_name: string;
  subcategory_name: string;
  service_name: string;
  custom_price: number;
  vendor_custom_service_media: CustomMedia[];
}
interface VendorDetailsProps {
  vendor: {
    id: string;
    full_name: string;
    phone_number: string;
    email: string;
    business_name: string | null;
    address: string | null;
    status: string;
    created_at: string;
    vendor_category_mappings: Mapping[];
  };
  customServices?: CustomService[];
}

// ─── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { cls: string; dot: string }> = {
    Approved: { cls: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    Active:   { cls: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    Pending:  { cls: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400", dot: "bg-amber-500 animate-pulse" },
    Rejected: { cls: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400", dot: "bg-red-500" },
    Inactive: { cls: "bg-muted text-muted-foreground border-border/50", dot: "bg-zinc-400" },
  };
  const cfg = configs[status] || configs.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-full uppercase tracking-wider ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── Initials Avatar ─────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-gold to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-gold/20">
      <span className="text-lg font-bold text-black font-heading">{initials}</span>
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function VendorDetailsCard({ vendor, customServices = [] }: VendorDetailsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"Approved" | "Rejected" | "Active" | "Inactive" | null>(null);

  const handleAction = async (nextStatus: "Approved" | "Rejected" | "Active" | "Inactive") => {
    setLoading(true);
    setConfirmAction(null);
    startTransition(async () => {
      try {
        await updateVendorStatus(vendor.id, nextStatus);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to update status.");
      } finally {
        setLoading(false);
      }
    });
  };

  const displayName = vendor.business_name || vendor.full_name;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Breadcrumb ── */}
      <div>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>All Vendors</span>
        </Link>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Vendor Profile Card */}
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
          {/* Card header */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-start gap-4">
              <Avatar name={displayName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-foreground">{displayName}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{vendor.id}</p>
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoRow label="Contact Name" value={vendor.full_name} />
              <InfoRow label="Phone" value={vendor.phone_number} />
              <InfoRow label="Email" value={vendor.email} />
              <InfoRow label="Registered" value={formatDate(vendor.created_at)} />
            </div>

            {vendor.address && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Business Address</p>
                <p className="text-sm text-foreground bg-background p-4 rounded-2xl border border-border/50 leading-relaxed">
                  {vendor.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Categories */}
          <div className="rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Category Offerings</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.vendor_category_mappings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No categories mapped</p>
              ) : (
                vendor.vendor_category_mappings.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-accent-gold/10 dark:bg-accent-gold/10 border border-accent-gold/30 dark:border-accent-gold/30 text-amber-700 dark:text-accent-gold text-xs font-bold rounded-xl"
                  >
                    {m.categories?.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Action Panel */}
          <div className="rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Admin Actions</h3>

            {confirmAction ? (
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-3 animate-scale-in">
                <p className="text-xs font-semibold text-foreground">
                  Change status to <strong className={`${confirmAction === "Approved" || confirmAction === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{confirmAction}</strong>?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-2 text-xs font-bold text-muted-foreground border border-border rounded-xl hover:bg-muted/40 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(confirmAction)}
                    disabled={loading}
                    className={`flex-1 py-2 text-xs font-bold text-white rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md ${
                      confirmAction === "Approved" || confirmAction === "Active"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                        : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                    }`}
                  >
                    {loading ? "…" : "Confirm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {vendor.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => setConfirmAction("Approved")}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve Vendor</span>
                    </button>
                    <button
                      onClick={() => setConfirmAction("Rejected")}
                      disabled={loading}
                      className="w-full py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Reject Vendor
                    </button>
                  </>
                ) : vendor.status === "Approved" || vendor.status === "Active" ? (
                  <button
                    onClick={() => setConfirmAction("Inactive")}
                    disabled={loading}
                    className="w-full py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction("Active")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reactivate Account</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Custom Services Section ── */}
      <div className="rounded-2xl bg-surface border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Vendor Service Catalog</h3>
          {customServices.length > 0 && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground rounded-full">
              {customServices.length} {customServices.length === 1 ? 'service' : 'services'}
            </span>
          )}
        </div>

        {customServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-muted-foreground">No services published yet</p>
            <p className="text-xs text-muted-foreground mt-1">This vendor hasn&apos;t added any service packages</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map((service) => (
              <div
                key={service.id}
                className="group p-4 rounded-2xl bg-background border border-border/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <h4 className="text-sm font-semibold text-foreground leading-snug truncate">{service.service_name}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-accent-gold bg-accent-gold/10 dark:bg-accent-gold/10 border border-accent-gold/30 dark:border-accent-gold/30 rounded-lg flex-shrink-0">
                    ₹{Number(service.custom_price).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3 font-semibold">
                  {service.category_name} · {service.subcategory_name}
                </p>

                {/* Image gallery */}
                {service.vendor_custom_service_media?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {service.vendor_custom_service_media.map((med, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => window.open(med.media_url, "_blank")}
                        className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-muted hover:scale-110 transition-transform duration-200 cursor-pointer"
                        title="View full image"
                      >
                        <img src={med.media_url} alt="Showcase" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
