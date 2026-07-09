"use client";

import { useState, useTransition } from "react";
import {
  dispatchLeadsToVendors,
  approveVendorAssignment,
  updateRequestStatus,
  lockPlanningAndFinalize,
  assignOperationalManager,
  reassignOperationalManager,
} from "../actions";
import { 
  User, Calendar, MapPin, Users, Shield, Clock, BookOpen, 
  Send, CheckCircle2, MessageSquare, FileText, Activity, AlertTriangle, 
  ArrowRight, ShieldCheck, UserX, UserCheck, RefreshCw, Layers, Briefcase
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_name: string | null;
  address: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface GroupedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  pricingType: string;
  lineTotal: number;
}

interface CategoryGroup {
  category: Category;
  items: GroupedItem[];
  mappedVendors: Profile[];
  assignments: {
    id: string;
    vendor_id: string;
    status: string;
    profiles: {
      full_name: string;
      phone_number: string;
      email: string;
      business_name: string | null;
    } | null;
  }[];
}

interface OperationalManager {
  id: string;
  employee_id: string;
  designation: string;
  availability_status: string;
  employment_status: string;
  current_workload: number;
  performance_score: number;
  completion_rate: number;
  full_name: string;
  phone_number: string;
  email: string;
}

interface OMAssignment {
  id: string;
  assigned_operational_manager_id: string;
  assignment_date: string;
  status: string;
  handover_notes: string | null;
  internal_notes: string | null;
  expected_completion: string | null;
  escalation_level: number;
  escalation_reason: string | null;
  reassignment_history: {
    previous_manager_id: string;
    new_manager_id: string;
    reassigned_by: string;
    reassigned_at: string;
    reason: string;
    internal_notes: string;
  }[];
  profiles: {
    id: string;
    full_name: string;
    phone_number: string;
    email: string;
  } | null;
}

interface TimelineLog {
  id: string;
  milestone_name: string;
  description: string;
  is_internal: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface MatchmakerProps {
  requestId: string;
  currentStatus: string;
  customerProfile: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
  };
  groups: CategoryGroup[];
  omAssignments: OMAssignment[];
  availableOMs: OperationalManager[];
  timelineLogs: TimelineLog[];
}

