"use client";

import React, {
  useState,
  useTransition,
} from "react";

import {
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MessageSquareText,
  UserCheck,
  X,
  Eye,
  Phone,
  Mail,
  CalendarDays,
  ShieldCheck,
  Tag,
  Lock,
  Users,
  UserRound,
  Inbox,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Save,
  Loader2,
  CircleDot,
  Database,
  ExternalLink,
  Activity,
} from "lucide-react";

import { formatDate } from "@/lib/utils";
import { updateEnquiryStatus } from "./actions";

/* =============================================================================
   TYPES
============================================================================= */

interface GuestEnquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_description: string;
  status: "new" | "in_progress" | "resolved";
  linked_user_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;

  profiles?: {
    full_name: string;
    role: string;
    email: string;
  } | null;
}

interface EnquiriesClientProps {
  initialEnquiries: GuestEnquiry[];
  tableMissing?: boolean;
}

/* =============================================================================
   COMPONENT
============================================================================= */

export default function EnquiriesClient({
  initialEnquiries,
  tableMissing,
}: EnquiriesClientProps) {
  const [enquiries, setEnquiries] =
    useState<GuestEnquiry[]>(
      initialEnquiries
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      | "all"
      | "new"
      | "in_progress"
      | "resolved"
    >("all");

  const [
    selectedEnquiry,
    setSelectedEnquiry,
  ] = useState<GuestEnquiry | null>(
    null
  );

  const [notesText, setNotesText] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<
    "new" | "in_progress" | "resolved"
  >("new");

  const [
    showResolveConfirmModal,
    setShowResolveConfirmModal,
  ] = useState(false);

  const [isPending, startTransition] =
    useTransition();

  const [
    actionMessage,
    setActionMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ==========================================================================
     FILTERING
  ========================================================================== */

  const filteredEnquiries =
    enquiries.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      const query = searchQuery
        .toLowerCase()
        .trim();

      const matchesSearch =
        !query ||
        item.full_name
          .toLowerCase()
          .includes(query) ||
        item.email
          .toLowerCase()
          .includes(query) ||
        item.phone
          .toLowerCase()
          .includes(query) ||
        item.event_type
          .toLowerCase()
          .includes(query);

      return (
        matchesStatus && matchesSearch
      );
    });

  /* ==========================================================================
     METRICS
  ========================================================================== */

  const totalCount = enquiries.length;

  const newCount = enquiries.filter(
    (e) => e.status === "new"
  ).length;

  const inProgressCount =
    enquiries.filter(
      (e) =>
        e.status === "in_progress"
    ).length;

  const resolvedCount =
    enquiries.filter(
      (e) => e.status === "resolved"
    ).length;

  /* ==========================================================================
     OPERATIONS
  ========================================================================== */

  const handleOpenDetail = (
    enquiry: GuestEnquiry
  ) => {
    setSelectedEnquiry(enquiry);

    setSelectedStatus(
      enquiry.status
    );

    setNotesText(
      enquiry.admin_notes || ""
    );

    setActionMessage(null);
  };

  const handleUpdateWithStatus = (
    targetStatus:
      | "new"
      | "in_progress"
      | "resolved"
  ) => {
    if (!selectedEnquiry) return;

    setActionMessage(null);

    startTransition(async () => {
      const res =
        await updateEnquiryStatus(
          selectedEnquiry.id,
          targetStatus,
          notesText
        );

      if (res.success) {
        setActionMessage({
          type: "success",
          text:
            res.message ||
            "Enquiry updated successfully.",
        });

        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === selectedEnquiry.id
              ? {
                ...e,
                status: targetStatus,
                admin_notes:
                  notesText,

                resolved_at:
                  targetStatus ===
                    "resolved"
                    ? e.resolved_at ||
                    new Date().toISOString()
                    : null,
              }
              : e
          )
        );

        setSelectedEnquiry(
          (prev) =>
            prev
              ? {
                ...prev,
                status:
                  targetStatus,
                admin_notes:
                  notesText,

                resolved_at:
                  targetStatus ===
                    "resolved"
                    ? prev.resolved_at ||
                    new Date().toISOString()
                    : null,
              }
              : null
        );
      } else {
        setActionMessage({
          type: "error",
          text:
            res.error ||
            "Failed to update enquiry.",
        });
      }
    });
  };

  const handleSaveClick = () => {
    if (!selectedEnquiry) return;

    // If attempting to resolve from
    // new/in_progress, prompt for confirmation
    if (
      selectedStatus === "resolved" &&
      selectedEnquiry.status !==
      "resolved"
    ) {
      setShowResolveConfirmModal(
        true
      );
    } else {
      handleUpdateWithStatus(
        selectedStatus
      );
    }
  };

  const handleStatusButtonClick = (
    targetStatus:
      | "new"
      | "in_progress"
      | "resolved"
  ) => {
    if (!selectedEnquiry) return;

    // If enquiry is already resolved,
    // prevent changing to new/in_progress
    if (
      selectedEnquiry.status ===
      "resolved" &&
      targetStatus !== "resolved"
    ) {
      return;
    }

    if (
      targetStatus === "resolved" &&
      selectedEnquiry.status !==
      "resolved"
    ) {
      setShowResolveConfirmModal(
        true
      );
    } else {
      setSelectedStatus(
        targetStatus
      );
    }
  };

  /* ==========================================================================
     STATUS BADGE
  ========================================================================== */

  const getStatusBadge = (
    status: string
  ) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/[0.06] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.15em] text-amber-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-30" />

              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>

            New
          </span>
        );

      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 border border-indigo-500/20 bg-indigo-500/[0.06] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.15em] text-indigo-400">
            <Clock3 className="h-2.5 w-2.5" />
            In Progress
          </span>
        );

      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.15em] text-emerald-500">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Resolved
          </span>
        );

      default:
        return null;
    }
  };

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full space-y-5 pb-10 animate-fade-in-up">
      {/* =====================================================================
          HEADER
      ===================================================================== */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                Customer Operations / Intake
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              Guest Enquiries
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Review incoming event
              consultations, coordinate
              follow-ups, and manage each
              enquiry through its operational
              lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border bg-surface/30 px-3 py-2">
              <span
                className={`
                  h-1.5 w-1.5 rounded-full

                  ${newCount > 0
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                  }
                `}
              />

              <span className="text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {newCount > 0
                  ? `${newCount} Awaiting Review`
                  : "Queue Clear"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          TABLE MISSING WARNING
      ===================================================================== */}

      {tableMissing && (
        <div className="relative overflow-hidden border border-amber-500/25 bg-amber-500/[0.04] p-4">
          <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-amber-500" />

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/20 bg-amber-500/[0.06] text-amber-500">
              <Database className="h-3.5 w-3.5" />
            </div>

            <div>
              <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-amber-500">
                Database Setup Required
              </span>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                The{" "}
                <code className="text-foreground">
                  guest_enquiries
                </code>{" "}
                table has not been executed
                in your Supabase project.
                Execute{" "}
                <strong className="font-semibold text-foreground">
                  migration_guest_enquiries.sql
                </strong>{" "}
                in the Supabase SQL Editor
                to enable persistent
                records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          OPERATIONS METRICS
      ===================================================================== */}

      <section className="grid grid-cols-2 overflow-hidden border border-border bg-surface/30 lg:grid-cols-4">
        <MetricBlock
          number="01"
          label="Total Enquiries"
          value={totalCount}
          icon={<Inbox />}
          description="All submissions"
        />

        <MetricBlock
          number="02"
          label="Needs Attention"
          value={newCount}
          icon={<AlertCircle />}
          description="Awaiting review"
          tone="amber"
        />

        <MetricBlock
          number="03"
          label="In Progress"
          value={inProgressCount}
          icon={<Clock3 />}
          description="Under follow-up"
          tone="indigo"
        />

        <MetricBlock
          number="04"
          label="Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 />}
          description="Completed enquiries"
          tone="emerald"
          last
        />
      </section>

      {/* =====================================================================
          ENQUIRY WORKSPACE
      ===================================================================== */}

      <section className="overflow-hidden border border-border bg-surface/25">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-border bg-background/10 p-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* STATUS FILTER */}

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <div className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center border border-border text-muted-foreground">
              <SlidersHorizontal className="h-3 w-3" />
            </div>

            {(
              [
                "all",
                "new",
                "in_progress",
                "resolved",
              ] as const
            ).map((tab) => {
              const count =
                tab === "all"
                  ? totalCount
                  : tab === "new"
                    ? newCount
                    : tab ===
                      "in_progress"
                      ? inProgressCount
                      : resolvedCount;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setStatusFilter(tab)
                  }
                  className={`
                    flex h-7 shrink-0
                    items-center gap-2
                    border px-3

                    text-[6px] font-bold
                    uppercase tracking-[0.14em]

                    transition-all

                    ${statusFilter === tab
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
                  {tab === "all"
                    ? "All"
                    : tab ===
                      "in_progress"
                      ? "In Progress"
                      : tab}

                  <span
                    className={`
                      font-mono text-[6px]

                      ${statusFilter === tab
                        ? "text-accent-gold/60"
                        : "text-muted-foreground/40"
                      }
                    `}
                  >
                    {String(count).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60" />

            <input
              type="text"
              placeholder="Search visitor, email, phone, event..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="
                h-8 w-full
                border border-border
                bg-background/40
                pl-8 pr-8

                text-[8px]
                text-foreground

                outline-none

                transition-colors

                placeholder:text-muted-foreground/40

                focus:border-accent-gold/40
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* RESULTS META */}

        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
            Enquiry Registry
          </span>

          <span className="font-mono text-[6px] text-muted-foreground/45">
            {filteredEnquiries.length} /{" "}
            {totalCount} RECORDS
          </span>
        </div>

        {/* TABLE */}

        {filteredEnquiries.length ===
          0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-background/30 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>

            <h3
              className="mt-4 text-base font-normal text-foreground"
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              No enquiries found
            </h3>

            <p className="mt-1 max-w-[280px] text-[7px] leading-4 text-muted-foreground">
              No guest enquiries match
              the current search and
              lifecycle filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-background/20">
                  <TableHeader>
                    Visitor
                  </TableHeader>

                  <TableHeader>
                    Event Interest
                  </TableHeader>

                  <TableHeader>
                    Received
                  </TableHeader>

                  <TableHeader>
                    Association
                  </TableHeader>

                  <TableHeader>
                    Lifecycle
                  </TableHeader>

                  <TableHeader align="right">
                    Operations
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredEnquiries.map(
                  (
                    enquiry,
                    index
                  ) => (
                    <tr
                      key={enquiry.id}
                      className="
                        group
                        border-b border-border/50

                        transition-colors

                        last:border-b-0

                        hover:bg-accent-gold/[0.018]
                      "
                    >
                      {/* VISITOR */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background/30 text-[8px] font-semibold uppercase text-muted-foreground transition-colors group-hover:border-accent-gold/20 group-hover:text-accent-gold">
                            {enquiry.full_name
                              ?.substring(
                                0,
                                2
                              )
                              .toUpperCase() ||
                              "GE"}
                          </div>

                          <div className="min-w-0">
                            <span className="block truncate text-[9px] font-semibold text-foreground">
                              {
                                enquiry.full_name
                              }
                            </span>

                            <span className="mt-0.5 block max-w-[190px] truncate font-mono text-[6px] text-muted-foreground">
                              {enquiry.email}
                            </span>

                            <span className="mt-0.5 block font-mono text-[6px] text-muted-foreground/60">
                              {enquiry.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EVENT */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 shrink-0 text-accent-gold" />

                          <span className="max-w-[170px] truncate text-[8px] font-semibold text-foreground">
                            {
                              enquiry.event_type
                            }
                          </span>
                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3 w-3 text-muted-foreground/50" />

                          <span className="font-mono text-[7px] text-muted-foreground">
                            {formatDate(
                              enquiry.created_at
                            )}
                          </span>
                        </div>
                      </td>

                      {/* ASSOCIATION */}

                      <td className="px-4 py-4">
                        {enquiry.linked_user_id ? (
                          <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/[0.04] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.12em] text-emerald-500">
                            <UserCheck className="h-2.5 w-2.5" />
                            Linked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 border border-border bg-background/30 px-2 py-1 text-[6px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            <UserRound className="h-2.5 w-2.5" />
                            Guest
                          </span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        {getStatusBadge(
                          enquiry.status
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDetail(
                              enquiry
                            )
                          }
                          className="
                            inline-flex h-8
                            items-center
                            gap-2

                            border border-border
                            bg-background/20
                            px-3

                            text-[6px] font-bold
                            uppercase tracking-[0.13em]
                            text-muted-foreground

                            transition-all

                            hover:border-accent-gold/30
                            hover:bg-accent-gold/[0.05]
                            hover:text-accent-gold
                          "
                        >
                          <Eye className="h-3 w-3" />

                          Review

                          <ChevronRight className="h-2.5 w-2.5 opacity-40" />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================================
          ENQUIRY DETAIL DRAWER
      ===================================================================== */}

      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-[99999] flex items-stretch justify-end overflow-hidden bg-black/70 backdrop-blur-[3px]"
          onClick={() =>
            setSelectedEnquiry(null)
          }
        >
          <aside
            className="flex h-[100dvh] min-h-0 w-full max-w-[600px] flex-col overflow-hidden border-l border-border bg-surface shadow-2xl animate-slide-in-right sm:w-[min(600px,92vw)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* DRAWER HEADER */}

            <header className="relative shrink-0 border-b border-border bg-surface">
              <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-accent-gold" />

              <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
                    <MessageSquareText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-[6px] font-bold uppercase tracking-[0.2em] text-accent-gold">
                      Enquiry Operations
                    </span>

                    <h2
                      className="mt-1 truncate text-xl font-normal text-foreground"
                      style={{
                        fontFamily:
                          '"Playfair Display", serif',
                      }}
                    >
                      {
                        selectedEnquiry.full_name
                      }
                    </h2>

                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(
                        selectedEnquiry.status
                      )}

                      <span className="font-mono text-[6px] text-muted-foreground/50">
                        ID{" "}
                        {selectedEnquiry.id
                          .slice(0, 8)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedEnquiry(
                      null
                    )
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500/20 hover:bg-red-500/[0.04] hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {/* DRAWER BODY */}

            <div className="min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain p-4 pb-6 scrollbar-thin sm:p-6 sm:pb-8">
              {/* ACTION MESSAGE */}

              {actionMessage && (
                <div
                  className={`
                    flex items-start gap-2.5
                    border p-3.5

                    text-[8px] font-medium
                    leading-4

                    ${actionMessage.type ===
                      "success"
                      ? `
                          border-emerald-500/20
                          bg-emerald-500/[0.04]
                          text-emerald-500
                        `
                      : `
                          border-red-500/20
                          bg-red-500/[0.04]
                          text-red-500
                        `
                    }
                  `}
                >
                  {actionMessage.type ===
                    "success" ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}

                  {actionMessage.text}
                </div>
              )}

              {/* RESOLVED LOCK */}

              {selectedEnquiry.status ===
                "resolved" && (
                  <div className="relative overflow-hidden border border-emerald-500/20 bg-emerald-500/[0.035] p-3.5">
                    <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-emerald-500" />

                    <div className="flex items-start gap-2.5">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />

                      <div>
                        <span className="block text-[7px] font-bold uppercase tracking-[0.14em] text-emerald-500">
                          Lifecycle Finalized
                        </span>

                        <p className="mt-1 text-[7px] leading-4 text-muted-foreground">
                          This enquiry has been
                          marked as Resolved.
                          Its lifecycle status
                          cannot be reverted to
                          New or In Progress.
                          Internal notes may
                          still be updated.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* CONTACT / EVENT INFORMATION */}

              <DrawerSection
                number="01"
                title="Contact & Event"
                description="Customer submission details"
              >
                <div className="grid grid-cols-1 border border-border sm:grid-cols-2">
                  <InformationCell
                    icon={<Mail />}
                    label="Email Address"
                  >
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="flex items-center gap-1.5 truncate text-[8px] font-medium text-accent-gold hover:underline"
                    >
                      <span className="truncate">
                        {
                          selectedEnquiry.email
                        }
                      </span>

                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  </InformationCell>

                  <InformationCell
                    icon={<Phone />}
                    label="Phone Number"
                  >
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-[8px] font-medium text-foreground hover:text-accent-gold"
                    >
                      {
                        selectedEnquiry.phone
                      }
                    </a>
                  </InformationCell>

                  <InformationCell
                    icon={<Tag />}
                    label="Event Type"
                  >
                    <span className="text-[8px] font-semibold text-foreground">
                      {
                        selectedEnquiry.event_type
                      }
                    </span>
                  </InformationCell>

                  <InformationCell
                    icon={
                      <CalendarDays />
                    }
                    label="Submitted"
                  >
                    <span className="font-mono text-[7px] text-muted-foreground">
                      {formatDate(
                        selectedEnquiry.created_at
                      )}
                    </span>
                  </InformationCell>
                </div>
              </DrawerSection>

              {/* ACCOUNT ASSOCIATION */}

              <DrawerSection
                number="02"
                title="Account Association"
                description="Customer identity relationship"
              >
                <div className="flex items-center justify-between gap-4 border border-border bg-background/25 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`
                        flex h-8 w-8
                        shrink-0 items-center
                        justify-center border

                        ${selectedEnquiry.linked_user_id
                          ? `
                              border-emerald-500/20
                              bg-emerald-500/[0.04]
                              text-emerald-500
                            `
                          : `
                              border-border
                              text-muted-foreground
                            `
                        }
                      `}
                    >
                      {selectedEnquiry.linked_user_id ? (
                        <UserCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Users className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[8px] font-semibold text-foreground">
                        {selectedEnquiry.linked_user_id
                          ? "Registered Customer"
                          : "Guest Visitor"}
                      </span>

                      <span className="mt-0.5 block text-[6px] text-muted-foreground">
                        {selectedEnquiry.linked_user_id
                          ? "Associated with registered account"
                          : "Unlinked guest submission"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`
                      shrink-0 border
                      px-2 py-1

                      text-[6px] font-bold
                      uppercase tracking-[0.13em]

                      ${selectedEnquiry.linked_user_id
                        ? `
                            border-emerald-500/20
                            bg-emerald-500/[0.04]
                            text-emerald-500
                          `
                        : `
                            border-border
                            bg-background/30
                            text-muted-foreground
                          `
                      }
                    `}
                  >
                    {selectedEnquiry.linked_user_id
                      ? "Linked"
                      : "Unlinked"}
                  </span>
                </div>
              </DrawerSection>

              {/* CUSTOMER REQUEST */}

              <DrawerSection
                number="03"
                title="Customer Request"
                description="Event requirement submitted by visitor"
              >
                <div className="relative border border-border bg-background/30 p-4">
                  <FileText className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/20" />

                  <p className="whitespace-pre-wrap pr-5 text-[8px] leading-[1.7] text-foreground/85">
                    {
                      selectedEnquiry.event_description
                    }
                  </p>
                </div>
              </DrawerSection>

              {/* LIFECYCLE */}

              <DrawerSection
                number="04"
                title="Lifecycle Status"
                description="Manage enquiry progression"
              >
                <div className="grid grid-cols-3 border border-border">
                  {(
                    [
                      "new",
                      "in_progress",
                      "resolved",
                    ] as const
                  ).map((st) => {
                    const isLocked =
                      selectedEnquiry.status ===
                      "resolved" &&
                      st !== "resolved";

                    const selected =
                      selectedStatus ===
                      st;

                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={
                          isLocked
                        }
                        onClick={() =>
                          handleStatusButtonClick(
                            st
                          )
                        }
                        className={`
                          relative flex
                          min-h-[66px]
                          flex-col items-center
                          justify-center gap-1.5

                          border-r border-border
                          px-2

                          transition-colors

                          last:border-r-0

                          ${isLocked
                            ? `
                                cursor-not-allowed
                                bg-background/20
                                opacity-35
                              `
                            : "cursor-pointer"
                          }

                          ${selected
                            ? st ===
                              "new"
                              ? `
                                  bg-amber-500/[0.07]
                                  text-amber-500
                                `
                              : st ===
                                "in_progress"
                                ? `
                                  bg-indigo-500/[0.07]
                                  text-indigo-400
                                `
                                : `
                                  bg-emerald-500/[0.07]
                                  text-emerald-500
                                `
                            : `
                                text-muted-foreground

                                hover:bg-background/40
                                hover:text-foreground
                              `
                          }
                        `}
                      >
                        {selected && (
                          <span
                            className={`
                              absolute left-0 right-0 top-0 h-[2px]

                              ${st ===
                                "new"
                                ? "bg-amber-500"
                                : st ===
                                  "in_progress"
                                  ? "bg-indigo-500"
                                  : "bg-emerald-500"
                              }
                            `}
                          />
                        )}

                        {isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : st ===
                          "new" ? (
                          <CircleDot className="h-3 w-3" />
                        ) : st ===
                          "in_progress" ? (
                          <Clock3 className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}

                        <span className="text-[6px] font-bold uppercase tracking-[0.12em]">
                          {st ===
                            "in_progress"
                            ? "In Progress"
                            : st}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedEnquiry.resolved_at && (
                  <div className="mt-2.5 flex items-center justify-between border border-emerald-500/15 bg-emerald-500/[0.025] px-3 py-2.5">
                    <span className="text-[7px] text-emerald-500">
                      Resolved on{" "}
                      {formatDate(
                        selectedEnquiry.resolved_at
                      )}
                    </span>

                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                )}
              </DrawerSection>

              {/* ADMIN NOTES */}

              <DrawerSection
                number="05"
                title="Internal Notes"
                description="Private operations record • Admin only"
              >
                <textarea
                  rows={5}
                  value={notesText}
                  onChange={(e) =>
                    setNotesText(
                      e.target.value
                    )
                  }
                  placeholder="Record customer phone calls, pricing discussions, follow-up details, or internal notes..."
                  className="
                    w-full resize-none
                    border border-border
                    bg-background/30
                    p-3.5

                    text-[8px]
                    leading-5
                    text-foreground

                    outline-none

                    transition-colors

                    placeholder:text-muted-foreground/40

                    focus:border-accent-gold/40
                  "
                />
              </DrawerSection>
            </div>

            {/* DRAWER FOOTER */}

            <footer className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <span className="hidden text-[6px] font-medium uppercase tracking-[0.14em] text-muted-foreground/40 sm:block">
                Admin Operations
              </span>

              <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEnquiry(
                      null
                    )
                  }
                  className="h-9 flex-1 border border-border px-4 text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-background/40 hover:text-foreground sm:flex-none"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={
                    handleSaveClick
                  }
                  className="
                    inline-flex h-9
                    min-w-0 flex-1 sm:min-w-[130px] sm:flex-none
                    items-center
                    justify-center
                    gap-2

                    bg-accent-gold
                    px-4

                    text-[7px] font-bold
                    uppercase tracking-[0.12em]
                    text-black

                    transition-all

                    hover:brightness-110

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />

                      {selectedEnquiry.status ===
                        "resolved"
                        ? "Save Notes"
                        : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}

      {/* =====================================================================
          RESOLUTION CONFIRMATION
      ===================================================================== */}

      {showResolveConfirmModal &&
        selectedEnquiry && (
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-[4px]"
            onClick={() =>
              setShowResolveConfirmModal(
                false
              )
            }
          >
            <div
              className="w-full max-w-[430px] overflow-hidden border border-border bg-surface shadow-2xl animate-scale-in"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* HEADER */}

              <div className="relative border-b border-border px-6 py-6 text-center">
                <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-emerald-500" />

                <div className="mx-auto flex h-11 w-11 items-center justify-center border border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <span className="mt-4 block text-[6px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                  Lifecycle Completion
                </span>

                <h3
                  className="mt-1 text-xl font-normal text-foreground"
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  Resolve Enquiry?
                </h3>

                <p className="mx-auto mt-2 max-w-[330px] text-[8px] leading-4 text-muted-foreground">
                  You are marking the
                  enquiry from{" "}
                  <strong className="font-semibold text-foreground">
                    {
                      selectedEnquiry.full_name
                    }
                  </strong>{" "}
                  as resolved.
                </p>
              </div>

              {/* WARNING */}

              <div className="px-6 py-5">
                <div className="flex items-start gap-2.5 border border-amber-500/20 bg-amber-500/[0.04] p-3.5">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                  <p className="text-[7px] leading-4 text-muted-foreground">
                    Once resolved, this
                    enquiry cannot be moved
                    back to{" "}
                    <strong className="font-semibold text-foreground">
                      New
                    </strong>{" "}
                    or{" "}
                    <strong className="font-semibold text-foreground">
                      In Progress
                    </strong>
                    . Internal notes will
                    remain editable.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-2 border-t border-border bg-background/15 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowResolveConfirmModal(
                      false
                    )
                  }
                  className="h-9 border border-border px-4 text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-background/40 hover:text-foreground"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setShowResolveConfirmModal(
                      false
                    );

                    setSelectedStatus(
                      "resolved"
                    );

                    handleUpdateWithStatus(
                      "resolved"
                    );
                  }}
                  className="
                    inline-flex h-9
                    items-center
                    justify-center
                    gap-2

                    bg-emerald-500
                    px-5

                    text-[7px] font-bold
                    uppercase tracking-[0.12em]
                    text-black

                    transition-colors

                    hover:bg-emerald-400

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3 w-3" />
                      Confirm Resolution
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

/* =============================================================================
   METRIC
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
  tone?:
  | "gold"
  | "amber"
  | "indigo"
  | "emerald";
  last?: boolean;
}) {
  const tones = {
    gold: {
      text: "text-accent-gold",
      border:
        "border-accent-gold/15",
      bg: "bg-accent-gold/[0.03]",
    },

    amber: {
      text: "text-amber-500",
      border:
        "border-amber-500/15",
      bg: "bg-amber-500/[0.03]",
    },

    indigo: {
      text: "text-indigo-400",
      border:
        "border-indigo-500/15",
      bg: "bg-indigo-500/[0.03]",
    },

    emerald: {
      text: "text-emerald-500",
      border:
        "border-emerald-500/15",
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

        ${last
          ? "lg:border-r-0"
          : ""
        }
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
            fontFamily:
              '"Playfair Display", serif',
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

        ${align === "right"
          ? "text-right"
          : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}

/* =============================================================================
   DRAWER SECTION
============================================================================= */

function DrawerSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[6px] text-accent-gold/60">
              {number}
            </span>

            <h3 className="text-[7px] font-bold uppercase tracking-[0.16em] text-foreground">
              {title}
            </h3>
          </div>

          {description && (
            <p className="mt-0.5 pl-[22px] text-[6px] text-muted-foreground/50">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* =============================================================================
   INFORMATION CELL
============================================================================= */

function InformationCell({
  icon,
  label,
  children,
}: {
  icon: React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-border p-3.5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className="
            text-accent-gold

            [&>svg]:h-2.5
            [&>svg]:w-2.5
          "
        >
          {icon}
        </span>

        <span className="text-[5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}