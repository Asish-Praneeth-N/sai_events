"use client";

import { useState, useTransition } from "react";
import { respondToAssignment } from "./actions";
import { formatDate } from "@/lib/utils";
import {
  Calendar, MapPin, Users, CheckCircle2, AlertCircle, X,
  Check, Info, Clock, ChevronDown, ChevronUp, Inbox as InboxIcon
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
  if (diff === 0) return { label: "Today!", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: true };
  if (diff <= 7) return { label: `In ${diff} days`, urgent: true };
  return { label: `In ${diff} days`, urgent: false };
}

export default function InboxList({ assignments }: { assignments: Assignment[] }) {
  const [confirming, setConfirming] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "accepted" | "rejected">>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        setError(err.message || "Failed to process response.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 rounded-3xl border border-dashed border-border/60 bg-surface/30 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border/60 flex items-center justify-center mb-5 shadow-sm">
          <InboxIcon className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="text-base font-bold text-foreground">Inbox Clear</h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-light max-w-xs">
          New invitations from SAI EVENTS dispatch will appear here. All client identity is protected — you coordinate exclusively with your assigned Operational Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">

      {/* Error Toast */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-950/30 border border-red-900/40 text-red-400 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Cards */}
      {assignments.map((assign, i) => {
        const req = assign.event_requests;
        if (!req) return null;

        const isLoading = loadingId === assign.id;
        const feedback = feedbackMap[assign.id];
        const isConfirming = confirming?.id === assign.id;
        const isExpanded = expandedId === assign.id;

        const countdown = getDaysUntil(req.event_date);
        const catName = assign.categories?.name || "General";
        const accent = categoryAccent[catName] || categoryAccent.default;

        const categoryItems = req.request_items.filter(
          (item) => item.service_items?.subcategories?.category_id === assign.category_id
        );

        if (feedback) {
          return (
            <div key={assign.id} className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              feedback === "accepted"
                ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-400"
                : "bg-zinc-950/40 border-zinc-800/40 text-zinc-500"
            }`}>
              {feedback === "accepted"
                ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Response submitted — awaiting Admin confirmation.</>
                : <><X className="w-4 h-4" /> Lead declined. It will be removed from your inbox shortly.</>
              }
            </div>
          );
        }

        return (
          <div
            key={assign.id}
            className={`group relative rounded-3xl border bg-surface overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
              countdown.urgent ? "border-amber-500/25" : "border-border/70 hover:border-accent-gold/25"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Category gradient header strip */}
            <div className={`h-1.5 bg-gradient-to-r ${accent.split(" ")[0]} ${accent.split(" ")[1]}`} />

            <div className="p-6 space-y-5">

              {/* ── Row 1: Header + Actions ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border bg-gradient-to-r ${accent}`}>
                      {catName}
                    </span>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-lg border ${
                      countdown.urgent
                        ? "bg-red-500/8 text-red-400 border-red-500/20"
                        : "bg-background text-muted-foreground border-border/40"
                    }`}>
                      <Clock className="inline w-2.5 h-2.5 mr-1" />{countdown.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">REF: {assign.id.substring(0, 8).toUpperCase()}</span>
                  </div>

                  <h2 className="text-xl font-light font-heading text-foreground">
                    {req.event_type}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Invitation received {formatDate(assign.created_at)}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isLoading ? (
                    <span className="text-[10px] text-muted-foreground font-mono animate-pulse">Processing…</span>
                  ) : isConfirming ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                        {confirming.action === "accept" ? "Accept this lead?" : "Decline this lead?"}
                      </span>
                      <button
                        onClick={() => setConfirming(null)}
                        className="px-3 py-1.5 text-[9px] font-bold border border-border rounded-xl text-muted-foreground cursor-pointer hover:bg-surface-raised transition"
                      >No</button>
                      <button
                        onClick={executeAction}
                        className={`px-3.5 py-1.5 text-[9px] font-bold rounded-xl cursor-pointer transition ${
                          confirming.action === "accept"
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm"
                            : "bg-red-600 text-white"
                        }`}
                      >Confirm</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirming({ id: assign.id, action: "reject" })}
                        className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground border border-border/70 hover:border-red-900/30 hover:text-red-400 rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => setConfirming({ id: assign.id, action: "accept" })}
                        className="px-4.5 py-2 text-[10px] font-bold text-black bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold rounded-xl transition shadow-md shadow-[#D4AF37]/10 cursor-pointer"
                      >
                        Accept Lead
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Row 2: Core Details ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-background/50 border border-border/50 rounded-2xl text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground tracking-wider">
                    <Calendar className="w-3 h-3 text-accent-gold" /> Event Date
                  </span>
                  <span className="font-bold text-foreground pl-4 block">{req.event_date}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground tracking-wider">
                    <Users className="w-3 h-3 text-accent-gold" /> Attendance
                  </span>
                  <span className="font-bold text-foreground pl-4 block">{req.guest_count} guests</span>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-muted-foreground tracking-wider">
                    <MapPin className="w-3 h-3 text-accent-gold" /> Venue
                  </span>
                  <span className="font-bold text-foreground pl-4 block truncate">{req.location}</span>
                </div>
              </div>

              {/* ── Row 3: Services Required ── */}
              {categoryItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Required Services</span>
                  <div className="flex flex-wrap gap-2">
                    {categoryItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-background border border-border text-foreground/80 rounded-xl font-semibold"
                      >
                        <Check className="w-3 h-3 text-accent-gold" />
                        {item.service_items?.name}
                        {item.quantity > 1 && (
                          <span className="px-1.5 bg-surface border border-border/30 text-accent-gold text-[9px] font-bold rounded">
                            ×{item.quantity}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Privacy Disclaimer ── */}
              <div className="flex items-start gap-2.5 p-3 bg-background/30 border border-border/50 rounded-xl">
                <Info className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                  Accepting registers your availability for this event. Operational details, reporting instructions, and coordinator contact information unlock automatically after Admin confirmation. Client identity is protected by SAI EVENTS at all times.
                </p>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
