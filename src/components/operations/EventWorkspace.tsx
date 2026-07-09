"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Activity, Calendar, CheckSquare, FileText,
  Users, Clock, Phone, Mail, MapPin, Zap, AlertTriangle,
  CheckCircle2, XCircle, Plus, Send, ChevronRight, Shield,
  Briefcase, StickyNote, FolderOpen, BarChart3, X, Star,
  Building, Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  acceptAssignment, updateAssignmentStatus, addTimelineEntry,
  toggleChecklistItem, addChecklistItem, addNote,
  updateVendorCoordination, submitEscalation, submitCompletionReport
} from "@/app/operations/actions";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Assignment {
  id: string; event_id: string; status: string; handover_notes: string | null;
  expected_completion: string | null; escalation_level: number;
  escalation_reason: string | null; created_at: string; updated_at: string;
  event_requests: {
    id: string; event_type: string; event_date: string; location: string;
    guest_count: number; total_budget: number; status: string;
    profiles: { id: string; full_name: string; phone_number: string; email: string; address: string | null } | null;
  } | null;
  assigner: { full_name: string } | null;
}
interface ChecklistItem { id: string; label: string; is_completed: boolean; completed_at: string | null; sort_order: number; }
interface TimelineEntry { id: string; milestone_name: string; description: string | null; is_internal: boolean; created_at: string; profiles: { full_name: string } | null; }
interface Note { id: string; content: string; created_at: string; profiles: { full_name: string } | null; }
interface Document { id: string; file_name: string; file_url: string; file_type: string; created_at: string; profiles: { full_name: string } | null; }
interface VendorAssignment { id: string; status: string; categories: { name: string } | null; profiles: { id: string; full_name: string; phone_number: string; email: string; business_name: string | null } | null; }
interface VendorCoord { id: string; vendor_assignment_id: string; arrival_status: string; coordination_note: string | null; last_contacted: string | null; }
interface CompletionReport { executive_summary: string; execution_notes: string; issues_faced: string; vendor_performance: string; customer_satisfaction: number; lessons_learned: string; submitted_at: string; }

interface EventWorkspaceProps {
  assignment: Assignment;
  eventId: string;
  vendorAssignments: VendorAssignment[];
  checklist: ChecklistItem[];
  timelineEntries: TimelineEntry[];
  notes: Note[];
  documents: Document[];
  completionReport: CompletionReport | null;
  vendorCoordination: VendorCoord[];
  currentUserName: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d ago`, color: "text-zinc-500" };
  if (diff === 0) return { label: "TODAY",     color: "text-red-500 font-black animate-pulse" };
  if (diff === 1) return { label: "Tomorrow",  color: "text-amber-500 font-bold" };
  return { label: `${diff} days`,              color: diff <= 7 ? "text-amber-400" : "text-muted-foreground" };
}

const TABS = [
  { key: "overview",  label: "Overview",    icon: Activity },
  { key: "timeline",  label: "Timeline",    icon: Clock },
  { key: "customer",  label: "Customer",    icon: Users },
  { key: "vendors",   label: "Vendors",     icon: Building },
  { key: "checklist", label: "Checklist",   icon: CheckSquare },
  { key: "documents", label: "Documents",   icon: FolderOpen },
  { key: "notes",     label: "Notes",       icon: StickyNote },
  { key: "activity",  label: "Activity",    icon: Briefcase },
  { key: "report",    label: "Report",      icon: BarChart3 },
] as const;

type TabKey = typeof TABS[number]["key"];

const STATUS_FLOW = ["Assigned", "Accepted", "Execution Started", "Execution Complete", "Closed"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Assigned": "text-amber-400 bg-amber-500/10 border-amber-500/25",
    "Accepted": "text-blue-400 bg-blue-500/10 border-blue-500/25",
    "Execution Started": "text-violet-400 bg-violet-500/10 border-violet-500/25",
    "Execution Complete": "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    "Closed": "text-zinc-400 bg-zinc-500/10 border-zinc-500/25",
  };
  return <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${map[status] || "text-muted-foreground bg-muted border-border"}`}>{status}</span>;
}

