"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ShieldCheck, Clock, Calendar, MapPin, Users, Info, 
  CheckCircle2, AlertCircle, Phone, Mail, Upload, Trash2, Download, 
  FileText, ListTodo, Send, MessageSquare, Plus, ChevronRight, X,
  Check, Play, Award, ClipboardCheck
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { uploadVendorDocument, deleteVendorDocument, submitCompletionReport } from "@/app/vendor/actions";

interface Profile {
  full_name: string;
  phone_number: string;
  email: string;
}

interface EventAssignment {
  id: string;
  status: string;
  profiles: Profile | null;
}

interface ServiceItem {
  name: string;
}

interface RequestItem {
  quantity: number;
  unit_price: number;
  pricing_type: string;
  service_items: ServiceItem | null;
}

interface Timeline {
  id: string;
  milestone_name: string;
  description: string;
  is_internal: boolean;
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
  uploaded_by: string | null;
}

interface Booking {
  id: string;
  status: string;
  created_at: string;
  category_id: string;
  categories: { name: string } | null;
  event_requests: {
    id: string;
    event_type: string;
    event_date: string;
    location: string;
    guest_count: number;
    status: string;
    event_assignments: EventAssignment[];
    request_items: RequestItem[];
    timelines: Timeline[];
    documents: Document[];
  } | null;
}

interface EventWorkspaceClientProps {
  booking: Booking;
  userId: string;
}

const CHECKLIST_ITEMS = [
  { key: "ready", label: "Equipment Checked & Ready" },
  { key: "packed", label: "Materials & Layout Packed" },
  { key: "travel", label: "Travel & Logistical Transit Confirmed" },
  { key: "reached", label: "Reached Venue On-Site" },
  { key: "setup", label: "Setup & Staging Complete" },
  { key: "started", label: "Service Execution Started" },
  { key: "completed", label: "Service Execution Completed" },
  { key: "photos", label: "Verification Photos Captured" },
  { key: "submitted", label: "Completion Report Submitted" }
];

