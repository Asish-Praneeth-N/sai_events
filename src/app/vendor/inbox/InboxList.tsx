"use client";

import { useState, useTransition } from "react";
import { respondToAssignment } from "./actions";
import { formatDate } from "@/lib/utils";
import { 
  Calendar, MapPin, Users, CheckCircle2, AlertCircle, X, Check, Info, Clock, HelpCircle
} from "lucide-react";

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

const categoryColor: Record<string, string> = {
  Photography: "bg-blue-500/10 border-blue-500/25 text-blue-400",
  Food:        "bg-amber-500/10 border-amber-500/25 text-amber-400",
  Lighting:    "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",
  Decoration:  "bg-pink-500/10 border-pink-500/25 text-pink-400",
  DJ:          "bg-purple-500/10 border-purple-500/25 text-purple-400",
  default:     "bg-zinc-800/40 border-zinc-700/30 text-zinc-400",
};

export default function InboxList({ assignments }: { assignments: Assignment[] }) {
  const [confirming, setConfirming] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initiateAction = (id: string, action: "accept" | "reject") => {
    setConfirming({ id, action });
    setError(null);
  };

  const executeAction = async () => {
    if (!confirming) return;
    setLoadingId(confirming.id);
    const targetId = confirming.id;
    const accept = confirming.action === "accept";
    setConfirming(null);
    setError(null);

    startTransition(async () => {
      try {
        await respondToAssignment(targetId, accept);
        setFeedbackId(targetId);
        setTimeout(() => setFeedbackId(null), 2500);
      } catch (err: any) {
        setError(err.message || "Failed to process lead response.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  return (
    <div className="space-y-6 select-none">
      {error && (
        <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-5 text-accent-gold shadow-md">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-foreground">All Caught Up</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light max-w-xs mx-auto">
            New corporate invitations and category planning leads will register in this inbox as they are calibrated by our dispatch.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {assignments.map((assign, i) => {
            const req = assign.event_requests;
            if (!req) return null;

            const isLoading = loadingId === assign.id;
            const isSuccess = feedbackId === assign.id;
            const isConfirming = confirming?.id === assign.id;
            
            // Filter request items matching this specific category mapping
            const categoryItems = req.request_items.filter(
              (item) => item.service_items?.subcategories?.category_id === assign.category_id
            );

            // Compute subcategory/category styles
            const badgeStyle = assign.categories?.name 
              ? categoryColor[assign.categories.name] || categoryColor.default 
              : categoryColor.default;

            return (
              <div
                key={assign.id}
                className={`group relative rounded-3xl overflow-hidden bg-surface border transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                  isSuccess
                    ? "border-emerald-500/35 bg-emerald-950/[0.02]"
                    : "border-border/80 hover:border-accent-gold/25 hover:shadow-md shadow-sm"
                }`}
              >
                {/* Gold Highlight Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent-gold to-amber-500 transition-all duration-300 group-hover:w-[5px]" />

                <div className="pl-6.5 pr-5.5 py-6.5 space-y-5">
                  {/* Feedback Banner */}
                  {isSuccess && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-scale-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Response submitted successfully. Revalidating inbox...</span>
                    </div>
                  )}

                  {/* Top Bar: Lead metadata and immediate actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 border rounded-lg text-[8.5px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                          {assign.categories?.name || "General"} Lead
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono">File: {assign.id.substring(0, 8)}</span>
                      </div>
                      <h4 className="text-base font-bold text-foreground font-heading mt-1">
                        {req.event_type} Case
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Calibrated on {formatDate(assign.created_at)}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2.5 sm:self-start shrink-0">
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          <svg className="w-4 h-4 animate-spin text-accent-gold" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </div>
                      ) : isConfirming ? (
                        <div className="flex items-center gap-2 animate-scale-in">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider pr-1">
                            {confirming.action === "accept" ? "Accept?" : "Decline?"}
                          </span>
                          <button
                            onClick={cancelConfirm}
                            className="px-3 py-1.5 text-[9px] font-bold border border-border hover:bg-surface-raised rounded-xl text-muted-foreground hover:text-foreground transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={executeAction}
                            className={`px-3 py-1.5 text-[9px] font-bold text-black rounded-xl transition cursor-pointer shadow-sm ${
                              confirming.action === "accept"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/10"
                                : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/10"
                            }`}
                          >
                            Confirm
                          </button>
                        </div>
                      ) : !isSuccess ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => initiateAction(assign.id, "reject")}
                            className="px-3.5 py-2 text-[10px] font-bold text-zinc-500 hover:text-red-400 border border-border/80 hover:border-red-950/20 hover:bg-red-950/5 rounded-xl transition duration-200 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => initiateAction(assign.id, "accept")}
                            className="px-4.5 py-2 text-[10px] font-bold text-black bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold rounded-xl transition duration-200 shadow-md shadow-[#D4AF37]/10"
                          >
                            Accept Lead
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 bg-background/50 border border-border/60 rounded-2xl p-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-gold" /> Event Date</span>
                      <span className="font-bold text-foreground/80 pl-5 block">{req.event_date}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent-gold" /> Attendance</span>
                      <span className="font-bold text-foreground/80 pl-5 block">{req.guest_count} guests</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-gold" /> Event Venue</span>
                      <span className="font-bold text-foreground/80 pl-5 block truncate">{req.location}</span>
                    </div>
                  </div>

                  {/* Required Services Details */}
                  {categoryItems.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground pl-0.5">Required Services Specification</span>
                      <div className="flex flex-wrap gap-1.5">
                        {categoryItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background border border-border text-zinc-700 dark:text-zinc-300 rounded-xl font-bold"
                          >
                            {item.service_items?.name}
                            {item.quantity > 1 && (
                              <span className="px-1.5 py-0.2 bg-surface border border-border/30 text-accent-gold text-[9px] font-bold rounded">
                                ×{item.quantity}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Private Data encapsulation statement */}
                  <div className="p-3 bg-background/30 border border-border/60 rounded-2xl flex items-start gap-2.5">
                    <Info className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground/85 leading-relaxed font-light">
                      Accepting registers your availability. Operational logs, stage instructions, and coordinator contact endpoints unlock automatically upon final Admin confirmation. Customer parameters are managed securely by SAI EVENTS.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
