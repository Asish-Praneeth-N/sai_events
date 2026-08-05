"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { approveVendorAssignment } from "@/app/admin/bookings/actions";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Filter,
  Handshake,
  Layers3,
  Store,
  XCircle,
} from "lucide-react";

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

export default function AssignmentList({
  assignments,
}: AssignmentListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? assignments
      : assignments.filter((a) => a.status === filter);

  const handleApprove = async (
    requestId: string,
    assignmentId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to approve this vendor assignment? This will reject all other pending assignments in this category."
      )
    ) {
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
        return "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-500";

      case "Pending":
        return "border-amber-500/20 bg-amber-500/[0.06] text-amber-500";

      case "Accepted":
        return "border-pink-500/20 bg-pink-500/[0.06] text-pink-500";

      case "Rejected":
        return "border-red-500/20 bg-red-500/[0.06] text-red-500";

      default:
        return "border-border bg-muted/30 text-muted-foreground";
    }
  };

  const pendingCount = assignments.filter(
    (a) => a.status === "Pending"
  ).length;

  const acceptedCount = assignments.filter(
    (a) => a.status === "Accepted"
  ).length;

  const approvedCount = assignments.filter(
    (a) => a.status === "Approved"
  ).length;

  const rejectedCount = assignments.filter(
    (a) => a.status === "Rejected"
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ================================================================
          RESPONSE SUMMARY
      ================================================================ */}

      <section className="overflow-hidden border border-border bg-surface/40">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Handshake className="h-3.5 w-3.5 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.22em] text-accent-gold">
                Vendor Response Intelligence
              </span>
            </div>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Response distribution across dispatched vendor assignments.
            </p>
          </div>

          <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
            {assignments.length} Total Assignments
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          <ResponseMetric
            label="Awaiting"
            value={pendingCount}
            icon={<Clock3 />}
            color="text-amber-500"
          />

          <ResponseMetric
            label="Accepted"
            value={acceptedCount}
            icon={<Handshake />}
            color="text-pink-500"
          />

          <ResponseMetric
            label="Approved"
            value={approvedCount}
            icon={<CheckCircle2 />}
            color="text-emerald-500"
          />

          <ResponseMetric
            label="Rejected"
            value={rejectedCount}
            icon={<XCircle />}
            color="text-red-500"
            last
          />
        </div>
      </section>

      {/* ================================================================
          FILTER TOOLBAR
      ================================================================ */}

      <section className="flex flex-col border border-border bg-surface/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:border-b-0">
          <div className="flex h-8 w-8 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
            <Filter className="h-3.5 w-3.5" />
          </div>

          <div>
            <span className="block text-[6px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              Queue Control
            </span>

            <span className="mt-0.5 block text-[9px] font-semibold text-foreground">
              Filter Vendor Responses
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          {isPending && (
            <span className="flex items-center gap-2 text-[7px] font-bold uppercase tracking-[0.15em] text-accent-gold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-gold opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-gold" />
              </span>

              Processing
            </span>
          )}

          <div className="relative">
            <label htmlFor="responseFilter" className="sr-only">
              Filter by Response
            </label>

            <select
              id="responseFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                h-9 min-w-[215px]
                appearance-none
                border border-border
                bg-background/50
                pl-3.5 pr-9
                text-[8px] font-semibold
                text-foreground
                outline-none
                transition-all
                hover:border-accent-gold/30
                focus:border-accent-gold/50
                focus:ring-1
                focus:ring-accent-gold/10
              "
            >
              <option value="all">All Responses</option>
              <option value="Pending">Pending Decision</option>
              <option value="Accepted">Accepted by Vendor</option>
              <option value="Rejected">Rejected by Vendor</option>
              <option value="Approved">Approved by Admin</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="border-l border-border pl-3">
            <span className="block text-[6px] font-bold uppercase tracking-[0.17em] text-muted-foreground/50">
              Results
            </span>

            <span className="mt-0.5 block text-[9px] font-semibold text-foreground">
              {filtered.length}
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================
          ASSIGNMENT REGISTER
      ================================================================ */}

      <section className="overflow-hidden border border-border bg-surface/40">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
              <Store className="h-3.5 w-3.5" />
            </div>

            <div>
              <span className="block text-[7px] font-bold uppercase tracking-[0.22em] text-accent-gold">
                Assignment Register
              </span>

              <span className="mt-0.5 block text-[8px] text-muted-foreground">
                Vendor responses and administrative decisions
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
              Live Registry
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-background/30 text-muted-foreground">
              <Layers3 className="h-4 w-4" />
            </div>

            <h3
              className="mt-4 text-lg font-normal text-foreground"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              No matching assignments
            </h3>

            <p className="mt-1 text-[8px] text-muted-foreground">
              No vendor assignments match the selected response filter.
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================
                DESKTOP
            ============================================================ */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-background/20 text-[6px] font-bold uppercase tracking-[0.19em] text-muted-foreground/60">
                    <th className="px-5 py-3.5">
                      Vendor / Business
                    </th>

                    <th className="px-5 py-3.5">
                      Requested Event
                    </th>

                    <th className="px-5 py-3.5">
                      Category
                    </th>

                    <th className="px-5 py-3.5">
                      Dispatched
                    </th>

                    <th className="px-5 py-3.5">
                      Response
                    </th>

                    <th className="px-5 py-3.5 text-right">
                      Decision
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((assign) => {
                    const isAccepted =
                      assign.status === "Accepted";

                    const isLoading =
                      loadingId === assign.id;

                    return (
                      <tr
                        key={assign.id}
                        className="
                          group
                          border-b border-border/60
                          transition-colors
                          last:border-b-0
                          hover:bg-accent-gold/[0.015]
                        "
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background/30 text-muted-foreground transition-colors group-hover:border-accent-gold/20 group-hover:text-accent-gold">
                              <Building2 className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0">
                              <span className="block max-w-[190px] truncate text-[10px] font-semibold text-foreground">
                                {assign.profiles?.business_name ||
                                  assign.profiles?.full_name}
                              </span>

                              <span className="mt-1 block max-w-[190px] truncate text-[7px] text-muted-foreground">
                                Owner:{" "}
                                {assign.profiles?.full_name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/bookings/${assign.request_id}`}
                            className="group/event inline-flex items-center gap-1.5 text-[9px] font-semibold text-foreground transition-colors hover:text-accent-gold"
                          >
                            {assign.event_requests?.event_type ||
                              "Event Request"}

                            <ArrowRight className="h-3 w-3 text-muted-foreground/40 transition-all group-hover/event:translate-x-0.5 group-hover/event:text-accent-gold" />
                          </Link>

                          <div className="mt-1.5 flex items-center gap-1.5 text-[7px] text-muted-foreground">
                            <CalendarDays className="h-2.5 w-2.5 text-accent-gold" />

                            {assign.event_requests?.event_date ||
                              "N/A"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-[9px] font-medium text-foreground">
                            <span className="h-1 w-1 bg-accent-gold" />

                            {assign.categories?.name ||
                              "Service"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-[8px] text-muted-foreground">
                            {formatDate(assign.created_at)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={assign.status}
                            className={getStatusBadgeColor(
                              assign.status
                            )}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          {isAccepted ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(
                                  assign.request_id,
                                  assign.id
                                )
                              }
                              disabled={isLoading}
                              className="
                                inline-flex h-8
                                items-center justify-center
                                gap-2
                                bg-emerald-600
                                px-3.5
                                text-[7px] font-bold
                                uppercase tracking-[0.13em]
                                text-white
                                transition-all
                                hover:bg-emerald-500
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              "
                            >
                              {isLoading ? (
                                <>
                                  <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3" />
                                  Approve & Connect
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-[7px] font-medium italic text-muted-foreground/50">
                              No actions pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================================
                MOBILE / TABLET
            ============================================================ */}

            <div className="divide-y divide-border lg:hidden">
              {filtered.map((assign) => {
                const isAccepted =
                  assign.status === "Accepted";

                const isLoading =
                  loadingId === assign.id;

                return (
                  <article
                    key={assign.id}
                    className="p-4 transition-colors hover:bg-accent-gold/[0.015] sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background/30 text-accent-gold">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[10px] font-semibold text-foreground">
                            {assign.profiles?.business_name ||
                              assign.profiles?.full_name}
                          </div>

                          <div className="mt-1 truncate text-[7px] text-muted-foreground">
                            Owner:{" "}
                            {assign.profiles?.full_name}
                          </div>
                        </div>
                      </div>

                      <StatusBadge
                        status={assign.status}
                        className={getStatusBadgeColor(
                          assign.status
                        )}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-y border-border/60 py-4">
                      <MobileField label="Event">
                        <Link
                          href={`/admin/bookings/${assign.request_id}`}
                          className="flex items-center gap-1 text-[8px] font-semibold text-foreground hover:text-accent-gold"
                        >
                          <span className="truncate">
                            {assign.event_requests
                              ?.event_type ||
                              "Event Request"}
                          </span>

                          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                        </Link>
                      </MobileField>

                      <MobileField label="Category">
                        {assign.categories?.name ||
                          "Service"}
                      </MobileField>

                      <MobileField label="Event Date">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-2.5 w-2.5 text-accent-gold" />

                          {assign.event_requests
                            ?.event_date || "N/A"}
                        </span>
                      </MobileField>

                      <MobileField label="Dispatched">
                        <span className="font-mono">
                          {formatDate(
                            assign.created_at
                          )}
                        </span>
                      </MobileField>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/40">
                        Administrative Decision
                      </span>

                      {isAccepted ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(
                              assign.request_id,
                              assign.id
                            )
                          }
                          disabled={isLoading}
                          className="
                            inline-flex h-8
                            items-center justify-center
                            gap-2
                            bg-emerald-600
                            px-3
                            text-[7px] font-bold
                            uppercase tracking-[0.12em]
                            text-white
                            hover:bg-emerald-500
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {isLoading ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              Approve & Connect
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[7px] italic text-muted-foreground/50">
                          No actions pending
                        </span>
                      )}
                    </div>
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
   RESPONSE METRIC
============================================================================ */

function ResponseMetric({
  label,
  value,
  icon,
  color,
  last = false,
}: {
  label: string;
  value: number;
  icon: React.ReactElement;
  color: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-3
        border-b border-r border-border
        p-4
        even:border-r-0
        lg:border-b-0
        lg:even:border-r
        ${last ? "lg:border-r-0" : ""}
      `}
    >
      <span
        className={`
          flex h-8 w-8
          items-center justify-center
          [&>svg]:h-3.5
          [&>svg]:w-3.5
          ${color}
        `}
      >
        {icon}
      </span>

      <div>
        <div
          className={`text-2xl font-normal ${color}`}
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {value}
        </div>

        <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
   STATUS BADGE
============================================================================ */

function StatusBadge({
  status,
  className,
}: {
  status: string;
  className: string;
}) {
  const Icon =
    status === "Approved"
      ? CheckCircle2
      : status === "Accepted"
        ? Handshake
        : status === "Rejected"
          ? XCircle
          : status === "Pending"
            ? Clock3
            : CircleAlert;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        whitespace-nowrap
        border
        px-2 py-1
        text-[6px] font-bold
        uppercase tracking-[0.14em]
        ${className}
      `}
    >
      <Icon className="h-2.5 w-2.5" />
      {status}
    </span>
  );
}

function MobileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[6px] font-bold uppercase tracking-[0.17em] text-muted-foreground/50">
        {label}
      </span>

      <div className="mt-1.5 truncate text-[8px] font-medium text-foreground">
        {children}
      </div>
    </div>
  );
}