// ─── Escalation Modal ───────────────────────────────────────────────────────
function EscalationModal({ assignmentId, eventId, onClose, onSuccess }: { assignmentId: string; eventId: string; onClose: () => void; onSuccess: () => void; }) {
  const [type, setType] = useState("Vendor No Show");
  const [reason, setReason] = useState("");
  const [level, setLevel] = useState<1|2|3>(2);
  const [loading, setLoading] = useState(false);
  const types = ["Vendor No Show", "Customer Complaint", "Venue Issue", "Emergency", "Budget Issue", "Equipment Failure"];

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await submitEscalation(assignmentId, eventId, type, reason, level);
      onSuccess();
      onClose();
    } catch { }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-border/60 rounded-3xl p-6 space-y-5 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Raise Escalation</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Escalation Type</label>
            <div className="grid grid-cols-2 gap-2">
              {types.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`py-2 px-3 text-[10px] font-semibold rounded-xl border transition cursor-pointer text-left ${type === t ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-background border-border/60 text-muted-foreground hover:border-border"}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Severity Level</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition cursor-pointer ${level === l ? l === 1 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : l === 2 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-red-500/10 border-red-500/30 text-red-400" : "bg-background border-border/60 text-muted-foreground"}`}
                >{l === 1 ? "Low" : l === 2 ? "Medium" : "High"}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Description</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Describe the issue clearly so Admin can take immediate action..."
              className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-red-500/40"
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !reason.trim()}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {loading ? "Escalating..." : "Submit Escalation — Notify Admin"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EventWorkspace({
  assignment, eventId, vendorAssignments, checklist: initialChecklist,
  timelineEntries: initialTimeline, notes: initialNotes, documents,
  completionReport: initialReport, vendorCoordination, currentUserName
}: EventWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showEscalation, setShowEscalation] = useState(false);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [notes, setNotes] = useState(initialNotes);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Inline form states
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newTimelineMilestone, setNewTimelineMilestone] = useState("");
  const [newTimelineDesc, setNewTimelineDesc] = useState("");
  const [isInternal, setIsInternal] = useState(true);

  // Vendor coordination state
  const [coordState, setCoordState] = useState<Record<string, { status: string; note: string }>>(() => {
    const m: Record<string, { status: string; note: string }> = {};
    vendorCoordination.forEach(c => { m[c.vendor_assignment_id] = { status: c.arrival_status, note: c.coordination_note || "" }; });
    return m;
  });

  // Completion report state
  const [report, setReport] = useState({ executiveSummary: "", executionNotes: "", issuesFaced: "", vendorPerformance: "", customerSatisfaction: 8, lessonsLearned: "" });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const refresh = () => startTransition(() => router.refresh());

  // Health score
  const healthScore = useMemo(() => {
    const total = checklist.length || 1;
    const done = checklist.filter(c => c.is_completed).length;
    const pct = Math.round((done / total) * 100);
    const esc = (assignment.escalation_level || 0) * 15;
    const score = Math.max(0, pct - esc);
    if (score >= 70) return { score, label: "Healthy", color: "text-emerald-400", bg: "bg-emerald-500", ring: "ring-emerald-500/30" };
    if (score >= 40) return { score, label: "Attention", color: "text-amber-400", bg: "bg-amber-500", ring: "ring-amber-500/30" };
    return { score, label: "Critical", color: "text-red-400", bg: "bg-red-500", ring: "ring-red-500/30" };
  }, [checklist, assignment.escalation_level]);

  const req = assignment.event_requests;
  const customer = req?.profiles;
  const countdown = req ? getDaysUntil(req.event_date) : null;
  const canAccept = assignment.status === "Assigned";
  const canStart  = assignment.status === "Accepted";
  const canComplete = assignment.status === "Execution Started";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAccept = () => startTransition(async () => {
    try { await acceptAssignment(assignment.id); showToast("success", "Assignment accepted! Checklist seeded."); refresh(); }
    catch (e: any) { showToast("error", e.message); }
  });

  const handleStatus = (status: "Execution Started" | "Execution Complete") => startTransition(async () => {
    try { await updateAssignmentStatus(assignment.id, status); showToast("success", `Status updated to "${status}"`); refresh(); }
    catch (e: any) { showToast("error", e.message); }
  });

  const handleToggleChecklist = async (item: ChecklistItem) => {
    const newVal = !item.is_completed;
    setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, is_completed: newVal } : c));
    try { await toggleChecklistItem(item.id, assignment.id, newVal); }
    catch { setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, is_completed: item.is_completed } : c)); }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistLabel.trim()) return;
    try {
      await addChecklistItem(assignment.id, newChecklistLabel);
      setChecklist(prev => [...prev, { id: Date.now().toString(), label: newChecklistLabel, is_completed: false, completed_at: null, sort_order: prev.length, created_at: new Date().toISOString() }]);
      setNewChecklistLabel("");
      showToast("success", "Item added");
    } catch (e: any) { showToast("error", e.message); }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNote(assignment.id, newNote);
      setNotes(prev => [{ id: Date.now().toString(), content: newNote, created_at: new Date().toISOString(), profiles: { full_name: currentUserName } }, ...prev]);
      setNewNote("");
      showToast("success", "Note saved");
    } catch (e: any) { showToast("error", e.message); }
  };

  const handleAddTimeline = async () => {
    if (!newTimelineMilestone.trim()) return;
    try {
      await addTimelineEntry(assignment.id, eventId, newTimelineMilestone, newTimelineDesc, isInternal);
      setTimeline(prev => [...prev, { id: Date.now().toString(), milestone_name: newTimelineMilestone, description: newTimelineDesc || null, is_internal: isInternal, created_at: new Date().toISOString(), profiles: { full_name: currentUserName } }]);
      setNewTimelineMilestone(""); setNewTimelineDesc("");
      showToast("success", "Timeline entry added");
    } catch (e: any) { showToast("error", e.message); }
  };

  const handleVendorCoord = async (vendorAssignmentId: string) => {
    const c = coordState[vendorAssignmentId];
    if (!c) return;
    try {
      await updateVendorCoordination(assignment.id, vendorAssignmentId, c.status, c.note);
      showToast("success", "Coordination updated");
    } catch (e: any) { showToast("error", e.message); }
  };

  const handleSubmitReport = async () => {
    try {
      await submitCompletionReport(assignment.id, eventId, report);
      showToast("success", "Completion report submitted! Admin has been notified.");
      refresh();
    } catch (e: any) { showToast("error", e.message); }
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl animate-scale-in max-w-sm ${toast.type === "success" ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400" : "bg-red-950/90 border-red-500/30 text-red-400"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {showEscalation && (
        <EscalationModal assignmentId={assignment.id} eventId={eventId}
          onClose={() => setShowEscalation(false)}
          onSuccess={() => { showToast("success", "Escalation raised. Admin notified."); refresh(); }}
        />
      )}

      {/* Back + Header */}
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={assignment.status} />
              {assignment.escalation_level > 0 && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-red-500/10 border-red-500/25 text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Escalated — Level {assignment.escalation_level}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-light font-heading text-foreground">{req?.event_type || "Event Workspace"}</h1>
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-mono">
              {req && (<>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-gold" />{formatDate(req.event_date)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-gold" />{req.location.split(",")[0]}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent-gold" />{req.guest_count} guests</span>
                {countdown && <span className={`font-bold ${countdown.color}`}>{countdown.label}</span>}
              </>)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {canAccept && (
              <button onClick={handleAccept} disabled={isPending}
                className="px-4 py-2.5 bg-accent-gold text-black text-[10px] font-bold rounded-xl hover:brightness-110 transition cursor-pointer shadow-md shadow-accent-gold/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" /> Accept Assignment
              </button>
            )}
            {canStart && (
              <button onClick={() => handleStatus("Execution Started")} disabled={isPending}
                className="px-4 py-2.5 bg-violet-600 text-white text-[10px] font-bold rounded-xl hover:bg-violet-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" /> Start Execution
              </button>
            )}
            {canComplete && (
              <button onClick={() => handleStatus("Execution Complete")} disabled={isPending}
                className="px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
              </button>
            )}
            <button onClick={() => setShowEscalation(true)}
              className="px-4 py-2.5 bg-red-950/40 border border-red-500/25 text-red-400 hover:bg-red-950/60 text-[10px] font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Escalate
            </button>
          </div>
        </div>
      </div>

      {/* Health Score Bar */}
      <div className={`flex items-center gap-4 p-4 bg-surface border border-border/60 rounded-2xl ring-1 ${healthScore.ring}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="18" strokeWidth="4" fill="none" className="text-border/40" stroke="currentColor" />
              <circle cx="24" cy="24" r="18" strokeWidth="4" fill="none" className={healthScore.color} stroke="currentColor"
                strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - healthScore.score / 100)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono ${healthScore.color}`}>{healthScore.score}</span>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Event Health</p>
            <p className={`text-sm font-bold ${healthScore.color}`}>{healthScore.label}</p>
          </div>
        </div>
        <div className="flex gap-4 text-[9px] text-muted-foreground font-mono shrink-0">
          <span><span className="text-foreground font-bold">{checklist.filter(c => c.is_completed).length}/{checklist.length}</span> Checklist</span>
          <span><span className="text-foreground font-bold">{vendorAssignments.filter(v => v.status === "Accepted").length}/{vendorAssignments.length}</span> Vendors</span>
          <span><span className={`font-bold ${assignment.escalation_level > 0 ? "text-red-400" : "text-emerald-400"}`}>{assignment.escalation_level > 0 ? "Escalated" : "Stable"}</span></span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border/50 pb-0 -mb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${
                active ? "text-accent-gold border-accent-gold" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════ TAB CONTENT ═══════════ */}

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Event Details</h3>
            <div className="space-y-3">
              {[
                { label: "Event Type", value: req?.event_type },
                { label: "Event Date", value: req ? formatDate(req.event_date) : "—" },
                { label: "Venue", value: req?.location },
                { label: "Guests", value: req ? `${req.guest_count} guests` : "—" },
                { label: "Budget", value: req ? `₹${Number(req.total_budget).toLocaleString("en-IN")}` : "—" },
                { label: "Assigned By", value: (assignment.assigner as any)?.full_name || "Admin" },
                { label: "Expected Completion", value: assignment.expected_completion ? formatDate(assignment.expected_completion) : "Not set" },
              ].map((row, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-border/30 last:border-0">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{row.label}</span>
                  <span className="text-xs text-foreground text-right font-light">{row.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Handover Notes + Status */}
          <div className="space-y-4">
            {assignment.handover_notes && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Admin Handover Notes</h3>
                <p className="text-xs text-foreground/80 font-light leading-relaxed">{assignment.handover_notes}</p>
              </div>
            )}
            {assignment.escalation_level > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-[9px] uppercase tracking-widest font-bold text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Active Escalation</h3>
                <p className="text-xs text-foreground/80 font-light">{assignment.escalation_reason}</p>
              </div>
            )}
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Checklist", value: `${checklist.filter(c => c.is_completed).length}/${checklist.length}`, icon: CheckSquare, color: "text-accent-gold" },
                { label: "Vendors", value: vendorAssignments.length, icon: Building, color: "text-blue-400" },
                { label: "Timeline", value: timeline.length, icon: Clock, color: "text-violet-400" },
                { label: "Documents", value: documents.length, icon: FolderOpen, color: "text-emerald-400" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="p-4 bg-background border border-border/50 rounded-xl space-y-2">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <div className={`text-lg font-light font-heading ${s.color}`}>{s.value}</div>
                    <p className="text-[8.5px] uppercase tracking-wider font-bold text-muted-foreground">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Timeline entries */}
          <div className="relative space-y-0">
            {timeline.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No timeline entries yet. Accept the assignment to begin.</div>
            )}
            {timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-4 pb-6 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${entry.is_internal ? "bg-violet-500/10 border-violet-500/40 text-violet-400" : "bg-accent-gold/10 border-accent-gold/40 text-accent-gold"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 bg-border/40 flex-1 mt-2" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-foreground">{entry.milestone_name}</span>
                    {entry.is_internal && <span className="text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">Internal</span>}
                  </div>
                  {entry.description && <p className="text-[10.5px] text-muted-foreground font-light leading-relaxed">{entry.description}</p>}
                  <p className="text-[8.5px] text-muted-foreground font-mono mt-1">{entry.profiles?.full_name} · {formatDate(entry.created_at)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add entry form */}
          <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Add Timeline Entry</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {["Customer Contacted", "Venue Inspection", "Vendor Briefing", "Setup Started", "Setup Completed", "Event Started"].map(m => (
                  <button key={m} onClick={() => setNewTimelineMilestone(m)}
                    className={`py-1.5 px-2 text-[9px] font-semibold rounded-lg border transition cursor-pointer text-left ${newTimelineMilestone === m ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold" : "bg-background border-border/50 text-muted-foreground hover:border-border"}`}
                  >{m}</button>
                ))}
              </div>
              <input value={newTimelineMilestone} onChange={e => setNewTimelineMilestone(e.target.value)} placeholder="Or type a custom milestone..."
                className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-gold/40"
              />
              <textarea value={newTimelineDesc} onChange={e => setNewTimelineDesc(e.target.value)} rows={2} placeholder="Description (optional)..."
                className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-gold/40"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="cursor-pointer" />
                  Internal only (Admin + OM)
                </label>
                <button onClick={handleAddTimeline} disabled={!newTimelineMilestone.trim()}
                  className="px-4 py-2 bg-accent-gold text-black text-[10px] font-bold rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER ── */}
      {activeTab === "customer" && (
        <div className="space-y-4">
          {!customer ? (
            <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No customer data available.</div>
          ) : (
            <>
              {/* Customer card */}
              <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold text-xl font-heading shrink-0">
                    {customer.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-light font-heading text-foreground">{customer.full_name}</h2>
                    <p className="text-[10px] text-muted-foreground font-mono">Your Primary Contact · {req?.event_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Phone, label: "Phone", value: customer.phone_number, href: `tel:${customer.phone_number}` },
                    { icon: Mail, label: "Email", value: customer.email, href: `mailto:${customer.email}` },
                    { icon: MapPin, label: "Address", value: customer.address || "Not provided" },
                    { icon: Calendar, label: "Event Date", value: req ? formatDate(req.event_date) : "—" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="p-3.5 bg-background border border-border/50 rounded-xl flex items-start gap-3">
                        <Icon className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[8.5px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} className="text-xs font-semibold text-accent-gold hover:underline block mt-0.5 truncate">{item.value}</a>
                          ) : (
                            <p className="text-xs text-foreground mt-0.5 font-light">{item.value}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div className="flex gap-3 pt-2 border-t border-border/40">
                  <a href={`tel:${customer.phone_number}`} className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-[10px] font-bold rounded-xl hover:bg-accent-gold/20 transition">
                    <Phone className="w-3.5 h-3.5" /> Call Now
                  </a>
                  <a href={`mailto:${customer.email}`} className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-background border border-border/60 text-foreground text-[10px] font-bold rounded-xl hover:border-accent-gold/30 transition">
                    <Mail className="w-3.5 h-3.5" /> Send Email
                  </a>
                </div>
              </div>

              {/* Special requirements */}
              <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-3">
                <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Event Requirements</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-light">Guest Count</span>
                    <span className="font-semibold">{req?.guest_count} guests</span>
                  </div>
                  <div className="flex justify-between text-xs py-2">
                    <span className="text-muted-foreground font-light">Total Budget</span>
                    <span className="font-semibold text-accent-gold">₹{Number(req?.total_budget).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── VENDORS ── */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          {vendorAssignments.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No vendors assigned to this event by Admin yet.</div>
          ) : (
            vendorAssignments.map(va => {
              const coord = coordState[va.id] || { status: "Pending", note: "" };
              const vendorProfile = va.profiles;
              const arrivalColors: Record<string, string> = {
                "Pending":    "text-zinc-400   bg-zinc-500/10  border-zinc-500/25",
                "Confirmed":  "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                "In Transit": "text-blue-400   bg-blue-500/10  border-blue-500/25",
                "Arrived":    "text-emerald-400 bg-emerald-500/15 border-emerald-500/35",
                "Late":       "text-amber-400  bg-amber-500/10 border-amber-500/25",
                "No Show":    "text-red-400    bg-red-500/10   border-red-500/25",
              };
              return (
                <div key={va.id} className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent-gold">{va.categories?.name}</span>
                      <h3 className="text-base font-light font-heading text-foreground">{vendorProfile?.business_name || vendorProfile?.full_name || "Vendor"}</h3>
                      {vendorProfile?.full_name && vendorProfile.business_name && (
                        <p className="text-[10px] text-muted-foreground">{vendorProfile.full_name}</p>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${arrivalColors[coord.status] || arrivalColors["Pending"]}`}>{coord.status}</span>
                  </div>

                  {vendorProfile && (
                    <div className="flex gap-3">
                      <a href={`tel:${vendorProfile.phone_number}`} className="flex items-center gap-1.5 text-[10px] font-bold text-accent-gold hover:underline">
                        <Phone className="w-3 h-3" /> {vendorProfile.phone_number}
                      </a>
                      <a href={`mailto:${vendorProfile.email}`} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-accent-gold hover:underline">
                        <Mail className="w-3 h-3" /> Email
                      </a>
                    </div>
                  )}

                  {/* Coordination form */}
                  <div className="border-t border-border/40 pt-4 space-y-3">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Coordination</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Pending", "Confirmed", "In Transit", "Arrived", "Late", "No Show"].map(s => (
                        <button key={s} onClick={() => setCoordState(prev => ({ ...prev, [va.id]: { ...coord, status: s } }))}
                          className={`py-1 px-2.5 text-[8.5px] font-bold rounded-lg border transition cursor-pointer ${coord.status === s ? arrivalColors[s] : "bg-background border-border/50 text-muted-foreground hover:border-border"}`}
                        >{s}</button>
                      ))}
                    </div>
                    <textarea value={coord.note} onChange={e => setCoordState(prev => ({ ...prev, [va.id]: { ...coord, note: e.target.value } }))}
                      rows={2} placeholder="Log coordination note (e.g. Vendor arriving 30 min late, informed customer)..."
                      className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-gold/40"
                    />
                    <div className="flex justify-end">
                      <button onClick={() => handleVendorCoord(va.id)}
                        className="px-4 py-2 bg-background border border-border/60 hover:border-accent-gold/30 text-foreground text-[10px] font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Save Coordination
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
            <p className="text-[9.5px] text-amber-600 dark:text-amber-400 font-light">
              <span className="font-bold">Note:</span> You can coordinate with vendors but cannot approve, assign, or replace them. Contact Admin for vendor changes.
            </p>
          </div>
        </div>
      )}

      {/* ── CHECKLIST ── */}
      {activeTab === "checklist" && (
        <div className="space-y-5">
          {/* Progress */}
          <div className="p-5 bg-surface border border-border/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Execution Checklist</h3>
              <span className="text-xs font-bold font-mono text-foreground">{checklist.filter(c => c.is_completed).length} / {checklist.length}</span>
            </div>
            <div className="h-2 bg-border/40 rounded-full overflow-hidden">
              <div className={`h-full ${healthScore.bg} rounded-full transition-all duration-700`}
                style={{ width: `${checklist.length === 0 ? 0 : (checklist.filter(c => c.is_completed).length / checklist.length) * 100}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground">Health score: <span className={`font-bold ${healthScore.color}`}>{healthScore.label}</span> ({healthScore.score}/100)</p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {checklist.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">Accept the assignment first to seed the default checklist.</div>
            )}
            {checklist.map(item => (
              <div key={item.id}
                className={`flex items-center gap-4 p-4 bg-surface border rounded-xl transition cursor-pointer group ${item.is_completed ? "border-emerald-500/20 bg-emerald-500/3" : "border-border/60 hover:border-accent-gold/20"}`}
                onClick={() => handleToggleChecklist(item)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${item.is_completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border group-hover:border-accent-gold"}`}>
                  {item.is_completed && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${item.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.label}</span>
                  {item.completed_at && <p className="text-[8.5px] text-muted-foreground font-mono mt-0.5">{formatDate(item.completed_at)}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="flex gap-2">
            <input value={newChecklistLabel} onChange={e => setNewChecklistLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddChecklist()}
              placeholder="Add a checklist item..."
              className="flex-1 px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-gold/40"
            />
            <button onClick={handleAddChecklist} disabled={!newChecklistLabel.trim()}
              className="px-4 py-2.5 bg-accent-gold text-black text-[10px] font-bold rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No documents uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map(doc => {
                const typeColors: Record<string, string> = {
                  inspiration: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                  reference: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  venue: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  quotation: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  agreement: "text-red-400 bg-red-500/10 border-red-500/20",
                  summary: "text-accent-gold bg-accent-gold/10 border-accent-gold/20",
                  other: "text-muted-foreground bg-muted border-border",
                };
                return (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-surface border border-border/60 hover:border-accent-gold/30 rounded-xl transition group"
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${typeColors[doc.file_type] || typeColors["other"]}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-accent-gold transition">{doc.file_name}</p>
                      <p className="text-[8.5px] text-muted-foreground font-mono">{doc.file_type} · {formatDate(doc.created_at)}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transition shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
          <div className="p-3 bg-surface border border-border/50 rounded-xl">
            <p className="text-[9.5px] text-muted-foreground">To upload documents, use the Customer portal link or contact Admin. Document URLs are logged here automatically.</p>
          </div>
        </div>
      )}

      {/* ── NOTES ── */}
      {activeTab === "notes" && (
        <div className="space-y-5">
          <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
            <p className="text-[9.5px] text-violet-400 font-light">
              <span className="font-bold">Internal Notes</span> — These are private and never visible to customers or vendors.
            </p>
          </div>

          {/* Add note */}
          <div className="space-y-2">
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3}
              placeholder="Add an internal note (e.g. Customer requested extra flowers, Venue electricity issue, Vendor arriving late)..."
              className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-gold/40"
            />
            <div className="flex justify-end">
              <button onClick={handleAddNote} disabled={!newNote.trim()}
                className="px-4 py-2.5 bg-accent-gold text-black text-[10px] font-bold rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <StickyNote className="w-3.5 h-3.5" /> Save Note
              </button>
            </div>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {notes.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No notes yet. Add the first one above.</div>
            )}
            {notes.map(note => (
              <div key={note.id} className="p-4 bg-surface border border-border/60 rounded-2xl space-y-2 group">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-[8px] font-bold">
                      {note.profiles?.full_name.substring(0, 2).toUpperCase() || "OM"}
                    </span>
                    <span className="text-[9.5px] font-bold text-foreground">{note.profiles?.full_name || "You"}</span>
                  </div>
                  <span className="text-[8.5px] text-muted-foreground font-mono">{formatDate(note.created_at)}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-light">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <h3 className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Event Activity Stream</h3>
          {timeline.length === 0 && notes.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">No activity recorded yet.</div>
          ) : (
            <div className="relative space-y-0">
              {[
                ...timeline.map(t => ({ type: "timeline" as const, time: t.created_at, label: t.milestone_name, sub: t.profiles?.full_name, desc: t.description, internal: t.is_internal })),
                ...notes.map(n => ({ type: "note" as const, time: n.created_at, label: "Note Added", sub: n.profiles?.full_name, desc: n.content, internal: true })),
              ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).map((item, i, arr) => (
                <div key={i} className="flex gap-4 pb-5 relative">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 ${item.type === "note" ? "bg-violet-500/10 border-violet-500/40 text-violet-400" : "bg-accent-gold/10 border-accent-gold/40 text-accent-gold"}`}>
                      {item.type === "note" ? <StickyNote className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    </div>
                    {i < arr.length - 1 && <div className="w-0.5 bg-border/40 flex-1 mt-1" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      {item.internal && <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">Internal</span>}
                    </div>
                    {item.desc && <p className="text-[10.5px] text-muted-foreground font-light mt-0.5">{item.desc}</p>}
                    <p className="text-[8.5px] text-muted-foreground font-mono mt-1">{item.sub} · {formatDate(item.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETION REPORT ── */}
      {activeTab === "report" && (
        <div className="space-y-5">
          {initialReport ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-400">Completion Report Submitted</p>
                  <p className="text-[9.5px] text-emerald-400/70">{formatDate(initialReport.submitted_at)} · Pending Admin Review</p>
                </div>
              </div>
              {[
                { label: "Executive Summary", value: initialReport.executive_summary },
                { label: "Execution Notes", value: initialReport.execution_notes },
                { label: "Issues Faced", value: initialReport.issues_faced },
                { label: "Vendor Performance", value: initialReport.vendor_performance },
                { label: "Lessons Learned", value: initialReport.lessons_learned },
              ].filter(r => r.value).map((r, i) => (
                <div key={i} className="bg-surface border border-border/60 rounded-2xl p-5 space-y-2">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">{r.label}</p>
                  <p className="text-xs text-foreground font-light leading-relaxed">{r.value}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 p-4 bg-surface border border-border/60 rounded-2xl">
                <Star className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Customer Satisfaction</p>
                  <p className="text-lg font-bold font-heading text-accent-gold">{initialReport.customer_satisfaction}<span className="text-sm text-muted-foreground font-light">/10</span></p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-accent-gold/5 border border-accent-gold/20 rounded-xl">
                <p className="text-[9.5px] text-accent-gold font-light">Submit this report after the event is complete. Admin will review before closing the case.</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: "executiveSummary", label: "Executive Summary", placeholder: "Brief overview of how the event went..." },
                  { key: "executionNotes", label: "Execution Notes", placeholder: "Detailed notes about the execution process..." },
                  { key: "issuesFaced", label: "Issues Faced", placeholder: "Any problems encountered and how they were resolved..." },
                  { key: "vendorPerformance", label: "Vendor Performance", placeholder: "Notes on each vendor's performance..." },
                  { key: "lessonsLearned", label: "Lessons Learned", placeholder: "What can be improved for future events..." },
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">{field.label}</label>
                    <textarea rows={3} placeholder={field.placeholder}
                      value={(report as any)[field.key]}
                      onChange={e => setReport(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-accent-gold/40"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Customer Satisfaction (1–10)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={10} value={report.customerSatisfaction}
                      onChange={e => setReport(prev => ({ ...prev, customerSatisfaction: Number(e.target.value) }))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xl font-heading font-light text-accent-gold w-8 text-center">{report.customerSatisfaction}</span>
                  </div>
                </div>

                <button onClick={handleSubmitReport} disabled={isPending || !report.executiveSummary.trim()}
                  className="w-full py-3 bg-accent-gold text-black text-xs font-bold rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Completion Report — Notify Admin
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