export default function EventWorkspaceClient({
  booking,
  userId,
}: EventWorkspaceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "checklist" | "coordinator" | "documents" | "report" | "timeline">("overview");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`vendor_checklist_${booking.id}`);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, [booking.id]);

  const handleToggleChecklist = (key: string) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`vendor_checklist_${booking.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const checklistProgress = useMemo(() => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
  }, [checkedItems]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileType, setUploadFileType] = useState("reference");
  const [isUploading, setIsUploading] = useState(false);

  const [summary, setSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const req = booking.event_requests;
  if (!req) return null;

  const om = req.event_assignments?.[0]?.profiles;

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setError(null);

    try {
      await uploadVendorDocument(req.id, uploadFile.name, uploadFile, uploadFileType);
      setSuccess("Document uploaded successfully to event files.");
      setShowUploadModal(false);
      setUploadFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document reference?")) return;
    setError(null);
    try {
      await deleteVendorDocument(docId, req.id);
      setSuccess("Document reference removed.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete document.");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return setError("Please enter a summary notes log.");

    setIsSubmittingReport(true);
    setError(null);
    setSuccess(null);

    try {
      const photoUrls = photoUrl.trim() ? [photoUrl.trim()] : [];
      await submitCompletionReport(req.id, `${summary}\n\nIssues: ${issues || "None"}\n\nNotes: ${notes || "None"}`, photoUrls);
      
      setSuccess("Completion report successfully submitted.");
      const updated = { ...checkedItems, completed: true, photos: true, submitted: true };
      localStorage.setItem(`vendor_checklist_${booking.id}`, JSON.stringify(updated));
      setCheckedItems(updated);
      
      setSummary("");
      setIssues("");
      setNotes("");
      setPhotoUrl("");
      setActiveTab("overview");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit completion report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getCountdownDays = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Staging Completed";
    if (diffDays === 0) return "Event is Today!";
    return `${diffDays} days remaining`;
  };

  const categoryItems = req.request_items.filter(
    (item) => item.service_items?.subcategories?.category_id === booking.category_id
  );

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <a 
          href="/vendor/bookings" 
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Assignments
        </a>

        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-xl shadow-sm self-start select-none">
          <ShieldCheck className="w-4 h-4" /> Confirmed File
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Event Title Banner ── */}
      <div className="border-b border-border/40 pb-6">
        <span className="text-[9px] uppercase tracking-widest font-extrabold text-accent-gold">{booking.categories?.name} Staging Workspace</span>
        <h1 className="text-3xl font-light font-heading text-foreground mt-1 leading-tight">{req.event_type}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-[10.5px] text-muted-foreground font-mono mt-3.5">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent-gold" /> {req.event_date}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent-gold" /> {req.location}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent-gold" /> {req.guest_count} Attendees</span>
        </div>
      </div>

      {/* ── Workspace Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left column (8/12 cols): Tab switch boards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-row overflow-x-auto gap-2 border-b border-border/45 pb-3.5 scrollbar-none whitespace-nowrap">
            {[
              { key: "overview", label: "Overview" },
              { key: "checklist", label: "Checklist" },
              { key: "coordinator", label: "Coordinator" },
              { key: "documents", label: "Documents" },
              { key: "report", label: "Report" },
              { key: "timeline", label: "Timeline" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 text-[10px] font-bold rounded-xl border transition duration-200 cursor-pointer uppercase tracking-wider ${
                  activeTab === tab.key
                    ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold font-black"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-1">
            {/* Tab A: Overview */}
            {activeTab === "overview" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Deliverables Specification</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Project Date</span>
                    <p className="text-sm font-semibold text-foreground font-mono">{req.event_date}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Countdown</span>
                    <p className="text-sm font-bold text-accent-gold font-mono uppercase tracking-wider">{getCountdownDays(req.event_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Staging Venue</span>
                    <p className="text-sm font-semibold text-foreground truncate">{req.location}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Attendance Scope</span>
                    <p className="text-sm font-semibold text-foreground font-mono">{req.guest_count} People</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border/40">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Service Deliverables</span>
                  <div className="space-y-2">
                    {categoryItems.map((item, idx) => (
                      <div key={idx} className="p-4 bg-background border border-border/60 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{item.service_items?.name}</span>
                        <span className="font-mono text-muted-foreground text-[10px]">quantity: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab B: Checklist */}
            {activeTab === "checklist" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Execution progress</h3>
                    <p className="text-[10px] text-muted-foreground font-light">Check off stages as staging assembly advances.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold/10 px-3 py-1 rounded-lg border border-accent-gold/20">
                    {checklistProgress}% Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = !!checkedItems[item.key];
                    return (
                      <div 
                        key={item.key}
                        onClick={() => handleToggleChecklist(item.key)}
                        className={`p-4 border rounded-2xl flex items-center gap-3 cursor-pointer transition duration-200 ${
                          isChecked 
                            ? "bg-accent-gold/[0.03] border-accent-gold/30 text-foreground" 
                            : "bg-background border-border text-muted-foreground hover:border-accent-gold/15"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                          isChecked ? "bg-accent-gold border-accent-gold text-black" : "bg-transparent border-border"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-[11.5px] font-bold select-none leading-tight">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab C: Coordinator details */}
            {activeTab === "coordinator" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Assigned coordinator</h3>
                
                {om ? (
                  <div className="space-y-5 pt-1 text-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-accent-gold font-bold text-base shadow-sm">
                        {om.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground">{om.full_name}</h4>
                        <p className="text-[9px] uppercase tracking-wider text-accent-gold font-bold font-mono">Operational Staging Coordinator</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                      The Operational Manager oversees coordination, schedule calendars, templates, and payments. Vetted partners communicate exclusively with their assigned manager. Never contact the end customers directly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40 font-mono text-[10.5px]">
                      <a href={`tel:${om.phone_number}`} className="flex items-center gap-3 p-3.5 bg-background border border-border/60 rounded-xl hover:border-accent-gold/25 text-muted-foreground hover:text-foreground transition">
                        <Phone className="w-4 h-4 text-accent-gold shrink-0" />
                        <span>{om.phone_number}</span>
                      </a>
                      <a href={`mailto:${om.email}`} className="flex items-center gap-3 p-3.5 bg-background border border-border/60 rounded-xl hover:border-accent-gold/25 text-muted-foreground hover:text-foreground transition truncate">
                        <Mail className="w-4 h-4 text-accent-gold shrink-0" />
                        <span className="truncate">{om.email}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground font-light flex flex-col items-center justify-center gap-3 bg-background/40 rounded-2xl border border-dashed border-border/85">
                    <Users className="w-8 h-8 text-muted-foreground/35 animate-pulse" />
                    <p className="max-w-[220px] leading-relaxed mx-auto">
                      Operational coordinator partner allocation is currently pending.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab D: Documents Library */}
            {activeTab === "documents" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Documents library</h3>
                  
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-accent-gold to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>

                <div className="space-y-4">
                  {req.documents && req.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {req.documents.map((doc) => {
                        const isOwnDoc = doc.uploaded_by === userId;
                        return (
                          <div 
                            key={doc.id} 
                            className="p-4 bg-background border border-border rounded-2xl flex items-center justify-between gap-4 hover:border-accent-gold/15 transition"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">{doc.file_name}</span>
                              <span className="text-[8.5px] uppercase tracking-wider text-accent-gold mt-1 block font-bold font-mono">
                                {doc.file_type} · {formatDate(doc.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={doc.file_url}
                                className="p-2 border border-border hover:bg-surface-raised rounded-xl text-muted-foreground hover:text-foreground transition"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              {isOwnDoc && (
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-2 border border-red-950/20 hover:bg-red-950/15 rounded-xl text-red-400 hover:text-red-300 transition cursor-pointer"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-muted-foreground font-light border border-dashed border-border/80 bg-background/25 rounded-2xl">
                      No document files or layouts reference maps cataloged yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab E: Completion Report */}
            {activeTab === "report" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Completion report</h3>
                  <p className="text-[10px] text-muted-foreground font-light">Submit detailed execution reports for vetting approvals.</p>
                </div>

                <form onSubmit={handleReportSubmit} className="space-y-5 text-xs">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Staging Summary</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Photography session completed. 350 high resolution files logged for sync."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Logistical Issues (If any)</label>
                      <input
                        type="text"
                        placeholder="Stage power load delayed starting setup by 10m"
                        value={issues}
                        onChange={(e) => setIssues(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Verification Image Link</label>
                      <input
                        type="text"
                        placeholder="e.g. Storage link copy"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Additional Disassembly Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Staging clean up logs..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="px-6 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                    >
                      {isSubmittingReport ? "Publishing Summary Report..." : "Submit Completion Report"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab F: Project Timeline milestones */}
            {activeTab === "timeline" && (
              <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-6 shadow-sm animate-scale-in">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Milestone stages</h3>
                
                {req.timelines && req.timelines.length > 0 ? (
                  <div className="space-y-6 relative pt-2">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/40" />
                    {req.timelines.map((mile) => (
                      <div key={mile.id} className="flex gap-4 pl-6 relative">
                        <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-background bg-accent-gold" />
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-foreground">{mile.milestone_name}</h4>
                          <p className="text-[11px] text-muted-foreground font-light">{mile.description}</p>
                          <span className="text-[8px] text-zinc-500 font-mono block pt-0.5">{formatDate(mile.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground font-light border border-dashed border-border/85 bg-background/25 rounded-2xl">
                    No timeline milestones configured on this event file request.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column (4/12 cols): Circular dial indicators */}
        <div className="lg:col-span-4 space-y-6 w-full lg:sticky lg:top-24">
          <div className="p-6 rounded-[32px] bg-surface border border-border/80 shadow-sm flex flex-col items-center justify-between text-center gap-5">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground block font-mono">Execution Score</span>
              
              <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-border/40" strokeWidth="5.5" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="currentColor" 
                    className="text-accent-gold" 
                    strokeWidth="6" 
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - checklistProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-base font-bold font-mono">
                  {checklistProgress}%
                </div>
              </div>
            </div>

            <div className="w-full border-t border-border/40 pt-4 text-[10.5px] text-muted-foreground flex justify-between font-mono">
              <span>Remaining Checklist:</span>
              <span className="font-bold text-foreground">
                {CHECKLIST_ITEMS.length - Object.values(checkedItems).filter(Boolean).length} / {CHECKLIST_ITEMS.length}
              </span>
            </div>
          </div>

          <div className="p-5.5 rounded-[24px] bg-surface border border-border/80 shadow-sm text-xs space-y-2.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-widest block font-mono">Operational standards</span>
            <p className="text-muted-foreground font-light leading-relaxed">
              Verify setup values against category specs. Maintain direct updates in the dashboard workspace to ensure dispatch calibration.
            </p>
          </div>
        </div>

      </div>

      {/* ─── UPLOAD DOCUMENT MODAL ─── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface border border-border/80 rounded-[32px] max-w-md w-full overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">
                Upload Staging attachment
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1.5 rounded-lg hover:bg-surface-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-5 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Select Staging Attachment</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-accent-gold/10 file:text-accent-gold"
                />
                {uploadFile && (
                  <p className="text-[9px] text-muted-foreground font-mono mt-1.5 truncate">{uploadFile.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Attachment Type</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground cursor-pointer text-xs"
                >
                  <option value="reference">Reference Document</option>
                  <option value="venue">Venue Information</option>
                  <option value="summary">Completion Attachment</option>
                </select>
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4.5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
                >
                  {isUploading ? "Uploading..." : "Save Attachment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
