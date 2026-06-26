"use client";

import { useState } from "react";
import { respondToAssignment } from "./actions";
import { formatDate } from "@/lib/utils";

interface ServiceItem {
  name: string;
  subcategories: { category_id: string } | null;
}
interface RequestItem {
  quantity: number;
  unit_price: number;
  pricing_type: string;
  service_items: ServiceItem | null;
}
interface EventRequest {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  total_budget: number;
  request_items: RequestItem[];
}
interface Assignment {
  id: string;
  created_at: string;
  category_id: string;
  categories: { name: string } | null;
  event_requests: EventRequest | null;
}

// ─── Category color scheme ─────────────────────────────────────────
const categoryColor: Record<string, string> = {
  Photography: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  Food:        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  Lighting:    "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50",
  Decoration:  "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800/50",
  DJ:          "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
  default:     "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
};

function getCategoryBadge(name: string | undefined) {
  if (!name) return categoryColor.default;
  return categoryColor[name] || categoryColor.default;
}

export default function InboxList({ assignments }: { assignments: Assignment[] }) {
  // Track which card is in "confirming" state: { id, action }
  const [confirming, setConfirming] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null); // success feedback
  const [error, setError] = useState<string | null>(null);

  const initiateAction = (id: string, action: "accept" | "reject") => {
    setConfirming({ id, action });
    setError(null);
  };

  const cancelConfirm = () => setConfirming(null);

  const executeAction = async () => {
    if (!confirming) return;
    setLoadingId(confirming.id);
    setConfirming(null);
    setError(null);
    try {
      await respondToAssignment(confirming.id, confirming.action === "accept");
      setFeedbackId(confirming.id);
      setTimeout(() => setFeedbackId(null), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl animate-slide-down">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer opacity-60 hover:opacity-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-surface text-center p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-bold text-foreground">All caught up</p>
          <p className="text-xs text-muted-foreground mt-1">New leads will appear here when assigned</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assign, i) => {
            const req = assign.event_requests;
            if (!req) return null;

            const isLoading = loadingId === assign.id;
            const isSuccess = feedbackId === assign.id;
            const isConfirming = confirming?.id === assign.id;
            const categoryItems = req.request_items.filter(
              (item) => item.service_items?.subcategories?.category_id === assign.category_id
            );

            return (
              <div
                key={assign.id}
                className={`group relative rounded-3xl overflow-hidden bg-surface border transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                  isSuccess
                    ? "border-emerald-300 dark:border-emerald-800/60"
                    : "border-border hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-md shadow-sm"
                }`}
              >
                {/* Left accent strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500" />

                <div className="pl-6 pr-5 py-5 space-y-4">
                  {/* Success overlay */}
                  {isSuccess && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-scale-in">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Response sent successfully.
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold font-heading text-foreground">
                          {req.event_type}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${getCategoryBadge(assign.categories?.name)}`}>
                          {assign.categories?.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Received {formatDate(assign.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing…
                        </div>
                      ) : isConfirming ? (
                        <div className="flex items-center gap-2 animate-scale-in">
                          <span className="text-xs text-muted-foreground font-semibold">
                            {confirming.action === "accept" ? "Accept lead?" : "Reject lead?"}
                          </span>
                          <button
                            onClick={cancelConfirm}
                            className="px-3 py-1.5 text-xs font-bold border border-border text-muted-foreground rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={executeAction}
                            className={`px-3 py-1.5 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-sm ${
                              confirming.action === "accept"
                                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                                : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                            }`}
                          >
                            Confirm
                          </button>
                        </div>
                      ) : !isSuccess ? (
                        <>
                          <button
                            onClick={() => initiateAction(assign.id, "reject")}
                            className="px-3.5 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border border-border rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => initiateAction(assign.id, "accept")}
                            className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
                          >
                            Accept Lead
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {req.event_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {req.guest_count} guests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {req.location}
                    </span>
                  </div>

                  {/* Service Tags */}
                  {categoryItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {categoryItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-zinc-50 dark:bg-zinc-950 border border-border text-zinc-700 dark:text-zinc-300 rounded-xl"
                        >
                          {item.service_items?.name}
                          {item.quantity > 1 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground rounded">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Disclaimer */}
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/40 pt-2.5">
                    Accepting notifies the coordinator you&apos;re available. Customer contact details are shared once confirmed by the admin.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
