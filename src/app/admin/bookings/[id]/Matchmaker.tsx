"use client";

import { useState, useTransition } from "react";
import {
  dispatchLeadsToVendors,
  approveVendorAssignment,
  updateRequestStatus,
} from "../actions";
import { 
  User, Calendar, MapPin, Users, Shield, Clock, BookOpen, 
  Send, CheckCircle2, MessageSquare, FileText, Activity
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
}

export default function Matchmaker({
  requestId,
  currentStatus,
  customerProfile,
  groups,
}: MatchmakerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(groups[0]?.category.id || "");
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string[]>>({}); // categoryId -> vendorIds[]
  
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState([
    { author: "Admin Operations", text: "Customer requirements review completed. Proceeding to vendor matching.", time: "1 hour ago" }
  ]);
  const [newComment, setNewComment] = useState("");

  const activeGroup = groups.find((g) => g.category.id === activeCategoryId) || groups[0];

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
      alert("Select at least one vendor to dispatch leads.");
      return;
    }

    setLoadingAction(`dispatch-${categoryId}`);
    startTransition(async () => {
      try {
        await dispatchLeadsToVendors(requestId, categoryId, vendorIds);
        alert("Leads dispatched to selected vendors!");
        setSelectedVendors((prev) => ({ ...prev, [categoryId]: [] }));
      } catch (err) {
        alert("Failed to dispatch leads.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const handleApprove = async (assignmentId: string) => {
    if (!confirm("Approve this vendor assignment? Other assignments in this category will be rejected.")) {
      return;
    }

    setLoadingAction(`approve-${assignmentId}`);
    startTransition(async () => {
      try {
        await approveVendorAssignment(requestId, assignmentId);
        alert("Vendor assignment approved!");
      } catch (err) {
        alert("Failed to approve vendor.");
      } finally {
        setLoadingAction(null);
      }
    });
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { author: "Admin Operations", text: newComment, time: "Just now" }
    ]);
    setNewComment("");
  };

  const assignmentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-500 bg-amber-500/5 border-amber-500/10";
      case "Accepted":
        return "text-pink-500 bg-pink-500/5 border-pink-500/10";
      case "Approved":
        return "text-emerald-500 bg-emerald-500/5 border-emerald-500/10";
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

            <div className="space-y-3">
              <label htmlFor="status" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Pipeline Status
              </label>
              <select
                id="status"
                value={status}
                disabled={loadingAction === "status"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none text-xs text-foreground font-semibold"
              >
                <option value="Request Submitted">Submitted</option>
                <option value="Under Admin Review">Under Review</option>
                <option value="Vendor Selection In Progress">Matching In Progress</option>
                <option value="Sent to Vendors">Sent to Vendors</option>
                <option value="Vendor Accepted">Vendor Accepted</option>
                <option value="Vendor Approved by Admin">Approved by Admin</option>
                <option value="Customer Confirmation Pending">Confirmation Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
            {groups.map((group) => (
              <div 
                key={group.category.id} 
                onClick={() => setActiveCategoryId(group.category.id)}
                className={`p-3.5 border rounded-xl transition cursor-pointer ${
                  activeCategoryId === group.category.id 
                    ? "bg-accent-gold/5 border-accent-gold" 
                    : "bg-background/40 border-border hover:border-accent-gold/25"
                }`}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{group.category.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-accent-gold">
                    ₹{group.items.reduce((acc, c) => acc + c.lineTotal, 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="space-y-1.5 pl-2 border-l border-border">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-mono">₹{item.lineTotal.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Intelligent Vendor Assignment */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-gold" />
            <span>Vendor Assignment Matchmaker</span>
          </h3>

          {activeGroup ? (
            <div className="space-y-5">
              {/* Category Filter Helper indicator */}
              <div className="p-3 bg-background border border-border rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                Showing verified suppliers matching category: <strong className="text-accent-gold font-bold">{activeGroup.category.name}</strong>
              </div>

              {/* Active Assignments tracker */}
              {activeGroup.assignments.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Active Category Leads</h5>
                  <div className="space-y-2.5 divide-y divide-border/50">
                    {activeGroup.assignments.map((asg) => {
                      const showApprove = asg.status === "Accepted";
                      return (
                        <div key={asg.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-[10px] gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-foreground truncate">
                              {asg.profiles?.business_name || asg.profiles?.full_name}
                            </div>
                            <div className="text-muted-foreground mt-0.5">{asg.profiles?.phone_number}</div>
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
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mapped Vendors Select Registry */}
              <div className="space-y-2.5">
                <h5 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Mapped Category Suppliers</h5>
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

              {/* Action trigger */}
              <button
                type="button"
                onClick={() => handleDispatch(activeGroup.category.id)}
                disabled={
                  loadingAction === `dispatch-${activeGroup.category.id}` || 
                  (selectedVendors[activeGroup.category.id] || []).length === 0
                }
                className="w-full py-2 bg-accent-gold text-black font-bold rounded-xl text-xs hover:scale-[1.01] transition disabled:opacity-55 cursor-pointer"
              >
                {loadingAction === `dispatch-${activeGroup.category.id}` ? "Sending..." : "Dispatch Category Leads"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Select a service item to manage category matching.</p>
          )}

        </div>

      </div>

      {/* ── Bottom Section: Timeline, Comments, Documents, Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline & Activity Log (Left & Center) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-gold" />
            <span>Workflow Activity & Comments</span>
          </h3>

          <div className="space-y-4">
            {/* Comments Timeline */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {comments.map((c, index) => (
                <div key={index} className="p-3 bg-background border border-border rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{c.author}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{c.time}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={addComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Log activity note or admin comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent-gold/45"
              />
              <button 
                type="submit"
                className="p-2 bg-accent-gold text-black rounded-xl hover:scale-105 transition flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Documents & Invoices (Right) */}
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow transition duration-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-gold" />
            <span>Assigned Documents</span>
          </h3>

          <div className="space-y-3.5">
            <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-accent-gold/20 transition group">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent-gold" />
                <div>
                  <div className="font-bold text-foreground">Estimated Invoice.pdf</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Maturity Budget Estimate</div>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold">View</span>
            </div>

            <div className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-accent-gold/20 transition group">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent-gold" />
                <div>
                  <div className="font-bold text-foreground">Service Parameters.pdf</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Agreement Specifications</div>
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
