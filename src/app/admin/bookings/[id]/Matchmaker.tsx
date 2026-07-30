"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  dispatchLeadsToVendors,
  approveVendorAssignment,
  updateRequestStatus,
  lockPlanningAndFinalize,
  assignOperationalManager,
  reassignOperationalManager,
} from "../actions";
import { cancelDispatchedVendorRequest, approveVendorAndNotifyOthers } from "@/app/admin/actions";
import { 
  User, Calendar, MapPin, Users, Shield, Clock, BookOpen, 
  Send, CheckCircle2, MessageSquare, FileText, Activity, AlertTriangle, 
  ArrowRight, ShieldCheck, UserX, UserCheck, RefreshCw, Layers, Briefcase,
  XCircle, CheckSquare, Square, SlidersHorizontal, Scale
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_name: string | null;
  address: string | null;
  availability_status?: string | null;
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
      availability_status?: string | null;
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
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({});
  
  // OM Forms State
  const [selectedOMId, setSelectedOMId] = useState("");
  const [expectedCompletion, setExpectedCompletion] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignOMId, setReassignOMId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [reassignNotes, setReassignNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activeGroup = groups.find((g) => g.category.id === activeCategoryId) || groups[0];
  const activeOMAssignment = omAssignments?.[0];

  const allCategoriesFinalized = groups.every((g) => 
    g.assignments.some((asg) => asg.status === "Approved")
  );

  const getAvailabilityBadge = (st?: string | null) => {
    switch (st) {
      case "Available":
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold">🟢 Available</span>;
      case "Busy":
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-bold">🟡 Busy</span>;
      case "Leave":
        return <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[8px] font-bold">🔴 Leave</span>;
      case "In Work":
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold">🔵 In Work</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold">🟢 Available</span>;
    }
  };

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

  const handleSelectAllVendors = (categoryId: string, candidateVendors: Profile[]) => {
    const unassigned = candidateVendors.map((v) => v.id);
    const current = selectedVendors[categoryId] || [];
    if (current.length === unassigned.length) {
      setSelectedVendors((prev) => ({ ...prev, [categoryId]: [] }));
    } else {
      setSelectedVendors((prev) => ({ ...prev, [categoryId]: unassigned }));
    }
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
        await approveVendorAndNotifyOthers(requestId, assignmentId);
        alert("Vendor finalized successfully! Opportunity closed notifications dispatched.");
        window.location.reload();
      } catch (err) {
        alert("Failed to finalize vendor.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!confirm("Cancel this dispatched vendor invitation?")) return;

    setLoadingAction(`cancel-${assignmentId}`);
    startTransition(async () => {
      try {
        await cancelDispatchedVendorRequest(assignmentId);
        alert("Vendor request cancelled.");
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Failed to cancel vendor request.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleLockPlanning = async () => {
    if (!confirm("Lock event planning? This will flag the Event Case as Ready For Execution.")) {
      return;
    }

    setLoadingAction("lock-planning");
    startTransition(async () => {
      try {
        await lockPlanningAndFinalize(requestId);
        setStatus("Ready For Execution");
        alert("Event planning locked successfully!");
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
    if (!selectedOMId) return;

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
    if (!reassignOMId || !reassignReason.trim()) return;

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
        return "text-emerald-500 bg-emerald-500/5 border-emerald-500/10";
      case "Cancelled":
      case "Rejected":
        return "text-red-500 bg-red-500/5 border-red-500/10";
      default:
        return "text-muted-foreground bg-muted border-border/50";
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* ── Top Level Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Status */}
        <div className="space-y-6">
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

          <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-gold" />
                <span>Workflow Controls</span>
              </h3>
              <Link
                href={`/admin/bookings/${requestId}/compare`}
                className="px-3 py-1 bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold text-accent-gold hover:text-black font-bold rounded-lg text-[10px] transition flex items-center gap-1 cursor-pointer"
              >
                <Scale className="w-3 h-3" /> Compare Quotes
              </Link>
            </div>

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
                </select>
              </div>

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
                  className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md"
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
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent-gold" />
              <span>Selected Service List</span>
            </h3>
          </div>

          <div className="space-y-4">
            {groups.map((group) => {
              const isGroupApproved = group.assignments.some((asg) => asg.status === "Approved");
              const isGroupPending = group.assignments.some((asg) => asg.status === "Pending");
              const isGroupAccepted = group.assignments.some((asg) => asg.status === "Accepted");

              // Status colors: Red (not sent), Orange (sent waiting), Yellow (vendor responded), Green (finalized)
              const statusColor = isGroupApproved
                ? "bg-emerald-500"
                : isGroupAccepted
                ? "bg-amber-400 animate-pulse"
                : isGroupPending
                ? "bg-orange-500"
                : "bg-red-500";

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
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />
                      {group.category.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-accent-gold">
                      ₹{group.items.reduce((acc, c) => acc + c.lineTotal, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-3 border-l border-border">
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

        {/* Right Column: Intelligent Vendor Assignment */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          <div className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-gold" />
              <span>Vendor Selection & Dispatch Console</span>
            </h3>

            {activeGroup ? (
              <div className="space-y-5">
                <div className="p-3 bg-background border border-border rounded-xl text-[10px] text-muted-foreground leading-relaxed flex items-center justify-between">
                  <span>Category: <strong className="text-accent-gold font-bold">{activeGroup.category.name}</strong></span>
                  <Link
                    href={`/admin/bookings/${requestId}/compare`}
                    className="text-accent-gold font-bold hover:underline"
                  >
                    Compare All ({activeGroup.assignments.length})
                  </Link>
                </div>

                {/* Active Vendor Invitations */}
                {activeGroup.assignments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Invitations Sent</h5>
                    <div className="space-y-2.5 divide-y divide-border/50">
                      {activeGroup.assignments.map((asg) => {
                        const showApprove = asg.status === "Accepted";
                        const isCancelled = asg.status === "Cancelled";
                        return (
                          <div key={asg.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-[10px] gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-foreground truncate">
                                {asg.profiles?.business_name || asg.profiles?.full_name}
                              </div>
                              <div className="text-muted-foreground mt-0.5 text-[9px] flex items-center gap-1.5">
                                <span>{asg.profiles?.phone_number}</span>
                                {getAvailabilityBadge(asg.profiles?.availability_status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 border rounded-md text-[8px] font-bold uppercase tracking-wider ${assignmentStatusColor(asg.status)}`}>
                                {asg.status}
                              </span>
                              {showApprove && (
                                <button
                                  onClick={() => handleApprove(asg.id)}
                                  disabled={loadingAction === `approve-${asg.id}`}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px] cursor-pointer"
                                >
                                  Finalize
                                </button>
                              )}
                              {!isCancelled && asg.status !== "Approved" && (
                                <button
                                  onClick={() => handleCancelAssignment(asg.id)}
                                  disabled={loadingAction === `cancel-${asg.id}`}
                                  className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                                  title="Cancel Request"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
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
                  <div className="flex items-center justify-between">
                    <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Candidate Suppliers</h5>
                    {activeGroup.mappedVendors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSelectAllVendors(activeGroup.category.id, activeGroup.mappedVendors)}
                        className="text-[10px] font-bold text-accent-gold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3" /> Select All Vendors
                      </button>
                    )}
                  </div>

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
                                ? "bg-accent-gold/10 border-accent-gold"
                                : "bg-background border-border hover:border-accent-gold/25"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-foreground">{vendor.business_name || vendor.full_name}</div>
                              <div className="flex items-center gap-2 text-[9px]">
                                <span className="text-muted-foreground">Owner: {vendor.full_name}</span>
                                {getAvailabilityBadge(vendor.availability_status)}
                              </div>
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

                <button
                  type="button"
                  onClick={() => handleDispatch(activeGroup.category.id)}
                  disabled={
                    loadingAction === `dispatch-${activeGroup.category.id}` || 
                    (selectedVendors[activeGroup.category.id] || []).length === 0
                  }
                  className="w-full py-2.5 bg-accent-gold text-black font-bold rounded-xl text-xs hover:brightness-110 transition disabled:opacity-55 cursor-pointer shadow-md"
                >
                  {loadingAction === `dispatch-${activeGroup.category.id}` ? "Dispatching..." : `Dispatch Leads to Selected (${(selectedVendors[activeGroup.category.id] || []).length})`}
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a category on the left to review vendor options.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
