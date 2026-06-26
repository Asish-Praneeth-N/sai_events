"use client";

import { useState, useTransition } from "react";
import { updateVendorStatus } from "@/app/admin/actions";

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
    if (!confirm(`Are you sure you want to change status to ${nextStatus}?`)) {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "Active":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400";
      case "Pending":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400";
      case "Rejected":
      case "Inactive":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "pending"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Onboard Requests ({pendingVendors.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "approved"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Approved Vendors ({approvedVendors.length})
        </button>
      </div>

      {/* Lists */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        {activeTab === "pending" ? (
          pendingVendors.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
              No pending vendor registration approvals.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-4 px-3">Business / Owner</th>
                    <th className="pb-4 px-3">Contact</th>
                    <th className="pb-4 px-3">Categories</th>
                    <th className="pb-4 px-3">Location</th>
                    <th className="pb-4 px-3">Status</th>
                    <th className="pb-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {pendingVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="py-4 px-3">
                        <div className="font-semibold text-foreground">{vendor.business_name || "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {vendor.full_name}</div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-foreground font-medium">{vendor.phone_number}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{vendor.email}</div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {vendor.vendor_category_mappings.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-muted border border-border/50 text-muted-foreground rounded-md text-[10px] font-bold"
                            >
                              {m.categories?.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-muted-foreground max-w-[150px] truncate">
                        {vendor.address || "N/A"}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${getStatusBadgeColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleStatusChange(vendor.id, "Rejected")}
                            disabled={loadingId === vendor.id}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusChange(vendor.id, "Approved")}
                            disabled={loadingId === vendor.id}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                          >
                            Approve
                          </button>
                          <a
                            href={`/admin/vendors/${vendor.id}`}
                            className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-foreground text-xs font-semibold rounded-xl transition-all duration-200"
                          >
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : approvedVendors.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No approved vendors registered.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Business Name</th>
                  <th className="pb-4 px-3">Owner Contact</th>
                  <th className="pb-4 px-3">Categories</th>
                  <th className="pb-4 px-3">Location</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {approvedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3">
                      <div className="font-semibold text-foreground">{vendor.business_name || "N/A"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">ID: {vendor.id.substring(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="text-foreground font-semibold">{vendor.full_name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{vendor.phone_number} • {vendor.email}</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {vendor.vendor_category_mappings.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-muted border border-border/50 text-muted-foreground rounded-md text-[10px] font-bold"
                          >
                            {m.categories?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-muted-foreground max-w-[150px] truncate">
                      {vendor.address || "N/A"}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${getStatusBadgeColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex justify-end gap-2.5">
                        {vendor.status === "Approved" || vendor.status === "Active" ? (
                          <button
                            onClick={() => handleStatusChange(vendor.id, "Inactive")}
                            disabled={loadingId === vendor.id}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(vendor.id, "Active")}
                            disabled={loadingId === vendor.id}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                        <a
                          href={`/admin/vendors/${vendor.id}`}
                          className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-foreground text-xs font-semibold rounded-xl transition-all duration-200"
                        >
                          View Details
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
