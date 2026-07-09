"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateRequestStatus } from "@/app/admin/bookings/actions";
import { GitBranch, MapPin, Calendar, Users, ArrowRight, ArrowLeft, MoreHorizontal } from "lucide-react";
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

const columns: Column[] = [
  { id: "submitted", title: "Submitted", statuses: ["Request Submitted"], color: "border-t-blue-500 text-blue-500" },
  { id: "review", title: "Under Review", statuses: ["Under Admin Review"], color: "border-t-amber-500 text-amber-500" },
  { id: "matching", title: "Vendor Selection", statuses: ["Vendor Selection In Progress", "Sent to Vendors"], color: "border-t-purple-500 text-purple-500" },
  { id: "accepted", title: "Vendor Accepted", statuses: ["Vendor Accepted"], color: "border-t-pink-500 text-pink-500" },
  { id: "confirmed", title: "Confirmed", statuses: ["Vendor Approved by Admin", "Customer Confirmation Pending", "Confirmed"], color: "border-t-emerald-500 text-emerald-500" },
  { id: "completed", title: "Completed", statuses: ["Completed"], color: "border-t-teal-500 text-teal-500" },
  { id: "cancelled", title: "Cancelled", statuses: ["Cancelled"], color: "border-t-red-500 text-red-500" }
];

export default function BookingsKanban({ initialRequests }: BookingsKanbanProps) {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [filterQuery, setFilterQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleStatusUpdate = (requestId: string, nextStatus: string) => {
    // Optimistic UI update
    const previous = [...requests];
    setRequests((prev) => 
      prev.map((r) => r.id === requestId ? { ...r, status: nextStatus } : r)
    );

    startTransition(async () => {
      try {
        await updateRequestStatus(requestId, nextStatus);
      } catch (err) {
        console.error("Failed to update status:", err);
        // Revert on error
        setRequests(previous);
        alert("Failed to update request status.");
      }
    });
  };

  // Drag and drop handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (!id) return;

    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    // Use the primary status of that column
    const nextStatus = column.statuses[0];
    const item = requests.find((r) => r.id === id);
    if (item && item.status !== nextStatus) {
      handleStatusUpdate(id, nextStatus);
    }
    setDraggedId(null);
  };

  // Filter items
  const filteredRequests = requests.filter((r) => {
    const query = filterQuery.toLowerCase();
    return (
      r.event_type.toLowerCase().includes(query) ||
      (r.profiles?.full_name || "").toLowerCase().includes(query) ||
      r.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter bookings by client name, event type, or location..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full sm:max-w-md px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground"
        />
        {isPending && (
          <span className="text-xs text-accent-gold animate-pulse flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
            Saving Pipeline changes...
          </span>
        )}
      </div>

      {/* Kanban Board Grid */}
      <div className="overflow-x-auto pb-4 flex gap-4 min-h-[65vh] select-none scrollbar-thin">
        {columns.map((column) => {
          const colRequests = filteredRequests.filter((r) => 
            column.statuses.includes(r.status)
          );

          return (
            <div
              key={column.id}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, column.id)}
              className="w-72 flex-shrink-0 bg-surface border border-border rounded-2xl flex flex-col max-h-[70vh] shadow-sm hover:shadow transition duration-200"
            >
              {/* Column Header */}
              <div className={`p-4 border-t-2 ${column.color} border-b border-border flex items-center justify-between bg-surface-raised/40 rounded-t-2xl`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">{column.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-background border border-border text-muted-foreground rounded-md">
                  {colRequests.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
                {colRequests.length === 0 ? (
                  <div className="text-center py-12 text-[10px] text-muted-foreground border border-dashed border-border rounded-xl bg-background/5">
                    No bookings here
                  </div>
                ) : (
                  colRequests.map((req) => (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, req.id)}
                      className={`p-4 bg-background border border-border rounded-xl shadow-xs transition-all duration-200 group relative ${
                        draggedId === req.id 
                          ? "opacity-40 cursor-grabbing border-accent-gold" 
                          : "cursor-grab hover:border-accent-gold/40 hover:shadow"
                      }`}
                    >
                      {/* Card Content */}
                      <div className="space-y-3.5">
                        <div>
                          <div className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">
                            {req.event_type}
                          </div>
                          <h4 className="text-xs font-bold text-foreground mt-1">
                            {req.profiles?.full_name || "Unknown Client"}
                          </h4>
                        </div>

                        <div className="space-y-1.5 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />
                            <span>{formatDate(req.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />
                            <span className="truncate">{req.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />
                            <span>{req.guest_count} guests</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground font-mono">
                            ₹{Number(req.total_budget).toLocaleString("en-IN")}
                          </span>
                          
                          <Link
                            href={`/admin/bookings/${req.id}`}
                            className="text-[10px] font-bold text-accent-gold hover:underline flex items-center gap-0.5"
                          >
                            Manage <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Fallback shift buttons for mobile/tablet */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-background border border-border rounded-lg p-0.5 shadow-sm">
                        {columns.indexOf(column) > 0 && (
                          <button
                            onClick={() => {
                              const prevCol = columns[columns.indexOf(column) - 1];
                              handleStatusUpdate(req.id, prevCol.statuses[0]);
                            }}
                            className="p-1 hover:bg-surface-raised rounded text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {columns.indexOf(column) < columns.length - 1 && (
                          <button
                            onClick={() => {
                              const nextCol = columns[columns.indexOf(column) + 1];
                              handleStatusUpdate(req.id, nextCol.statuses[0]);
                            }}
                            className="p-1 hover:bg-surface-raised rounded text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
