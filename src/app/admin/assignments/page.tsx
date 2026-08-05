
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

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

  /* ==========================================================================
     ERROR STATE
  ========================================================================== */

  if (dbError) {
    return (
      <div className="space-y-6">
        <section
          className="
            relative overflow-hidden
            border border-red-500/20
            bg-red-500/[0.04]
            p-5 sm:p-6
          "
        >
          <span className="absolute left-0 top-0 h-full w-[2px] bg-red-500" />

          <div className="flex items-start gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                border border-red-500/20
                bg-red-500/[0.06]
                text-red-500
              "
            >
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.26em]
                  text-red-500
                "
              >
                Assignment Registry Error
              </span>

              <h2
                className="
                  mt-2 text-xl font-normal
                  text-foreground sm:text-2xl
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Failed to load event assignments
              </h2>

              <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                {dbError.message}
              </p>

              <div
                className="
                  mt-4 border-l border-red-500/30
                  pl-3 text-[9px] leading-5
                  text-muted-foreground
                "
              >
                Execute{" "}
                <code className="font-mono text-foreground">
                  migration_milestone_2.sql
                </code>{" "}
                in the Supabase SQL editor to create the required
                assignment tables.
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ==========================================================================
     HELPERS
  ========================================================================== */

  const getEscalationConfig = (level: number) => {
    switch (level) {
      case 3:
        return {
          label: "High Escalation",
          className:
            "border-red-500/20 bg-red-500/[0.07] text-red-500",
          dot: "bg-red-500",
        };

      case 2:
        return {
          label: "Medium",
          className:
            "border-amber-500/20 bg-amber-500/[0.07] text-amber-500",
          dot: "bg-amber-500",
        };

      case 1:
        return {
          label: "Low",
          className:
            "border-yellow-500/20 bg-yellow-500/[0.07] text-yellow-500",
          dot: "bg-yellow-500",
        };

      default:
        return {
          label: "Stable",
          className:
            "border-border bg-foreground/[0.025] text-muted-foreground",
          dot: "bg-emerald-500",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Closed":
      case "Execution Complete":
        return {
          className:
            "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500",
          dot: "bg-emerald-500",
        };

      case "Execution Started":
      case "Accepted":
        return {
          className:
            "border-blue-500/20 bg-blue-500/[0.07] text-blue-500",
          dot: "bg-blue-500",
        };

      case "Pending":
      case "Assigned":
        return {
          className:
            "border-amber-500/20 bg-amber-500/[0.07] text-amber-500",
          dot: "bg-amber-500",
        };

      default:
        return {
          className:
            "border-border bg-foreground/[0.025] text-muted-foreground",
          dot: "bg-muted-foreground",
        };
    }
  };

  /* ==========================================================================
     SUMMARY
  ========================================================================== */

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.status !== "Closed" &&
      assignment.status !== "Execution Complete"
  ).length;

  const escalatedAssignments = assignments.filter(
    (assignment) => Number(assignment.escalation_level) > 0
  ).length;

  const criticalAssignments = assignments.filter(
    (assignment) => Number(assignment.escalation_level) >= 3
  ).length;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div className="space-y-6">
      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <section
        className="
          relative overflow-hidden
          border border-border
          bg-surface/40
        "
      >
        <div
          className="
            absolute left-0 top-0
            h-[2px] w-full
            bg-gradient-to-r
            from-transparent
            via-accent-gold/70
            to-transparent
          "
        />

        <div className="p-5 sm:p-6 lg:p-7">
          <div
            className="
              flex flex-col gap-5
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent-gold" />

                <span
                  className="
                    text-[7px] font-bold uppercase
                    tracking-[0.28em]
                    text-accent-gold
                  "
                >
                  Operations Control
                </span>
              </div>

              <h1
                className="
                  mt-3 text-3xl font-normal
                  tracking-[-0.025em]
                  text-foreground
                  sm:text-4xl
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Event Assignments
              </h1>

              <p
                className="
                  mt-2 max-w-xl
                  text-[10px] leading-5
                  text-muted-foreground
                  sm:text-[11px]
                "
              >
                Monitor Operational Managers dispatched to finalized
                events, review execution ownership and identify
                assignments requiring administrative attention.
              </p>
            </div>

            <div
              className="
                flex items-center gap-2
                border-l-2 border-accent-gold/50
                pl-4
              "
            >
              <div>
                <span
                  className="
                    block text-[7px]
                    font-bold uppercase
                    tracking-[0.2em]
                    text-muted-foreground/60
                  "
                >
                  Assignment Registry
                </span>

                <span
                  className="
                    mt-1 block text-sm
                    font-semibold text-foreground
                  "
                >
                  {assignments.length} Total Records
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          DATABASE NOTICE
      ================================================================ */}

      {tableMissing && (
        <div
          className="
            relative overflow-hidden
            border border-amber-500/20
            bg-amber-500/[0.05]
            px-4 py-4 sm:px-5
          "
        >
          <span className="absolute left-0 top-0 h-full w-[2px] bg-amber-500" />

          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

            <div>
              <span
                className="
                  text-[8px] font-bold uppercase
                  tracking-[0.25em]
                  text-amber-500
                "
              >
                Database Migration Required
              </span>

              <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                Assignment tracking is currently running on mock data.
                Apply the required migrations to track real event
                assignments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          OPERATIONAL SUMMARY
      ================================================================ */}

      <section
        className="
          grid grid-cols-2
          border border-border
          bg-surface/40
          lg:grid-cols-4
        "
      >
        <SummaryMetric
          icon={<UsersRound />}
          label="Total Assignments"
          value={assignments.length}
          description="Registry records"
        />

        <SummaryMetric
          icon={<Activity />}
          label="Active Cases"
          value={activeAssignments}
          description="In operational flow"
        />

        <SummaryMetric
          icon={<AlertTriangle />}
          label="Escalated"
          value={escalatedAssignments}
          description="Require attention"
          warning={escalatedAssignments > 0}
        />

        <SummaryMetric
          icon={<ShieldCheck />}
          label="Critical"
          value={criticalAssignments}
          description="High escalation"
          danger={criticalAssignments > 0}
        />
      </section>

      {/* ================================================================
          ASSIGNMENT REGISTRY
      ================================================================ */}

      <section className="border border-border bg-surface/50">
        {/* REGISTRY HEADER */}

        <div
          className="
            flex flex-col gap-3
            border-b border-border
            p-4 sm:p-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-accent-gold" />

              <span
                className="
                  text-[8px] font-bold uppercase
                  tracking-[0.28em]
                  text-accent-gold
                "
              >
                Live Assignment Registry
              </span>
            </div>

            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Operational ownership and event execution status
            </p>
          </div>

          <div
            className="
              flex items-center gap-2
              text-[8px] font-semibold
              uppercase tracking-[0.16em]
              text-muted-foreground
            "
          >
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute inline-flex h-full w-full
                  animate-ping rounded-full
                  bg-emerald-500 opacity-30
                "
              />

              <span
                className="
                  relative inline-flex
                  h-2 w-2 rounded-full
                  bg-emerald-500
                "
              />
            </span>

            Registry Active
          </div>
        </div>

        {/* EMPTY STATE */}

        {assignments.length === 0 ? (
          <div
            className="
              flex min-h-[340px]
              flex-col items-center
              justify-center
              px-6 py-16
              text-center
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                border border-accent-gold/20
                bg-accent-gold/[0.04]
                text-accent-gold
              "
            >
              <CalendarDays className="h-5 w-5" />
            </div>

            <span
              className="
                mt-5 text-[7px]
                font-bold uppercase
                tracking-[0.26em]
                text-accent-gold
              "
            >
              Operations Registry
            </span>

            <h3
              className="
                mt-2 text-2xl
                font-normal text-foreground
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              No event assignments yet.
            </h3>

            <p
              className="
                mt-2 max-w-sm
                text-[10px] leading-5
                text-muted-foreground
              "
            >
              Operational assignments will appear here after an
              event is finalized and a manager is dispatched.
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================
                DESKTOP TABLE
            ============================================================ */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr
                    className="
                      border-b border-border
                      bg-background/30
                      text-[7px]
                      font-bold uppercase
                      tracking-[0.2em]
                      text-muted-foreground/60
                    "
                  >
                    <th className="px-5 py-4">Assignment</th>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Operational Manager</th>
                    <th className="px-5 py-4">Completion</th>
                    <th className="px-5 py-4">Escalation</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Control</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assign, index) => {
                    const escalation = getEscalationConfig(
                      Number(assign.escalation_level) || 0
                    );

                    const status = getStatusConfig(assign.status);

                    return (
                      <tr
                        key={assign.id}
                        className="
                          group border-b border-border/70
                          transition-colors duration-300
                          last:border-b-0
                          hover:bg-accent-gold/[0.018]
                        "
                      >
                        {/* ASSIGNMENT */}

                        <td className="px-5 py-5 align-top">
                          <div className="flex items-start gap-3">
                            <span
                              className="
                                mt-0.5 flex h-8 w-8
                                shrink-0 items-center
                                justify-center
                                border border-border
                                bg-background/50
                                text-[8px]
                                font-semibold
                                text-muted-foreground
                              "
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <div className="min-w-0">
                              <span
                                className="
                                  block text-[7px]
                                  font-bold uppercase
                                  tracking-[0.18em]
                                  text-muted-foreground/50
                                "
                              >
                                Assignment ID
                              </span>

                              <span
                                className="
                                  mt-1 block
                                  font-mono text-[9px]
                                  text-foreground
                                "
                              >
                                {assign.id.substring(0, 8)}...
                              </span>

                              {assign.assignment_date && (
                                <span
                                  className="
                                    mt-1 block text-[8px]
                                    text-muted-foreground
                                  "
                                >
                                  {formatDate(assign.assignment_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EVENT */}

                        <td className="px-5 py-5 align-top">
                          <Link
                            href={`/admin/bookings/${assign.event_id}`}
                            className="
                              group/link inline-flex
                              items-center gap-1.5
                              text-sm font-semibold
                              text-foreground
                              transition-colors
                              hover:text-accent-gold
                            "
                          >
                            {assign.event_requests?.event_type ||
                              "Event"}

                            <ArrowUpRight
                              className="
                                h-3 w-3
                                text-muted-foreground
                                transition-all
                                group-hover/link:-translate-y-0.5
                                group-hover/link:translate-x-0.5
                                group-hover/link:text-accent-gold
                              "
                            />
                          </Link>

                          <div className="mt-2 space-y-1.5">
                            <MetaRow
                              icon={<UserRound />}
                              value={
                                assign.event_requests?.profiles
                                  ?.full_name || "Client unavailable"
                              }
                            />

                            <MetaRow
                              icon={<CalendarDays />}
                              value={
                                assign.event_requests?.event_date ||
                                "Date unavailable"
                              }
                            />

                            {assign.event_requests?.location && (
                              <MetaRow
                                icon={<MapPin />}
                                value={assign.event_requests.location}
                              />
                            )}
                          </div>
                        </td>

                        {/* MANAGER */}

                        <td className="px-5 py-5 align-top">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex h-9 w-9
                                shrink-0 items-center
                                justify-center
                                border border-accent-gold/20
                                bg-accent-gold/[0.04]
                                text-accent-gold
                              "
                            >
                              <UserRound className="h-3.5 w-3.5" />
                            </div>

                            <div>
                              <span
                                className="
                                  block text-[7px]
                                  font-bold uppercase
                                  tracking-[0.17em]
                                  text-muted-foreground/50
                                "
                              >
                                Assigned OM
                              </span>

                              <span
                                className="
                                  mt-1 block text-[10px]
                                  font-semibold text-foreground
                                "
                              >
                                {assign.profiles?.full_name ||
                                  "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* COMPLETION */}

                        <td className="px-5 py-5 align-top">
                          <div className="flex items-start gap-2">
                            <Clock3 className="mt-0.5 h-3.5 w-3.5 text-accent-gold" />

                            <div>
                              <span
                                className="
                                  block text-[7px]
                                  font-bold uppercase
                                  tracking-[0.17em]
                                  text-muted-foreground/50
                                "
                              >
                                Expected
                              </span>

                              <span
                                className="
                                  mt-1 block
                                  font-mono text-[9px]
                                  text-foreground
                                "
                              >
                                {assign.expected_completion
                                  ? formatDate(
                                      assign.expected_completion
                                    )
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ESCALATION */}

                        <td className="px-5 py-5 align-top">
                          <div>
                            <span
                              className={`
                                inline-flex items-center gap-1.5
                                border px-2.5 py-1.5
                                text-[7px]
                                font-bold uppercase
                                tracking-[0.15em]
                                ${escalation.className}
                              `}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${escalation.dot}`}
                              />

                              {escalation.label}
                            </span>

                            {assign.escalation_reason &&
                              Number(assign.escalation_level) > 0 && (
                                <p
                                  className="
                                    mt-2 max-w-[160px]
                                    text-[8px] leading-4
                                    text-muted-foreground
                                  "
                                >
                                  {assign.escalation_reason}
                                </p>
                              )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5 align-top">
                          <span
                            className={`
                              inline-flex items-center gap-1.5
                              border px-2.5 py-1.5
                              text-[7px]
                              font-bold uppercase
                              tracking-[0.15em]
                              ${status.className}
                            `}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {assign.status}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-5 text-right align-top">
                          <Link
                            href={`/admin/bookings/${assign.event_id}`}
                            className="
                              inline-flex h-9
                              items-center justify-center
                              gap-2
                              border border-border
                              bg-background/50
                              px-3
                              text-[7px]
                              font-bold uppercase
                              tracking-[0.16em]
                              text-muted-foreground
                              transition-all duration-300

                              hover:border-accent-gold/40
                              hover:bg-accent-gold/[0.04]
                              hover:text-accent-gold
                            "
                          >
                            Manage
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================================
                MOBILE / TABLET CARDS
            ============================================================ */}

            <div className="grid grid-cols-1 gap-px bg-border lg:hidden">
              {assignments.map((assign, index) => {
                const escalation = getEscalationConfig(
                  Number(assign.escalation_level) || 0
                );

                const status = getStatusConfig(assign.status);

                return (
                  <article
                    key={assign.id}
                    className="
                      relative overflow-hidden
                      bg-surface p-5
                    "
                  >
                    <div
                      className="
                        absolute left-0 top-0
                        h-[2px] w-10
                        bg-accent-gold
                      "
                    />

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className="
                            text-[7px] font-bold uppercase
                            tracking-[0.22em]
                            text-accent-gold
                          "
                        >
                          Assignment {String(index + 1).padStart(2, "0")}
                        </span>

                        <Link
                          href={`/admin/bookings/${assign.event_id}`}
                          className="
                            mt-1.5 block truncate
                            text-xl font-normal
                            text-foreground
                            transition-colors
                            hover:text-accent-gold
                          "
                          style={{
                            fontFamily:
                              '"Playfair Display", serif',
                          }}
                        >
                          {assign.event_requests?.event_type ||
                            "Event"}
                        </Link>

                        <span
                          className="
                            mt-1 block
                            font-mono text-[8px]
                            text-muted-foreground
                          "
                        >
                          {assign.id.substring(0, 8)}...
                        </span>
                      </div>

                      <span
                        className={`
                          shrink-0 border
                          px-2 py-1
                          text-[6px]
                          font-bold uppercase
                          tracking-[0.14em]
                          ${status.className}
                        `}
                      >
                        {assign.status}
                      </span>
                    </div>

                    {/* EVENT INFORMATION */}

                    <div
                      className="
                        mt-5 space-y-2.5
                        border-y border-border/70
                        py-4
                      "
                    >
                      <MetaRow
                        icon={<UserRound />}
                        value={
                          assign.event_requests?.profiles?.full_name ||
                          "Client unavailable"
                        }
                      />

                      <MetaRow
                        icon={<CalendarDays />}
                        value={
                          assign.event_requests?.event_date ||
                          "Date unavailable"
                        }
                      />

                      {assign.event_requests?.location && (
                        <MetaRow
                          icon={<MapPin />}
                          value={assign.event_requests.location}
                        />
                      )}
                    </div>

                    {/* MANAGER */}

                    <div className="mt-4">
                      <span
                        className="
                          text-[7px] font-bold uppercase
                          tracking-[0.2em]
                          text-muted-foreground/55
                        "
                      >
                        Operational Manager
                      </span>

                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className="
                            flex h-9 w-9
                            items-center justify-center
                            border border-accent-gold/20
                            bg-accent-gold/[0.04]
                            text-accent-gold
                          "
                        >
                          <UserRound className="h-3.5 w-3.5" />
                        </div>

                        <span className="text-[10px] font-semibold text-foreground">
                          {assign.profiles?.full_name || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div
                        className="
                          border border-border
                          bg-background/30
                          p-3
                        "
                      >
                        <span
                          className="
                            block text-[6px]
                            font-bold uppercase
                            tracking-[0.18em]
                            text-muted-foreground/50
                          "
                        >
                          Completion
                        </span>

                        <span
                          className="
                            mt-1.5 block
                            font-mono text-[9px]
                            text-foreground
                          "
                        >
                          {assign.expected_completion
                            ? formatDate(assign.expected_completion)
                            : "N/A"}
                        </span>
                      </div>

                      <div
                        className="
                          border border-border
                          bg-background/30
                          p-3
                        "
                      >
                        <span
                          className="
                            block text-[6px]
                            font-bold uppercase
                            tracking-[0.18em]
                            text-muted-foreground/50
                          "
                        >
                          Escalation
                        </span>

                        <span
                          className={`
                            mt-1.5 inline-flex
                            items-center gap-1.5
                            text-[8px] font-semibold
                            ${escalation.className
                              .split(" ")
                              .find((item) =>
                                item.startsWith("text-")
                              ) || ""}
                          `}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${escalation.dot}`}
                          />

                          {escalation.label}
                        </span>
                      </div>
                    </div>

                    {assign.escalation_reason &&
                      Number(assign.escalation_level) > 0 && (
                        <div
                          className="
                            mt-3 border-l-2
                            border-amber-500/40
                            bg-amber-500/[0.025]
                            px-3 py-2
                          "
                        >
                          <span
                            className="
                              block text-[6px]
                              font-bold uppercase
                              tracking-[0.18em]
                              text-amber-500
                            "
                          >
                            Escalation Note
                          </span>

                          <p
                            className="
                              mt-1 text-[9px]
                              leading-4
                              text-muted-foreground
                            "
                          >
                            {assign.escalation_reason}
                          </p>
                        </div>
                      )}

                    {/* ACTION */}

                    <Link
                      href={`/admin/bookings/${assign.event_id}`}
                      className="
                        mt-5 flex h-10 w-full
                        items-center justify-center
                        gap-2
                        bg-accent-gold
                        text-[7px]
                        font-bold uppercase
                        tracking-[0.2em]
                        text-black
                        transition-all duration-300

                        hover:brightness-105
                        active:scale-[0.99]
                      "
                    >
                      Manage Assignment
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ============================================================================
   SUMMARY METRIC
============================================================================ */

function SummaryMetric({
  icon,
  label,
  value,
  description,
  warning = false,
  danger = false,
}: {
  icon: React.ReactElement;
  label: string;
  value: number;
  description: string;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className="
        group relative
        min-w-0
        border-b border-r border-border
        p-4
        transition-colors duration-300
        hover:bg-accent-gold/[0.018]

        even:border-r-0
        lg:border-b-0
        lg:even:border-r
        lg:last:border-r-0

        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`
            flex h-8 w-8
            items-center justify-center
            border
            [&>svg]:h-3.5
            [&>svg]:w-3.5

            ${
              danger
                ? "border-red-500/20 bg-red-500/[0.05] text-red-500"
                : warning
                  ? "border-amber-500/20 bg-amber-500/[0.05] text-amber-500"
                  : "border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold"
            }
          `}
        >
          {icon}
        </div>

        {(warning || danger) && value > 0 && (
          <span
            className={`
              h-1.5 w-1.5 rounded-full
              ${danger ? "bg-red-500" : "bg-amber-500"}
            `}
          />
        )}
      </div>

      <span
        className="
          mt-5 block text-[7px]
          font-bold uppercase
          tracking-[0.19em]
          text-muted-foreground/55
        "
      >
        {label}
      </span>

      <div className="mt-1 flex items-end gap-2">
        <span
          className={`
            text-2xl font-normal
            ${
              danger && value > 0
                ? "text-red-500"
                : warning && value > 0
                  ? "text-amber-500"
                  : "text-foreground"
            }
          `}
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {value}
        </span>

        <span className="pb-1 text-[7px] text-muted-foreground">
          {description}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
   META ROW
============================================================================ */

function MetaRow({
  icon,
  value,
}: {
  icon: React.ReactElement;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="
          flex h-5 w-5
          shrink-0 items-center
          justify-center
          text-accent-gold
          [&>svg]:h-3
          [&>svg]:w-3
        "
      >
        {icon}
      </span>

      <span
        className="
          min-w-0 truncate
          text-[9px]
          text-muted-foreground
        "
      >
        {value}
      </span>
    </div>
  );
}

