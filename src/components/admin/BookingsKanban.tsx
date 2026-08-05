"use client";

import React, {
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { updateRequestStatus } from "@/app/admin/bookings/actions";
import {
  GitBranch,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Search,
  IndianRupee,
  GripVertical,
  Activity,
  CircleDot,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Profile {
  full_name: string;
  email: string;
  phone_number: string;
}

interface RequestItem {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  status: string;
  total_budget: number;
  profiles: Profile | null;
}

interface BookingsKanbanProps {
  initialRequests: RequestItem[];
}

interface Column {
  id: string;
  title: string;
  statuses: string[];
  color: string;
}

/* ============================================================================
   PIPELINE CONFIGURATION

   Status mappings are intentionally unchanged.
============================================================================ */

const columns: Column[] = [
  {
    id: "submitted",
    title: "Submitted",
    statuses: [
      "Request Submitted",
      "Submitted",
    ],
    color: "border-blue-500 text-blue-500",
  },
  {
    id: "review",
    title: "Under Review",
    statuses: [
      "Under Admin Review",
      "Under Review",
    ],
    color: "border-amber-500 text-amber-500",
  },
  {
    id: "planning",
    title: "Planning",
    statuses: ["Planning"],
    color: "border-yellow-500 text-yellow-500",
  },
  {
    id: "matching",
    title: "Vendor Selection",
    statuses: [
      "Vendor Selection In Progress",
      "Sent to Vendors",
      "Vendor Selection",
    ],
    color:
      "border-accent-gold text-accent-gold",
  },
  {
    id: "finalized",
    title: "Vendor Finalized",
    statuses: [
      "Vendor Accepted",
      "Vendor Approved by Admin",
      "Customer Confirmation Pending",
      "Confirmed",
      "Vendor Finalized",
      "Ready For Execution",
    ],
    color: "border-pink-500 text-pink-500",
  },
  {
    id: "om_assigned",
    title: "Operational Manager Assigned",
    statuses: [
      "Operational Manager Assigned",
    ],
    color: "border-cyan-500 text-cyan-500",
  },
  {
    id: "preparation",
    title: "Preparation",
    statuses: ["Preparation"],
    color:
      "border-emerald-500 text-emerald-500",
  },
  {
    id: "execution",
    title: "Execution",
    statuses: ["Execution"],
    color:
      "border-indigo-500 text-indigo-500",
  },
  {
    id: "completed",
    title: "Completed",
    statuses: ["Completed"],
    color:
      "border-green-500 text-green-500",
  },
  {
    id: "closed",
    title: "Closed",
    statuses: ["Closed"],
    color: "border-teal-500 text-teal-500",
  },
  {
    id: "cancelled",
    title: "Cancelled",
    statuses: ["Cancelled"],
    color: "border-red-500 text-red-500",
  },
];

export default function BookingsKanban({
  initialRequests,
}: BookingsKanbanProps) {
  const [requests, setRequests] =
    useState<RequestItem[]>(initialRequests);

  const [filterQuery, setFilterQuery] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  /* ==========================================================================
     STATUS UPDATE

     Optimistic behavior + rollback unchanged.
  ========================================================================== */

  const handleStatusUpdate = (
    requestId: string,
    nextStatus: string
  ) => {
    const previous = [...requests];

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
            ...r,
            status: nextStatus,
          }
          : r
      )
    );

    startTransition(async () => {
      try {
        await updateRequestStatus(
          requestId,
          nextStatus
        );
      } catch (err) {
        console.error(
          "Failed to update status:",
          err
        );

        setRequests(previous);

        alert(
          "Failed to update request status."
        );
      }
    });
  };

  /* ==========================================================================
     DRAG & DROP
  ========================================================================== */

  const onDragStart = (
    e: React.DragEvent,
    id: string
  ) => {
    setDraggedId(id);

    e.dataTransfer.setData(
      "text/plain",
      id
    );

    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
  };

  const onDrop = (
    e: React.DragEvent,
    columnId: string
  ) => {
    e.preventDefault();

    const id =
      e.dataTransfer.getData("text/plain") ||
      draggedId;

    if (!id) return;

    const column = columns.find(
      (c) => c.id === columnId
    );

    if (!column) return;

    const nextStatus = column.statuses[0];

    const item = requests.find(
      (r) => r.id === id
    );

    if (
      item &&
      item.status !== nextStatus
    ) {
      handleStatusUpdate(
        id,
        nextStatus
      );
    }

    setDraggedId(null);
  };

  /* ==========================================================================
     FILTER
  ========================================================================== */

  const filteredRequests =
    requests.filter((r) => {
      const query =
        filterQuery.toLowerCase();

      return (
        r.event_type
          .toLowerCase()
          .includes(query) ||
        (r.profiles?.full_name || "")
          .toLowerCase()
          .includes(query) ||
        r.location
          .toLowerCase()
          .includes(query)
      );
    });

  return (
    <div className="space-y-5">
      {/* ================================================================
          PIPELINE COMMAND BAR
      ================================================================ */}

      <section className="border border-border bg-surface/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}

          <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:border-b-0">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
              <GitBranch className="h-3.5 w-3.5" />
            </div>

            <div>
              <span className="block text-[6px] font-bold uppercase tracking-[0.22em] text-accent-gold">
                Operations Pipeline
              </span>

              <span className="mt-0.5 block text-[9px] font-semibold text-foreground">
                Event Case Workflow
              </span>
            </div>
          </div>

          {/* CONTROLS */}

          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            {isPending && (
              <div className="flex items-center gap-2 px-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-gold opacity-40" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-gold" />
                </span>

                <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-accent-gold">
                  Saving Pipeline Changes
                </span>
              </div>
            )}

            {/* SEARCH */}

            <div className="relative w-full sm:w-[330px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search client, event or location..."
                value={filterQuery}
                onChange={(e) =>
                  setFilterQuery(
                    e.target.value
                  )
                }
                className="
                  h-9 w-full
                  border border-border
                  bg-background/50
                  pl-9 pr-9
                  text-[8px]
                  text-foreground
                  outline-none
                  transition-all

                  placeholder:text-muted-foreground/60

                  hover:border-accent-gold/30

                  focus:border-accent-gold/50
                  focus:ring-1
                  focus:ring-accent-gold/10
                "
              />

              {filterQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setFilterQuery("")
                  }
                  className="
                    absolute right-2
                    top-1/2
                    flex h-6 w-6
                    -translate-y-1/2
                    items-center
                    justify-center

                    text-muted-foreground

                    hover:text-foreground
                  "
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* RESULT COUNT */}

            <div className="hidden border-l border-border px-3 sm:block">
              <span className="block text-[6px] font-bold uppercase tracking-[0.17em] text-muted-foreground/50">
                Cases
              </span>

              <span className="mt-0.5 block text-[9px] font-semibold text-foreground">
                {filteredRequests.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          PIPELINE LEGEND
      ================================================================ */}

      <div className="flex items-center justify-between gap-4 overflow-hidden border-y border-border py-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-accent-gold" />

          <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Live Workflow
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <GripVertical className="h-3 w-3 text-muted-foreground/40" />

          <span className="text-[6px] font-medium uppercase tracking-[0.14em] text-muted-foreground/50">
            Drag cases between stages to update status
          </span>
        </div>
      </div>

      {/* ================================================================
          KANBAN BOARD
      ================================================================ */}

      <div
        className="
          flex min-h-[65vh]
          select-none gap-3
          overflow-x-auto
          pb-5
          scrollbar-thin
        "
      >
        {columns.map(
          (column, columnIndex) => {
            const colRequests =
              filteredRequests.filter(
                (r) =>
                  column.statuses.includes(
                    r.status
                  )
              );

            return (
              <section
                key={column.id}
                onDragOver={onDragOver}
                onDrop={(e) =>
                  onDrop(e, column.id)
                }
                className="
                  flex max-h-[72vh]
                  w-[286px]
                  shrink-0 flex-col

                  border border-border
                  bg-surface/30

                  transition-colors

                  hover:border-border/90
                "
              >
                {/* ======================================================
                    COLUMN HEADER
                ====================================================== */}

                <header
                  className={`
                    relative
                    border-b border-border
                    border-t-2
                    bg-background/20
                    px-4 py-3.5

                    ${column.color}
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="font-mono text-[6px] font-bold text-muted-foreground/40">
                          {String(
                            columnIndex + 1
                          ).padStart(2, "0")}
                        </span>

                        <CircleDot className="h-2.5 w-2.5" />
                      </div>

                      <h3 className="truncate text-[8px] font-bold uppercase tracking-[0.16em]">
                        {column.title}
                      </h3>
                    </div>

                    <div
                      className="
                        flex h-7 min-w-7
                        items-center justify-center
                        border border-border
                        bg-surface
                        px-2
                        font-mono
                        text-[8px] font-semibold
                        text-foreground
                      "
                    >
                      {colRequests.length}
                    </div>
                  </div>
                </header>

                {/* ======================================================
                    COLUMN BODY
                ====================================================== */}

                <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 scrollbar-none">
                  {colRequests.length ===
                    0 ? (
                    <div
                      className="
                        flex min-h-[120px]
                        flex-col items-center
                        justify-center
                        border border-dashed
                        border-border/70
                        bg-background/[0.08]
                        px-4 text-center
                      "
                    >
                      <CircleDot className="h-3.5 w-3.5 text-muted-foreground/30" />

                      <span className="mt-2 text-[7px] font-medium text-muted-foreground/50">
                        No cases in this stage
                      </span>
                    </div>
                  ) : (
                    colRequests.map((req) => {
                      const currentIndex =
                        columns.indexOf(
                          column
                        );

                      const isDragging =
                        draggedId === req.id;

                      return (
                        <article
                          key={req.id}
                          draggable
                          onDragStart={(e) =>
                            onDragStart(
                              e,
                              req.id
                            )
                          }
                          className={`
                            group relative
                            border bg-background
                            transition-all
                            duration-200

                            ${isDragging
                              ? `
                                  cursor-grabbing
                                  border-accent-gold
                                  opacity-40
                                  shadow-lg
                                `
                              : `
                                  cursor-grab
                                  border-border
                                  hover:-translate-y-[1px]
                                  hover:border-accent-gold/30
                                  hover:shadow-md
                                `
                            }
                          `}
                        >
                          {/* GOLD HOVER RAIL */}

                          <span
                            className="
                              absolute left-0
                              top-0 h-full
                              w-[2px]
                              origin-top
                              scale-y-0
                              bg-accent-gold
                              transition-transform
                              duration-200

                              group-hover:scale-y-100
                            "
                          />

                          {/* MOVE CONTROLS */}

                          <div
                            className="
                              absolute right-2
                              top-2 z-10
                              flex items-center
                              border border-border
                              bg-surface/95
                              opacity-0
                              shadow-sm
                              backdrop-blur

                              transition-opacity

                              group-hover:opacity-100

                              max-md:opacity-100
                            "
                          >
                            {currentIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const prevCol =
                                    columns[
                                    currentIndex -
                                    1
                                    ];

                                  handleStatusUpdate(
                                    req.id,
                                    prevCol
                                      .statuses[0]
                                  );
                                }}
                                className="
                                  flex h-6 w-6
                                  items-center
                                  justify-center
                                  text-muted-foreground
                                  transition-colors

                                  hover:bg-accent-gold/[0.05]
                                  hover:text-accent-gold
                                "
                                title="Move Left"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}

                            {currentIndex <
                              columns.length -
                              1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextCol =
                                      columns[
                                      currentIndex +
                                      1
                                      ];

                                    handleStatusUpdate(
                                      req.id,
                                      nextCol
                                        .statuses[0]
                                    );
                                  }}
                                  className="
                                  flex h-6 w-6
                                  items-center
                                  justify-center
                                  border-l border-border
                                  text-muted-foreground
                                  transition-colors

                                  hover:bg-accent-gold/[0.05]
                                  hover:text-accent-gold
                                "
                                  title="Move Right"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                          </div>

                          {/* CARD HEADER */}

                          <div className="border-b border-border/60 px-4 py-3.5">
                            <div className="flex items-start gap-2">
                              <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/25 transition-colors group-hover:text-accent-gold/60" />

                              <div className="min-w-0 pr-10">
                                <span className="block truncate text-[6px] font-bold uppercase tracking-[0.18em] text-accent-gold">
                                  {req.event_type}
                                </span>

                                <h4 className="mt-1.5 truncate text-[10px] font-semibold text-foreground">
                                  {req.profiles
                                    ?.full_name ||
                                    "Unknown Client"}
                                </h4>
                              </div>
                            </div>
                          </div>

                          {/* CASE DETAILS */}

                          <div className="space-y-2.5 px-4 py-3">
                            <CaseMeta
                              icon={
                                <Calendar />
                              }
                            >
                              {formatDate(
                                req.event_date
                              )}
                            </CaseMeta>

                            <CaseMeta
                              icon={<MapPin />}
                            >
                              <span className="block max-w-[190px] truncate">
                                {req.location}
                              </span>
                            </CaseMeta>

                            <CaseMeta
                              icon={<Users />}
                            >
                              {req.guest_count}{" "}
                              guests
                            </CaseMeta>
                          </div>

                          {/* BUDGET + MANAGE */}

                          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
                            <div>
                              <span className="block text-[5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/45">
                                Budget
                              </span>

                              <div className="mt-1 flex items-center text-[10px] font-semibold text-foreground">
                                <IndianRupee className="h-2.5 w-2.5" />

                                <span>
                                  {Number(
                                    req.total_budget
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/admin/bookings/${req.id}`}
                              className="
                                group/link flex
                                items-center gap-1.5

                                text-[7px] font-bold
                                uppercase
                                tracking-[0.12em]
                                text-accent-gold

                                transition-all
                              "
                            >
                              Manage

                              <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                            </Link>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CASE META
============================================================================ */

function CaseMeta({
  icon,
  children,
}: {
  icon: React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[7px] text-muted-foreground">
      <span
        className="
          shrink-0 text-accent-gold
          [&>svg]:h-3
          [&>svg]:w-3
        "
      >
        {icon}
      </span>

      <span className="min-w-0">
        {children}
      </span>
    </div>
  );
}