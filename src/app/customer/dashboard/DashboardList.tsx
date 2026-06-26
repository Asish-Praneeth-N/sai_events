"use client";

import { useState } from "react";
import { cancelEventRequest } from "../actions";
import { formatDate } from "@/lib/utils";

interface RequestItem {
  quantity: number;
  unit_price: number;
  pricing_type: string;
  service_items: {
    name: string;
  } | null;
}

interface VendorAssignment {
  id: string;
  status: string;
  categories: {
    name: string;
  } | null;
  profiles: {
    full_name: string;
    phone_number: string;
    email: string;
    business_name: string | null;
  } | null;
}

interface EventRequest {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  status: string;
  total_budget: number;
  created_at: string;
  request_items: RequestItem[];
  vendor_assignments: VendorAssignment[];
}

interface DashboardListProps {
  requests: EventRequest[];
}

export default function DashboardList({ requests }: DashboardListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this event request? This action cannot be undone.")) {
      return;
    }
    setLoadingId(id);
    setError(null);
    try {
      await cancelEventRequest(id);
    } catch (err: any) {
      setError(err.message || "Failed to cancel event request.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Request Submitted":
        return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400";
      case "Under Admin Review":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400";
      case "Vendor Selection In Progress":
      case "Sent to Vendors":
        return "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400";
      case "Vendor Accepted":
        return "bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-400";
      case "Vendor Approved by Admin":
      case "Customer Confirmation Pending":
        return "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400";
      case "Confirmed":
        return "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400";
      case "Completed":
        return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
      case "Cancelled":
        return "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-surface text-center p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-semibold">You haven&apos;t planned any events yet.</p>
          <a
            href="/customer/request"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow shadow-purple-500/25 hover:shadow-purple-500/40 text-sm"
          >
            Plan Your First Event
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const approvedAssignments = req.vendor_assignments.filter(
              (a) => a.status === "Approved"
            );

            return (
              <div
                key={req.id}
                className="p-6 rounded-3xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300 space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                        {req.event_type}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold border rounded-full ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Request ID: <span className="font-mono text-zinc-500">{req.id.substring(0, 18)}...</span> • Created on <span className="text-zinc-500 dark:text-zinc-400">{formatDate(req.created_at)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Estimated Budget</div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        ₹{Number(req.total_budget).toLocaleString("en-IN")}
                      </div>
                    </div>
                    {req.status !== "Cancelled" && req.status !== "Completed" && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                      >
                        {loadingId === req.id ? "Cancelling..." : "Cancel Request"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">Event Parameters</h4>
                    <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <li><strong className="text-zinc-400 dark:text-zinc-500 font-normal">Date:</strong> {req.event_date}</li>
                      <li><strong className="text-zinc-400 dark:text-zinc-500 font-normal">Guest Count:</strong> {req.guest_count} guests</li>
                      <li><strong className="text-zinc-400 dark:text-zinc-500 font-normal">Location:</strong> {req.location}</li>
                    </ul>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {/* Selected services */}
                    <div>
                      <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">Selected Services Checklist</h4>
                      <div className="flex flex-wrap gap-2">
                        {req.request_items.map((item, index) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl text-xs flex items-center gap-2"
                          >
                            <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{item.service_items?.name}</span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              ({item.pricing_type === "per_plate" ? `₹${item.unit_price}/plate` : `₹${item.unit_price}`})
                            </span>
                            {item.quantity > 1 && (
                              <span className="px-1.5 py-0.2 bg-muted text-muted-foreground rounded text-[10px]">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Approved vendor info */}
                    {approvedAssignments.length > 0 && (
                      <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/10 border border-purple-200/50 dark:border-purple-900/20 space-y-3">
                        <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Connected Service Providers
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {approvedAssignments.map((assignment) => (
                            <div key={assignment.id} className="text-xs space-y-1 bg-surface border border-border/80 rounded-xl p-3 shadow-sm">
                              <div className="font-bold text-purple-600 dark:text-purple-400 text-[10px] uppercase tracking-wider">
                                {assignment.categories?.name} Setup
                              </div>
                              <div className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                                {assignment.profiles?.business_name || assignment.profiles?.full_name}
                              </div>
                              <div className="text-muted-foreground">
                                Contact: {assignment.profiles?.full_name}
                              </div>
                              <div className="text-muted-foreground pt-1 border-t border-border/50 mt-1 flex flex-col gap-0.5">
                                <span>Phone: {assignment.profiles?.phone_number}</span>
                                <span className="truncate">Email: {assignment.profiles?.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
