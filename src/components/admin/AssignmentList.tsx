"use client";

import { useState, useTransition } from "react";
import { approveVendorAssignment } from "@/app/admin/bookings/actions";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  request_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
  } | null;
  profiles: {
    id: string;
    full_name: string;
    business_name: string | null;
  } | null;
  event_requests: {
    event_type: string;
    event_date: string;
  } | null;
}

interface AssignmentListProps {
  assignments: Assignment[];
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? assignments
    : assignments.filter((a) => a.status === filter);

  const handleApprove = async (requestId: string, assignmentId: string) => {
    if (!confirm("Are you sure you want to approve this vendor assignment? This will reject all other pending assignments in this category.")) {
      return;
    }
    setLoadingId(assignmentId);
    startTransition(async () => {
      try {
        await approveVendorAssignment(requestId, assignmentId);
        alert("Vendor approved successfully!");
      } catch (err: any) {
        alert(err.message || "Failed to approve vendor.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400";
      case "Pending":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400";
      case "Accepted":
        return "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/30 text-pink-600 dark:text-pink-400";
      case "Rejected":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border border-border/50 rounded-2xl shadow-sm hover:shadow transition duration-200">
        <div className="flex items-center gap-3">
          <label htmlFor="responseFilter" className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
            Filter by Response:
          </label>
          <select
            id="responseFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-foreground transition-all duration-200"
          >
            <option value="all">All Responses</option>
            <option value="Pending">Pending Decision</option>
            <option value="Accepted">Accepted by Vendor</option>
            <option value="Rejected">Rejected by Vendor</option>
            <option value="Approved">Approved by Admin</option>
          </select>
        </div>
        
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Showing {filtered.length} assignments
        </span>
      </div>

      {/* Grid Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No assignments found matching this response filter.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Vendor / Business</th>
                  <th className="pb-4 px-3">Requested Event</th>
                  <th className="pb-4 px-3">Category</th>
                  <th className="pb-4 px-3">Dispatched Date</th>
                  <th className="pb-4 px-3">Response Status</th>
                  <th className="pb-4 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {filtered.map((assign) => (
                  <tr key={assign.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3">
                      <div className="font-semibold text-foreground">
                        {assign.profiles?.business_name || assign.profiles?.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {assign.profiles?.full_name}</div>
                    </td>
                    <td className="py-4 px-3">
                      <a
                        href={`/admin/bookings/${assign.request_id}`}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                      >
                        {assign.event_requests?.event_type || "Event Request"}
                      </a>
                      <div className="text-xxs text-muted-foreground mt-0.5">
                        Date: {assign.event_requests?.event_date || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-foreground font-medium">
                      {assign.categories?.name || "Service"}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-xs">
                      {formatDate(assign.created_at)}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${getStatusBadgeColor(assign.status)}`}>
                        {assign.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {assign.status === "Accepted" ? (
                        <button
                          onClick={() => handleApprove(assign.request_id, assign.id)}
                          disabled={loadingId === assign.id}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          {loadingId === assign.id ? "Approving..." : "Approve & Connect"}
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs italic font-semibold">No actions pending</span>
                      )}
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
