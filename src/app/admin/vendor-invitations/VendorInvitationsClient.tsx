"use client";

import { useState, useTransition } from "react";
import { approveVendorAssignment } from "@/app/admin/bookings/actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Filter,
  Send,
  ShieldCheck,
  Store,
  Tag,
  UserRound,
  XCircle,
} from "lucide-react";

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

const FILTERS = [
  { value: "all", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "Approved", label: "Finalized" },
] as const;

export default function VendorInvitationsClient({
  initialInvitations,
}: VendorInvitationsClientProps) {
  const [invitations] = useState<Invitation[]>(initialInvitations);
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /* ==========================================================================
     FILTERING
  ========================================================================== */

  const filtered =
    filter === "all"
      ? invitations
      : invitations.filter((invitation) => invitation.status === filter);

  /* ==========================================================================
     METRICS
  ========================================================================== */

  const totalCount = invitations.length;

  const pendingCount = invitations.filter(
    (invitation) =>
      invitation.status === "Pending" || invitation.status === "Sent"
  ).length;

  const acceptedCount = invitations.filter(
    (invitation) => invitation.status === "Accepted"
  ).length;

  const finalizedCount = invitations.filter(
    (invitation) =>
      invitation.status === "Approved" ||
      invitation.status === "Finalized"
  ).length;

  /* ==========================================================================
     OPERATIONS
  ========================================================================== */

  const handleApprove = async (
    requestId: string,
    invitationId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to finalize this vendor invitation? This will automatically reject all other pending invitations in the same category for this Event Case."
      )
    ) {
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

  /* ==========================================================================
     STATUS BADGE
  ========================================================================== */

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Finalized":
        return (
          <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-emerald-500">
            <ShieldCheck className="h-2.5 w-2.5" />
            Finalized
          </span>
        );

      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1.5 border border-indigo-500/20 bg-indigo-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-indigo-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Accepted
          </span>
        );

      case "Pending":
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-amber-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-30" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>

            {status}
          </span>
        );

      case "Rejected":
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 border border-red-500/20 bg-red-500/[0.04] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-red-400">
            <XCircle className="h-2.5 w-2.5" />
            {status}
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 border border-border bg-background/30 px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <CircleDot className="h-2.5 w-2.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* =====================================================================
          OPERATION METRICS
      ===================================================================== */}

      <section className="grid grid-cols-2 overflow-hidden border border-border bg-surface/30 lg:grid-cols-4">
        <MetricBlock
          number="01"
          label="Total Invitations"
          value={totalCount}
          description="All dispatches"
          icon={<Send />}
        />

        <MetricBlock
          number="02"
          label="Awaiting Response"
          value={pendingCount}
          description="Vendor decision pending"
          icon={<Clock3 />}
          tone="amber"
        />

        <MetricBlock
          number="03"
          label="Accepted"
          value={acceptedCount}
          description="Ready for review"
          icon={<CheckCircle2 />}
          tone="indigo"
        />

        <MetricBlock
          number="04"
          label="Finalized"
          value={finalizedCount}
          description="Admin confirmed"
          icon={<ShieldCheck />}
          tone="emerald"
          last
        />
      </section>

      {/* =====================================================================
          INVITATION REGISTRY
      ===================================================================== */}

      <section className="overflow-hidden border border-border bg-surface/25">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-border bg-background/10 p-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <div className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center border border-border text-muted-foreground">
              <Filter className="h-3 w-3" />
            </div>

            {FILTERS.map((item) => {
              const count =
                item.value === "all"
                  ? totalCount
                  : item.value === "Pending"
                    ? pendingCount
                    : item.value === "Accepted"
                      ? acceptedCount
                      : item.value === "Approved"
                        ? finalizedCount
                        : invitations.filter(
                          (invitation) =>
                            invitation.status === item.value
                        ).length;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`
                    flex h-7 shrink-0
                    items-center gap-2
                    border px-3
                    text-[6px] font-bold
                    uppercase tracking-[0.14em]
                    transition-all

                    ${filter === item.value
                      ? `
                          border-accent-gold/30
                          bg-accent-gold/[0.07]
                          text-accent-gold
                        `
                      : `
                          border-transparent
                          text-muted-foreground
                          hover:border-border
                          hover:text-foreground
                        `
                    }
                  `}
                >
                  {item.label}

                  <span
                    className={`
                      font-mono text-[6px]

                      ${filter === item.value
                        ? "text-accent-gold/60"
                        : "text-muted-foreground/40"
                      }
                    `}
                  >
                    {String(count).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[6px] font-medium uppercase tracking-[0.14em] text-muted-foreground/40 sm:inline">
              Supplier Dispatch Operations
            </span>

            <div className="flex h-7 items-center gap-2 border border-border bg-background/20 px-3">
              <Activity className="h-2.5 w-2.5 text-accent-gold" />

              <span className="font-mono text-[6px] text-muted-foreground">
                {filtered.length} RECORDS
              </span>
            </div>
          </div>
        </div>

        {/* REGISTRY META */}

        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
            Invitation Registry
          </span>

          <span className="font-mono text-[6px] text-muted-foreground/45">
            {filtered.length} / {totalCount} VISIBLE
          </span>
        </div>

        {/* TABLE */}

        {filtered.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-background/30 text-muted-foreground">
              <Send className="h-4 w-4" />
            </div>

            <h3
              className="mt-4 text-base font-normal text-foreground"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              No invitations found
            </h3>

            <p className="mt-1 max-w-[290px] text-[7px] leading-4 text-muted-foreground">
              No vendor invitations match the currently selected response
              filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-background/20">
                  <TableHeader>Vendor / Business</TableHeader>

                  <TableHeader>Event Case</TableHeader>

                  <TableHeader>Category</TableHeader>

                  <TableHeader>Dispatched</TableHeader>

                  <TableHeader>Response</TableHeader>

                  <TableHeader align="right">
                    Operations
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filtered.map((invitation) => {
                  const businessName =
                    invitation.profiles?.business_name ||
                    invitation.profiles?.full_name ||
                    "Vendor";

                  const initials = businessName
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={invitation.id}
                      className="
                        group
                        border-b border-border/50
                        transition-colors
                        last:border-b-0
                        hover:bg-accent-gold/[0.018]
                      "
                    >
                      {/* VENDOR */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background/30 text-[8px] font-semibold uppercase text-muted-foreground transition-colors group-hover:border-accent-gold/20 group-hover:text-accent-gold">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <span className="block max-w-[190px] truncate text-[9px] font-semibold text-foreground">
                              {businessName}
                            </span>

                            <span className="mt-0.5 flex items-center gap-1 text-[6px] text-muted-foreground">
                              <UserRound className="h-2.5 w-2.5" />

                              <span className="max-w-[170px] truncate">
                                {invitation.profiles?.full_name ||
                                  "Unknown owner"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EVENT CASE */}

                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <BriefcaseBusiness className="mt-0.5 h-3 w-3 shrink-0 text-accent-gold" />

                          <div className="min-w-0">
                            <Link
                              href={`/admin/bookings/${invitation.request_id}`}
                              className="group/link inline-flex max-w-[180px] items-center gap-1 text-[8px] font-semibold text-foreground transition-colors hover:text-accent-gold"
                            >
                              <span className="truncate">
                                {invitation.event_requests?.event_type ||
                                  "Event"}
                              </span>

                              <ChevronRight className="h-2.5 w-2.5 shrink-0 opacity-40 transition-transform group-hover/link:translate-x-0.5" />
                            </Link>

                            <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[6px] text-muted-foreground/60">
                              <CalendarDays className="h-2.5 w-2.5" />

                              {invitation.event_requests?.event_date ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 shrink-0 text-accent-gold" />

                          <span className="max-w-[160px] truncate text-[8px] font-semibold text-foreground">
                            {invitation.categories?.name || "Service"}
                          </span>
                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3 w-3 text-muted-foreground/50" />

                          <span className="font-mono text-[7px] text-muted-foreground">
                            {formatDate(invitation.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        {getStatusBadge(invitation.status)}
                      </td>

                      {/* ACTION */}

                      <td className="px-4 py-4 text-right">
                        {invitation.status === "Accepted" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                invitation.request_id,
                                invitation.id
                              )
                            }
                            disabled={
                              loadingId === invitation.id || isPending
                            }
                            className="
                              inline-flex h-8
                              min-w-[120px]
                              items-center
                              justify-center gap-2

                              border border-emerald-500/25
                              bg-emerald-500/[0.07]
                              px-3

                              text-[6px] font-bold
                              uppercase tracking-[0.13em]
                              text-emerald-500

                              transition-all

                              hover:border-emerald-500/40
                              hover:bg-emerald-500/[0.12]

                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {loadingId === invitation.id ? (
                              <>
                                <Clock3 className="h-3 w-3 animate-pulse" />
                                Finalizing...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3 w-3" />
                                Finalize Vendor
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex h-8 items-center gap-1.5 px-2 text-[6px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40">
                            <CircleDot className="h-2.5 w-2.5" />
                            No Action Required
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* =============================================================================
   METRIC BLOCK
============================================================================= */

function MetricBlock({
  number,
  label,
  value,
  description,
  icon,
  tone = "gold",
  last = false,
}: {
  number: string;
  label: string;
  value: number;
  description: string;
  icon: React.ReactElement;
  tone?: "gold" | "amber" | "indigo" | "emerald";
  last?: boolean;
}) {
  const tones = {
    gold: {
      text: "text-accent-gold",
      border: "border-accent-gold/15",
      bg: "bg-accent-gold/[0.03]",
    },

    amber: {
      text: "text-amber-500",
      border: "border-amber-500/15",
      bg: "bg-amber-500/[0.03]",
    },

    indigo: {
      text: "text-indigo-400",
      border: "border-indigo-500/15",
      bg: "bg-indigo-500/[0.03]",
    },

    emerald: {
      text: "text-emerald-500",
      border: "border-emerald-500/15",
      bg: "bg-emerald-500/[0.03]",
    },
  };

  const style = tones[tone];

  return (
    <div
      className={`
        relative flex
        min-h-[96px]
        items-center gap-3

        border-b border-r border-border
        p-4

        even:border-r-0

        lg:border-b-0
        lg:even:border-r

        ${last ? "lg:border-r-0" : ""}
      `}
    >
      <span className="absolute right-3 top-2 font-mono text-[6px] text-muted-foreground/25">
        {number}
      </span>

      <div
        className={`
          flex h-8 w-8
          shrink-0 items-center
          justify-center border

          ${style.border}
          ${style.bg}
          ${style.text}

          [&>svg]:h-3.5
          [&>svg]:w-3.5
        `}
      >
        {icon}
      </div>

      <div>
        <span
          className={`
            block text-xl
            font-normal

            ${tone === "gold"
              ? "text-foreground"
              : style.text
            }
          `}
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {value}
        </span>

        <span className="mt-0.5 block text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>

        <span className="mt-0.5 block text-[6px] text-muted-foreground/45">
          {description}
        </span>
      </div>
    </div>
  );
}

/* =============================================================================
   TABLE HEADER
============================================================================= */

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-4 py-3
        text-[6px] font-bold
        uppercase tracking-[0.17em]
        text-muted-foreground/60

        ${align === "right" ? "text-right" : "text-left"}
      `}
    >
      {children}
    </th>
  );
}