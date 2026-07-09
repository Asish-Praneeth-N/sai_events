"use client";

import { useState, useTransition } from "react";
import { approveVendorAssignment } from "@/app/admin/bookings/actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Send, CheckCircle2, Clock, XOctagon, Eye } from "lucide-react";

interface Invitation {
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

interface VendorInvitationsClientProps {
  initialInvitations: Invitation[];
}

export default function VendorInvitationsClient({ initialInvitations }: VendorInvitationsClientProps) {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? invitations
    : invitations.filter((i) => i.status === filter);

  const handleApprove = async (requestId: string, invitationId: string) => {
    if (!confirm("Are you sure you want to finalize this vendor invitation? This will automatically reject all other pending invitations in the same category for this Event Case.")) {
      return;
    }
    setLoadingId(invitationId);
    startTransition(async () => {
      try {
        await approveVendorAssignment(requestId, invitationId);
        alert("Vendor finalized successfully!");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to finalize vendor.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "Finalized":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400";
      case "Pending":
      case "Sent":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400";
      case "Accepted":
        return "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/30 text-pink-600 dark:text-pink-400";
      case "Rejected":
      case "Expired":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border border-border/50 rounded-2xl shadow-sm hover:shadow transition duration-200">
        <div className="flex items-center gap-3">
          <label htmlFor="invitationFilter" className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
            Filter by Response:
          </label>
          <select
            id="invitationFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold text-foreground transition-all duration-200"
          >
            <option value="all">All Responses</option>
            <option value="Pending">Pending Decision</option>
            <option value="Accepted">Accepted by Vendor</option>
            <option value="Rejected">Rejected by Vendor</option>
            <option value="Approved">Finalized by Admin</option>
          </select>
        </div>
        
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Total invitations: {filtered.length}
        </span>
      </div>

      {/* Grid Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/5">
            No invitations found matching this response filter.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Vendor / Business</th>
                  <th className="pb-4 px-3">Event Case</th>
                  <th className="pb-4 px-3">Category</th>
                  <th className="pb-4 px-3">Sent Date</th>
                  <th className="pb-4 px-3">Response Status</th>
                  <th className="pb-4 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3">
                      <div className="font-semibold text-foreground">
                        {inv.profiles?.business_name || inv.profiles?.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Owner: {inv.profiles?.full_name}</div>
                    </td>
                    <td className="py-4 px-3">
                      <Link
                        href={`/admin/bookings/${inv.request_id}`}
                        className="font-bold text-accent-gold hover:underline transition"
                      >
                        {inv.event_requests?.event_type || "Event"}
                      </Link>
                      <div className="text-xxs text-muted-foreground mt-0.5">
                        Date: {inv.event_requests?.event_date || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-foreground font-medium">
                      {inv.categories?.name || "Service"}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-xs">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider ${getStatusBadgeColor(inv.status)}`}>
                        {inv.status === "Approved" ? "Finalized" : inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {inv.status === "Accepted" ? (
                        <button
                          onClick={() => handleApprove(inv.request_id, inv.id)}
                          disabled={loadingId === inv.id}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          {loadingId === inv.id ? "Finalizing..." : "Finalize Vendor"}
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
