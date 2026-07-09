import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Shield, AlertTriangle, User, Calendar, MapPin, Activity, HelpCircle } from "lucide-react";

export default async function AdminEventAssignmentsPage() {
  const supabase = await createClient();

  let assignments: any[] = [];
  let tableMissing = false;

  let dbError: Error | null = null;
  try {
    const { data: assignmentsData, error } = await supabase
      .from("event_assignments")
      .select(`
        id,
        event_id,
        assignment_date,
        status,
        handover_notes,
        expected_completion,
        escalation_level,
        escalation_reason,
        reassignment_history,
        event_requests (
          event_type,
          event_date,
          location,
          profiles ( full_name )
        ),
        profiles:assigned_operational_manager_id (
          full_name
        )
      `)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    assignments = assignmentsData || [];
  } catch (err: any) {
    dbError = err;
  }

  if (dbError) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load event assignments</h2>
        <p className="text-xs opacity-90">{dbError.message}</p>
        <p className="text-xs mt-4 opacity-75">Please execute the database migration script (`migration_milestone_2.sql`) in the Supabase SQL editor to create the required tables.</p>
      </div>
    );
  }

  const getEscalationBadge = (level: number, reason: string | null) => {
    switch (level) {
      case 3:
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3" /> High Escalation ({reason})
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Medium Escalation ({reason})
          </span>
        );
      case 1:
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Low Escalation
          </span>
        );
      default:
        return (
          <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider bg-zinc-500/5 px-2.5 py-0.5 rounded-full border border-zinc-500/10">
            Stable
          </span>
        );
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Closed":
      case "Execution Complete":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400";
      case "Execution Started":
      case "Accepted":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400";
      case "Pending":
      case "Assigned":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Event Assignments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor Operational Managers dispatched to execute finalized events. Audit handover notes and logs.
        </p>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs rounded-2xl">
          <strong>⚠️ Database Note:</strong> Running on mock data. Apply migrations to track real event assignments.
        </div>
      )}

      {/* Grid Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        {assignments.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No Event Assignments created yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Assignment ID</th>
                  <th className="pb-4 px-3">Event Details</th>
                  <th className="pb-4 px-3">Assigned Manager</th>
                  <th className="pb-4 px-3">Expected Completion</th>
                  <th className="pb-4 px-3">Escalation Status</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {assignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3 font-mono text-xs text-muted-foreground">
                      {assign.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-3">
                      <Link
                        href={`/admin/bookings/${assign.event_id}`}
                        className="font-bold text-accent-gold hover:underline transition"
                      >
                        {assign.event_requests?.event_type || "Event"}
                      </Link>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-col gap-0.5">
                        <span>Client: {assign.event_requests?.profiles?.full_name}</span>
                        <span>Date: {assign.event_requests?.event_date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-bold text-foreground">
                      {assign.profiles?.full_name || "Unassigned"}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-xs">
                      {assign.expected_completion ? formatDate(assign.expected_completion) : "N/A"}
                    </td>
                    <td className="py-4 px-3">
                      {getEscalationBadge(assign.escalation_level, assign.escalation_reason)}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider ${getStatusBadgeColor(assign.status)}`}>
                        {assign.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <Link
                        href={`/admin/bookings/${assign.event_id}`}
                        className="px-3 py-1.5 border border-border bg-background hover:bg-surface-raised rounded-xl text-xs font-bold text-foreground text-center transition cursor-pointer"
                      >
                        Manage Case
                      </Link>
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
