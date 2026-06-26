"use client";

import { useState } from "react";
import {
  dispatchLeadsToVendors,
  approveVendorAssignment,
  updateRequestStatus,
} from "../actions";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_name: string | null;
  address: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface GroupedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  pricingType: string;
  lineTotal: number;
}

interface CategoryGroup {
  category: Category;
  items: GroupedItem[];
  mappedVendors: Profile[];
  assignments: {
    id: string;
    vendor_id: string;
    status: string;
    profiles: {
      full_name: string;
      phone_number: string;
      email: string;
      business_name: string | null;
    } | null;
  }[];
}

interface MatchmakerProps {
  requestId: string;
  currentStatus: string;
  customerProfile: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
  };
  groups: CategoryGroup[];
}

export default function Matchmaker({
  requestId,
  currentStatus,
  customerProfile,
  groups,
}: MatchmakerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({}); // categoryId -> vendorIds[]
  
  const [statusLoading, setStatusLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState<string | null>(null); // categoryId
  const [approveLoading, setApproveLoading] = useState<string | null>(null); // assignmentId
  const [error, setError] = useState<string | null>(null);

  // Handle status progression manual update
  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    setError(null);
    try {
      await updateRequestStatus(requestId, newStatus);
      setStatus(newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // Checkbox toggle for vendor selection
  const handleVendorCheckbox = (categoryId: string, vendorId: string) => {
    setSelectedVendors((prev) => {
      const list = prev[categoryId] || [];
      const updated = list.includes(vendorId)
        ? list.filter((id) => id !== vendorId)
        : [...list, vendorId];
      return {
        ...prev,
        [categoryId]: updated,
      };
    });
  };

  // Dispatch leads action
  const handleDispatch = async (categoryId: string) => {
    const vendorIds = selectedVendors[categoryId] || [];
    if (vendorIds.length === 0) {
      alert("Please select at least one vendor to dispatch the lead.");
      return;
    }

    setDispatchLoading(categoryId);
    setError(null);
    try {
      await dispatchLeadsToVendors(requestId, categoryId, vendorIds);
      alert("Leads dispatched to selected vendors successfully!");
      // Reset selections
      setSelectedVendors((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    } catch (err: any) {
      setError(err.message || "Failed to dispatch leads.");
    } finally {
      setDispatchLoading(null);
    }
  };

  // Approve vendor assignment action
  const handleApprove = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to approve this vendor assignment? This will reject other assignments in this category.")) {
      return;
    }

    setApproveLoading(assignmentId);
    setError(null);
    try {
      await approveVendorAssignment(requestId, assignmentId);
      alert("Vendor approved and connected to the client!");
    } catch (err: any) {
      setError(err.message || "Failed to approve assignment.");
    } finally {
      setApproveLoading(null);
    }
  };

  const assignmentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30";
      case "Accepted":
        return "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/30";
      case "Approved":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30";
      case "Rejected":
        return "text-muted-foreground bg-muted border-border/50";
      default:
        return "text-muted-foreground bg-muted border-border/50";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Parameters & Category splits (Left Column) */}
      <div className="lg:col-span-2 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {/* Category-Wise Matchmaking Panels */}
        <div className="space-y-8">
          {groups.map(({ category, items, mappedVendors, assignments }) => {
            const currentSelected = selectedVendors[category.id] || [];

            return (
              <div
                key={category.id}
                className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-6"
              >
                {/* Category Header */}
                <div className="border-b border-border/50 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-purple-600 dark:text-purple-400">
                      {category.name} Matchmaking
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Setup requirements and vendor assignment controls.
                    </p>
                  </div>
                </div>

                {/* Requested items inside this category */}
                <div className="space-y-3 bg-background p-4 rounded-2xl border border-border/50">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Requested Category Items
                  </h4>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="text-xs flex justify-between text-muted-foreground"
                      >
                        <div>
                          • <span className="font-semibold text-foreground">{item.name}</span>
                          <span className="text-muted-foreground"> x{item.quantity}</span>
                        </div>
                        <span className="font-mono font-semibold text-foreground">
                          ₹{Number(item.lineTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Assignments tracker */}
                {assignments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Current Lead Assignments
                    </h4>
                    <div className="divide-y divide-border/50">
                      {assignments.map((assignment) => {
                        const isApproveBtnVisible = assignment.status === "Accepted";
                        
                        return (
                          <div
                            key={assignment.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
                          >
                            <div>
                              <div className="font-bold text-foreground">
                                {assignment.profiles?.business_name || assignment.profiles?.full_name}
                              </div>
                              <div className="text-muted-foreground mt-0.5">
                                Contact: {assignment.profiles?.full_name} • {assignment.profiles?.phone_number}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full uppercase tracking-wider ${assignmentStatusColor(assignment.status)}`}>
                                {assignment.status}
                              </span>

                              {isApproveBtnVisible && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(assignment.id)}
                                  disabled={approveLoading === assignment.id}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition text-[10px]"
                                >
                                  {approveLoading === assignment.id ? "Approving..." : "Approve & Connect"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Map Vendors grid */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Available Mapped Vendors
                  </h4>
                  {mappedVendors.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No vendors registered under the &quot;{category.name}&quot; category.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mappedVendors.map((vendor) => {
                          const isAssigned = assignments.some((a) => a.vendor_id === vendor.id);
                          const isSelected = currentSelected.includes(vendor.id);

                          return (
                            <div
                              key={vendor.id}
                              onClick={() => !isAssigned && handleVendorCheckbox(category.id, vendor.id)}
                              className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 select-none ${
                                isAssigned
                                  ? "bg-muted/40 border-border/50 opacity-60 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-purple-50 dark:bg-purple-950/20 border-purple-500/50 cursor-pointer"
                                  : "bg-background border-border hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected || isAssigned}
                                disabled={isAssigned}
                                onChange={() => {}} // handled by click handler
                                className="mt-1 rounded text-purple-600 focus:ring-purple-500 bg-background border-border disabled:opacity-50 h-4.5 w-4.5"
                              />
                              <div className="text-xs space-y-1 min-w-0 flex-1">
                                <h5 className="font-bold text-foreground truncate">
                                  {vendor.business_name || vendor.full_name}
                                </h5>
                                <div className="text-muted-foreground text-[10px]">
                                  Owner: {vendor.full_name}
                                </div>
                                <div className="text-muted-foreground text-[10px]">
                                  Coverage: {vendor.address || "Global"}
                                </div>
                                {isAssigned && (
                                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mt-1.5 block">
                                    Dispatched
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => handleDispatch(category.id)}
                          disabled={dispatchLoading === category.id || currentSelected.length === 0}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-purple-500/10 cursor-pointer"
                        >
                          {dispatchLoading === category.id ? "Dispatching..." : `Send Lead to ${currentSelected.length} Vendors`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & Status Control (Right Column) */}
      <div className="space-y-6">
        {/* Customer & Event Details */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
          <h3 className="text-lg font-bold font-heading text-purple-600 dark:text-purple-400">Event Details</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Customer Contact</div>
              <div className="text-foreground font-bold text-sm mt-1.5">{customerProfile.fullName}</div>
              <div className="text-muted-foreground mt-1">{customerProfile.phone}</div>
              <div className="text-muted-foreground font-mono mt-0.5">{customerProfile.email}</div>
            </div>

            <div className="border-t border-border/50 pt-3">
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Event Parameters</div>
              <ul className="space-y-1 text-muted-foreground mt-2">
                <li><strong className="text-foreground font-semibold">Location:</strong> {customerProfile.address}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status progression card */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
          <h3 className="text-lg font-bold font-heading text-indigo-600 dark:text-indigo-400">Status Control</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="statusSelect" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Override Workflow Status
              </label>
              <select
                id="statusSelect"
                value={status}
                disabled={statusLoading}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition text-foreground text-xs font-semibold"
              >
                <option value="Request Submitted">Request Submitted</option>
                <option value="Under Admin Review">Under Admin Review</option>
                <option value="Vendor Selection In Progress">Vendor Selection In Progress</option>
                <option value="Sent to Vendors">Sent to Vendors</option>
                <option value="Vendor Accepted">Vendor Accepted</option>
                <option value="Vendor Approved by Admin">Vendor Approved by Admin</option>
                <option value="Customer Confirmation Pending">Customer Confirmation Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * Note: Dispatching leads automatically advances the status to <strong>Sent to Vendors</strong>. Approving a vendor updates the status to <strong>Vendor Approved by Admin</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