export default function Matchmaker({
  requestId,
  currentStatus,
  customerProfile,
  groups,
  omAssignments,
  availableOMs,
  timelineLogs,
}: MatchmakerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(groups[0]?.category.id || "");
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({}); // categoryId -> vendorIds[]
  const [activeTab, setActiveTab] = useState<"vendors" | "timeline" | "documents">("vendors");
  const [timelineFilter, setTimelineFilter] = useState<"internal" | "customer">("internal");
  
  // Assignment Form State
  const [selectedOMId, setSelectedOMId] = useState("");
  const [expectedCompletion, setExpectedCompletion] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  
  // Reassignment Form State
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignOMId, setReassignOMId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [reassignNotes, setReassignNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activeGroup = groups.find((g) => g.category.id === activeCategoryId) || groups[0];
  const activeOMAssignment = omAssignments?.[0]; // Fetch active assignment if exists

  // Calculate if all category groups have an approved (finalized) vendor
  const allCategoriesFinalized = groups.every((g) => 
    g.assignments.some((asg) => asg.status === "Approved")
  );

  const handleStatusChange = async (newStatus: string) => {
    setLoadingAction("status");
    startTransition(async () => {
      try {
        await updateRequestStatus(requestId, newStatus);
        setStatus(newStatus);
      } catch (err) {
        alert("Failed to update status.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleVendorToggle = (categoryId: string, vendorId: string) => {
    setSelectedVendors((prev) => {
      const list = prev[categoryId] || [];
      const updated = list.includes(vendorId)
        ? list.filter((id) => id !== vendorId)
        : [...list, vendorId];
      return { ...prev, [categoryId]: updated };
    });
  };

  const handleDispatch = async (categoryId: string) => {
    const vendorIds = selectedVendors[categoryId] || [];
    if (vendorIds.length === 0) {
      alert("Select at least one vendor to dispatch invitations.");
      return;
    }

    setLoadingAction(`dispatch-${categoryId}`);
    startTransition(async () => {
      try {
        await dispatchLeadsToVendors(requestId, categoryId, vendorIds);
        alert("Vendor invitations sent successfully!");
        setSelectedVendors((prev) => ({ ...prev, [categoryId]: [] }));
        window.location.reload();
      } catch (err) {
        alert("Failed to dispatch leads.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleApprove = async (assignmentId: string) => {
    if (!confirm("Finalize this vendor? This will reject all other pending invitations for this category.")) {
      return;
    }

    setLoadingAction(`approve-${assignmentId}`);
    startTransition(async () => {
      try {
        await approveVendorAssignment(requestId, assignmentId);
        alert("Vendor finalized successfully!");
        window.location.reload();
      } catch (err) {
        alert("Failed to finalize vendor.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleLockPlanning = async () => {
    if (!confirm("Lock event planning? This will prevent vendor changes and flag the Event Case as Ready For Execution.")) {
      return;
    }

    setLoadingAction("lock-planning");
    startTransition(async () => {
      try {
        await lockPlanningAndFinalize(requestId);
        setStatus("Ready For Execution");
        alert("Event planning locked successfully! Operational Manager assignment is now unlocked.");
        window.location.reload();
      } catch (err) {
        alert("Failed to lock planning.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleAssignOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOMId) {
      alert("Please select an Operational Manager.");
      return;
    }

    setLoadingAction("assign-om");
    startTransition(async () => {
      try {
        await assignOperationalManager(requestId, selectedOMId, handoverNotes, expectedCompletion);
        alert("Event assignment created successfully!");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to assign Operational Manager.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleReassignOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignOMId) {
      alert("Please select a new Operational Manager.");
      return;
    }
    if (!reassignReason.trim()) {
      alert("Please enter a reassignment reason.");
      return;
    }

    setLoadingAction("reassign-om");
    startTransition(async () => {
      try {
        await reassignOperationalManager(activeOMAssignment.id, reassignOMId, reassignReason, reassignNotes);
        alert("Event successfully reassigned!");
        setIsReassigning(false);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to reassign Operational Manager.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const assignmentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-500 bg-amber-500/5 border-amber-500/10";
      case "Accepted":
        return "text-pink-500 bg-pink-500/5 border-pink-500/10";
      case "Approved":
      case "Finalized":
        return "text-emerald-500 bg-emerald-500/5 border-emerald-500/10";
      case "Rejected":
        return "text-red-500 bg-red-500/5 border-red-500/10";
      default:
        return "text-muted-foreground bg-muted border-border/50";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Level Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Status */}
        <div className="space-y-6">
          
          {/* Customer Metadata Card */}
          <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-accent-gold" />
              <span>Customer Details</span>
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Contact Name</span>
                <div className="font-bold text-foreground mt-1">{customerProfile.fullName}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Phone</span>
                <div className="font-semibold text-foreground mt-1">{customerProfile.phone}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</span>
                <div className="font-mono text-muted-foreground mt-1 truncate">{customerProfile.email}</div>
              </div>
              <div className="pt-3.5 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Event Venue</span>
                <div className="text-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span>{customerProfile.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status Controls */}
          <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-gold" />
              <span>Workflow Controls</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="status-selector" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Event Case Status
                </label>
                <select
                  id="status-selector"
                  value={status}
                  disabled={loadingAction === "status"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none text-xs text-foreground font-semibold"
                >
                  <option value="Request Submitted">Submitted</option>
                  <option value="Under Admin Review">Under Review</option>
                  <option value="Planning">Planning</option>
                  <option value="Vendor Selection In Progress">Vendor Selection In Progress</option>
                  <option value="Sent to Vendors">Sent to Vendors</option>
                  <option value="Vendor Accepted">Vendor Finalization In Progress</option>
                  <option value="Vendor Approved by Admin">Vendor Finalized</option>
                  <option value="Ready For Execution">Ready For Execution</option>
                  <option value="Operational Manager Assigned">OM Assigned</option>
                  <option value="Preparation">Preparation</option>
                  <option value="Execution">Execution</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons based on pipeline stage */}
              {(status !== "Ready For Execution" && 
                status !== "Operational Manager Assigned" && 
                status !== "Preparation" && 
                status !== "Execution" && 
                status !== "Completed" && 
                status !== "Closed") && (
                <button
                  type="button"
                  onClick={handleLockPlanning}
                  disabled={!allCategoriesFinalized || loadingAction === "lock-planning"}
                  className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-600/10"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Lock Planning & Finalize</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Selected Services */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-gold" />
            <span>Selected Service List</span>
          </h3>

          <div className="space-y-4">
            {groups.map((group) => {
              const isGroupApproved = group.assignments.some((asg) => asg.status === "Approved");
              return (
                <div 
                  key={group.category.id} 
                  onClick={() => setActiveCategoryId(group.category.id)}
                  className={`p-3.5 border rounded-xl transition cursor-pointer relative ${
                    activeCategoryId === group.category.id 
                      ? "bg-accent-gold/5 border-accent-gold" 
                      : "bg-background/40 border-border hover:border-accent-gold/25"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      {group.category.name}
                      {isGroupApproved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Finalized" />}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-accent-gold">
                      ₹{group.items.reduce((acc, c) => acc + c.lineTotal, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-2 border-l border-border">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-muted-foreground font-medium">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-mono">₹{item.lineTotal.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Intelligent Vendor Assignment & Operational Manager Assignment */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          
          {/* Section swaps between Vendor invites & Workforce OM assignment based on pipeline status */}
          {status === "Ready For Execution" || 
           status === "Operational Manager Assigned" || 
           status === "Preparation" || 
           status === "Execution" || 
           status === "Completed" || 
           status === "Closed" ? (
            
            // ── SECTION: OPERATIONAL MANAGER WORKFORCE ENGAGEMENT ──
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent-gold" />
                <span>Event Assignment Workforce</span>
              </h3>

              {!activeOMAssignment ? (
                // ── OM ASSIGNMENT FORM ──
                <form onSubmit={handleAssignOM} className="space-y-4 text-xs">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-[10px] text-rose-400 rounded-xl leading-relaxed">
                    Planning locked. Assign an available Operational Manager to execute event.
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="om-select" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Available Managers
                    </label>
                    <select
                      id="om-select"
                      value={selectedOMId}
                      onChange={(e) => setSelectedOMId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none text-foreground font-semibold"
                    >
                      <option value="">Select Manager...</option>
                      {availableOMs.map((om) => (
                        <option key={om.id} value={om.id}>
                          {om.full_name} ({om.designation}) · WL: {om.current_workload} active
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOMId && (() => {
                    const om = availableOMs.find((o) => o.id === selectedOMId);
                    if (!om) return null;
                    const wlPct = Math.min(100, (om.current_workload / 5) * 100);
                    return (
                      <div className="p-3.5 bg-background border border-border rounded-xl space-y-2.5 text-[10px]">
                        <h4 className="font-bold text-foreground">Workforce Capacity Profile</h4>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Employee ID: <strong className="text-foreground">{om.employee_id}</strong></div>
                          <div>Designation: <strong className="text-foreground">{om.designation}</strong></div>
                          <div>Workload: <strong className="text-foreground">{om.current_workload} events ({wlPct}%)</strong></div>
                          <div>Performance: <strong className="text-foreground">{om.performance_score}/5.0</strong></div>
                          <div>Completion Rate: <strong className="text-foreground">{om.completion_rate}%</strong></div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1.5">
                    <label htmlFor="completion-date" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Expected Completion Date
                    </label>
                    <input
                      id="completion-date"
                      type="date"
                      value={expectedCompletion}
                      onChange={(e) => setExpectedCompletion(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none text-foreground font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes-handover" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Handover Notes
                    </label>
                    <textarea
                      id="notes-handover"
                      placeholder="Add standard handover operational guidelines, client expectations..."
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      className="w-full h-20 px-3 py-2 bg-background border border-border rounded-xl focus:outline-none text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction === "assign-om" || !selectedOMId}
                    className="w-full py-2 bg-accent-gold text-black font-bold rounded-xl text-xs hover:scale-[1.01] transition cursor-pointer disabled:opacity-50"
                  >
                    {loadingAction === "assign-om" ? "Assigning..." : "Assign Operational Manager"}
                  </button>
                </form>
              ) : (
                // ── OM ASSIGNMENT VIEWER & REASSIGNMENT ──
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-background border border-border rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{activeOMAssignment.profiles?.full_name}</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Assigned Operational Manager</p>
                      </div>
                      <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${assignmentStatusColor(activeOMAssignment.status)}`}>
                        {activeOMAssignment.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                      <div>Assignment Date: <span className="text-foreground font-semibold">{formatDate(activeOMAssignment.assignment_date)}</span></div>
                      {activeOMAssignment.expected_completion && (
                        <div>Expected Completion: <span className="text-foreground font-semibold">{formatDate(activeOMAssignment.expected_completion)}</span></div>
                      )}
                      {activeOMAssignment.escalation_level > 0 && (
                        <div className="text-red-500 font-bold flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Escalation Level {activeOMAssignment.escalation_level}: {activeOMAssignment.escalation_reason}</span>
                        </div>
                      )}
                    </div>

                    {activeOMAssignment.handover_notes && (
                      <div className="pt-2">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">Handover Notes</span>
                        <p className="p-2.5 bg-surface border border-border/50 rounded-lg text-foreground mt-1 text-[10px] italic leading-relaxed">
                          {activeOMAssignment.handover_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reassignment Form Toggler */}
                  {!isReassigning ? (
                    <button
                      type="button"
                      onClick={() => setIsReassigning(true)}
                      className="w-full py-2 border border-border hover:border-accent-gold hover:text-accent-gold text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reassign Manager</span>
                    </button>
                  ) : (
                    // ── REASSIGNMENT FORM ──
                    <form onSubmit={handleReassignOM} className="p-4 bg-background border border-border rounded-xl space-y-3.5 animate-scale-in">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Reassign Operational Manager</h4>
                      
                      <div className="space-y-1">
                        <label htmlFor="reassign-om" className="text-[9px] font-bold text-muted-foreground uppercase">New Manager</label>
                        <select
                          id="reassign-om"
                          value={reassignOMId}
                          onChange={(e) => setReassignOMId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg focus:outline-none text-xs text-foreground font-semibold"
                        >
                          <option value="">Select New OM...</option>
                          {availableOMs
                            .filter((om) => om.id !== activeOMAssignment.assigned_operational_manager_id)
                            .map((om) => (
                              <option key={om.id} value={om.id}>{om.full_name}</option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reassign-reason" className="text-[9px] font-bold text-muted-foreground uppercase">Reason for Reassignment</label>
                        <input
                          id="reassign-reason"
                          type="text"
                          placeholder="e.g. Schedule Conflict, Workload adjustment..."
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg focus:outline-none text-xs text-foreground"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reassign-notes" className="text-[9px] font-bold text-muted-foreground uppercase">Internal Transfer Notes</label>
                        <textarea
                          id="reassign-notes"
                          placeholder="Handoff checklist, transfer details..."
                          value={reassignNotes}
                          onChange={(e) => setReassignNotes(e.target.value)}
                          className="w-full h-14 px-2.5 py-1.5 bg-surface border border-border rounded-lg focus:outline-none text-xs text-foreground"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReassigning(false)}
                          className="flex-1 py-1.5 border border-border rounded-lg text-muted-foreground text-xxs font-bold hover:bg-surface-raised cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loadingAction === "reassign-om" || !reassignOMId}
                          className="flex-1 py-1.5 bg-accent-gold text-black rounded-lg text-xxs font-bold hover:scale-[1.01] transition cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reassignment History Log */}
                  {activeOMAssignment.reassignment_history?.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Reassignment Trail</h5>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {activeOMAssignment.reassignment_history.map((hist, idx) => (
                          <div key={idx} className="p-2.5 bg-background border border-border/50 rounded-xl space-y-1 text-[9px] leading-relaxed">
                            <div className="flex justify-between text-muted-foreground font-semibold">
                              <span>Reassigned Log</span>
                              <span>{formatDate(hist.reassigned_at)}</span>
                            </div>
                            <div>Reason: <strong className="text-foreground">{hist.reason}</strong></div>
                            {hist.internal_notes && <div className="text-muted-foreground">Notes: {hist.internal_notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          ) : (
            
            // ── SECTION: VENDOR INVITATIONS MATCHMAKER ──
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-gold" />
                <span>Vendor Selection Console</span>
              </h3>

              {activeGroup ? (
                <div className="space-y-5">
                  <div className="p-3 bg-background border border-border rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                    Showing verified suppliers matching category: <strong className="text-accent-gold font-bold">{activeGroup.category.name}</strong>
                  </div>

                  {/* Active Vendor Invitations */}
                  {activeGroup.assignments.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Invitations Sent</h5>
                      <div className="space-y-2.5 divide-y divide-border/50">
                        {activeGroup.assignments.map((asg) => {
                          const showApprove = asg.status === "Accepted";
                          return (
                            <div key={asg.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-[10px] gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-foreground truncate">
                                  {asg.profiles?.business_name || asg.profiles?.full_name}
                                </div>
                                <div className="text-muted-foreground mt-0.5 text-[9px]">{asg.profiles?.phone_number}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 border rounded-md text-[8px] font-bold uppercase tracking-wider ${assignmentStatusColor(asg.status)}`}>
                                  {asg.status}
                                </span>
                                {showApprove && (
                                  <button
                                    onClick={() => handleApprove(asg.id)}
                                    disabled={loadingAction === `approve-${asg.id}`}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px] cursor-pointer"
                                  >
                                    Finalize
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available registered category vendors */}
                  <div className="space-y-2.5">
                    <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Send Vendor Invitations</h5>
                    {activeGroup.mappedVendors.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 italic">No registered vendors in this category.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {activeGroup.mappedVendors.map((vendor) => {
                          const isAssigned = activeGroup.assignments.some((a) => a.vendor_id === vendor.id);
                          const isSelected = (selectedVendors[activeGroup.category.id] || []).includes(vendor.id);

                          return (
                            <div
                              key={vendor.id}
                              onClick={() => !isAssigned && handleVendorToggle(activeGroup.category.id, vendor.id)}
                              className={`p-2.5 border rounded-xl flex items-center justify-between transition cursor-pointer select-none text-[10px] ${
                                isAssigned
                                  ? "bg-muted/30 opacity-55 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-accent-gold/5 border-accent-gold/45"
                                  : "bg-background border-border hover:border-accent-gold/25"
                              }`}
                            >
                              <div>
                                <div className="font-bold text-foreground">{vendor.business_name || vendor.full_name}</div>
                                <div className="text-muted-foreground text-[9px] mt-0.5">Owner: {vendor.full_name}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected || isAssigned}
                                disabled={isAssigned}
                                onChange={() => {}}
                                className="rounded text-accent-gold focus:ring-accent-gold bg-background border-border h-3.5 w-3.5 cursor-pointer disabled:opacity-50"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dispatch triggers */}
                  <button
                    type="button"
                    onClick={() => handleDispatch(activeGroup.category.id)}
                    disabled={
                      loadingAction === `dispatch-${activeGroup.category.id}` || 
                      (selectedVendors[activeGroup.category.id] || []).length === 0
                    }
                    className="w-full py-2 bg-accent-gold text-black font-bold rounded-xl text-xs hover:scale-[1.01] transition disabled:opacity-55 cursor-pointer"
                  >
                    {loadingAction === `dispatch-${activeGroup.category.id}` ? "Dispatching..." : "Send Category Invitations"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Select a category on the left to review vendor options.</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Section: Timelines, Comments, Documents, Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline & Activity Log (Left & Center) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-gold" />
              <span>Dual Milestone Timelines</span>
            </h3>

            {/* Timeline Filter Tabs */}
            <div className="flex gap-2 p-0.5 bg-background border border-border rounded-xl text-[10px]">
              <button
                type="button"
                onClick={() => setTimelineFilter("internal")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timelineFilter === "internal" ? "bg-surface text-accent-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Internal Timeline (Admin/OM)
              </button>
              <button
                type="button"
                onClick={() => setTimelineFilter("customer")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timelineFilter === "customer" ? "bg-surface text-accent-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Customer Timeline (Public)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {timelineLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No timeline logs recorded for this event.
              </div>
            ) : (() => {
              const filteredTimeline = timelineLogs.filter((log) => 
                timelineFilter === "internal" ? true : !log.is_internal
              );

              if (filteredTimeline.length === 0) {
                return (
                  <p className="text-xs text-muted-foreground text-center py-6">No public milestones logged yet.</p>
                );
              }

              return (
                <div className="relative border-l border-border/70 ml-4 pl-6 space-y-5 py-2">
                  {filteredTimeline.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Node dot */}
                      <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm ${
                        log.is_internal 
                          ? "bg-purple-600 shadow-purple-500/50" 
                          : "bg-emerald-500 shadow-emerald-500/50"
                      }`} />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                          <span>{formatDate(log.created_at)}</span>
                          {log.is_internal && (
                            <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                              Internal
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-foreground">{log.milestone_name}</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xl">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Documents & Invoices (Right) */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-gold" />
            <span>Event Documentation</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-accent-gold/20 transition group">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent-gold" />
                <div>
                  <div className="font-bold text-foreground">Estimated Invoice.pdf</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Budget Specifications</div>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold">View</span>
            </div>

            <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-accent-gold/20 transition group">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent-gold" />
                <div>
                  <div className="font-bold text-foreground">Operational Checklist.pdf</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Execution Milestones</div>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold">View</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
