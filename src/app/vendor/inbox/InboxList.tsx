"use client";

import { useState, useTransition } from "react";
import { respondToAssignment } from "./actions";
import { formatDate } from "@/lib/utils";
import {
  Calendar, MapPin, Users, CheckCircle2, AlertCircle, X,
  Check, Info, Clock, ChevronDown, ChevronUp, Inbox as InboxIcon,
  Sparkles, Layers
} from "lucide-react";

interface ServiceItem { name: string; subcategories: { category_id: string } | null; }
interface RequestItem { quantity: number; unit_price: number; pricing_type: string; service_items: ServiceItem | null; }
interface EventRequest {
  id: string; event_type: string; event_date: string;
  location: string; guest_count: number; total_budget: number;
  request_items: RequestItem[];
}
interface Assignment {
  id: string; created_at: string; category_id: string;
  categories: { name: string } | null;
  event_requests: EventRequest | null;
}

const categoryAccent: Record<string, string> = {
  Photography: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
  Food:        "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
  Lighting:    "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400",
  Decoration:  "from-pink-500/20 to-pink-600/5 border-pink-500/30 text-pink-400",
  DJ:          "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
  default:     "from-zinc-700/20 to-zinc-800/5 border-zinc-600/30 text-zinc-400",
};

function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Past date", urgent: false };
  if (diff === 0) return { label: "TODAY", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: true };
  if (diff <= 7) return { label: `In ${diff} days`, urgent: true };
  return { label: `In ${diff} days`, urgent: false };
}

export default function InboxList({ assignments }: { assignments: Assignment[] }) {
  const [confirming, setConfirming] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "accepted" | "rejected">>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const executeAction = async () => {
    if (!confirming) return;
    const { id, action } = confirming;
    setLoadingId(id);
    setConfirming(null);
    setError(null);

    startTransition(async () => {
      try {
        await respondToAssignment(id, action === "accept");
        setFeedbackMap((prev) => ({ ...prev, [id]: action === "accept" ? "accepted" : "rejected" }));
      } catch (err: any) {
        setError(err.message || "Failed to submit response.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-[32px] border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-5 text-accent-gold shadow-md">
          <InboxIcon className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Inbox is clear</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light max-w-xs">
          New dispatch staging invitations will appear here. All user profile records are protected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-7xl mx-auto">

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="cursor-pointer text-red-400/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invitation Cards */}
      <div className="space-y-6">
        {assignments.map((assign, i) => {
          const req = assign.event_requests;
          if (!req) return null;

          const isLoading = loadingId === assign.id;
          const feedback = feedbackMap[assign.id];
          const isConfirming = confirming?.id === assign.id;

          const countdown = getDaysUntil(req.event_date);
          const catName = assign.categories?.name || "General";
          const accent = categoryAccent[catName] || categoryAccent.default;

          const categoryItems = req.request_items.filter(
            (item) => item.service_items?.subcategories?.category_id === assign.category_id
          );

          if (feedback) {
            return (
              <div key={assign.id} className={`p-5 rounded-3xl border text-xs font-semibold flex items-center gap-2 animate-scale-in ${
                feedback === "accepted"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-sm"
                  : "bg-zinc-500/5 border-border/40 text-muted-foreground"
              }`}>
                {feedback === "accepted" ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Invitation Accepted — Awaiting Coordinator Partner Sync.</>
                ) : (
                  <><X className="w-4 h-4 text-red-500" /> Proposal declined. File has been closed.</>
                )}
              </div>
            );
          }

          return (
            <div
              key={assign.id}
              className={`group relative rounded-[28px] border bg-surface overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg hover-lift ${
                countdown.urgent ? "border-amber-500/30" : "border-border/80 hover:border-accent-gold/25"
              }`}
            >
              {/* Highlight strip on left */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-gold to-amber-500" />

              <div className="p-6 sm:p-8 space-y-6 pl-8">

                {/* Header row details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-bold uppercase tracking-widest text-accent-gold">
                        {catName}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        countdown.urgent
                          ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                          : "bg-background text-muted-foreground border-border/40"
                      }`}>
                        <Clock className="inline w-3 h-3 mr-1" />{countdown.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono font-bold">REF: #{assign.id.substring(0, 8).toUpperCase()}</span>
                    </div>

                    <h2 className="text-xl font-light font-heading text-foreground tracking-tight group-hover:text-accent-gold transition">
                      {req.event_type}
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Received on {formatDate(assign.created_at)}
                    </p>
                  </div>

                  {/* Accept/Decline action buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start">
                    {isLoading ? (
                      <span className="text-[10px] text-muted-foreground font-mono animate-pulse">Publishing response...</span>
                    ) : isConfirming ? (
                      <div className="flex items-center gap-2 bg-background border border-border/80 p-1.5 rounded-2xl animate-scale-in">
                        <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-muted-foreground px-2">
                          Confirm {confirming.action}?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="px-3 py-1.5 text-[9px] font-bold border border-border rounded-xl text-muted-foreground cursor-pointer hover:bg-surface-raised"
                        >Cancel</button>
                        <button
                          type="button"
                          onClick={executeAction}
                          className={`px-3.5 py-1.5 text-[9px] font-bold text-black rounded-xl cursor-pointer shadow ${
                            confirming.action === "accept" ? "bg-accent-gold" : "bg-red-500 text-white"
                          }`}
                        >Confirm</button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirming({ id: assign.id, action: "reject" })}
                          className="px-4 py-2 text-[10px] font-bold text-muted-foreground border border-border/80 hover:border-red-500/30 hover:text-red-400 rounded-xl transition cursor-pointer"
                        >Decline</button>
                        <button
                          type="button"
                          onClick={() => setConfirming({ id: assign.id, action: "accept" })}
                          className="px-4.5 py-2 text-[10px] font-bold text-black bg-gradient-to-r from-accent-gold to-amber-500 rounded-xl transition shadow-md shadow-[#D4AF37]/10 cursor-pointer"
                        >Accept Lead</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Details layout strip info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background/50 border border-border/80 rounded-2xl text-[11px] font-mono text-muted-foreground">
                  <div>
                    <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-accent-gold" /> Event Date
                    </span>
                    <span className="font-bold text-foreground pl-5 block mt-0.5">{req.event_date}</span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      <Users className="w-3.5 h-3.5 text-accent-gold" /> Attendance Scope
                    </span>
                    <span className="font-bold text-foreground pl-5 block mt-0.5">{req.guest_count} guests</span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-accent-gold" /> Staging Venue
                    </span>
                    <span className="font-bold text-foreground pl-5 block mt-0.5 truncate">{req.location}</span>
                  </div>
                </div>

                {/* Services deliverables items needed */}
                {categoryItems.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-muted-foreground font-mono">Deliverables Checklist</span>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-background border border-border text-foreground/80 rounded-xl font-bold font-sans"
                        >
                          <Check className="w-3.5 h-3.5 text-accent-gold" />
                          {item.service_items?.name}
                          {item.quantity > 1 && (
                            <span className="px-1.5 bg-surface border border-border/40 text-accent-gold text-[8.5px] font-bold rounded ml-1">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy info disclosures */}
                <div className="flex items-start gap-2.5 p-3.5 bg-background/50 border border-border/80 rounded-2xl">
                  <Info className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                    Accepting locks your schedule slot availability for this event file. Complete staging logs and coordinating assignments unlock automatically upon Admin confirmation. Client identities are protected at all times.
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
