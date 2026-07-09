"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAuditRecord, logNotification } from "../actions";

export async function dispatchLeadsToVendors(
  requestId: string,
  categoryId: string,
  vendorIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // 1. Delete previous pending assignments for this category and request
  await supabase
    .from("vendor_assignments")
    .delete()
    .eq("request_id", requestId)
    .eq("category_id", categoryId)
    .eq("status", "Pending");

  // 2. Insert new assignments
  if (vendorIds.length > 0) {
    const assignments = vendorIds.map((vId) => ({
      request_id: requestId,
      category_id: categoryId,
      vendor_id: vId,
      status: "Pending",
    }));

    const { error: insertError } = await supabase
      .from("vendor_assignments")
      .insert(assignments);

    if (insertError) throw new Error(insertError.message);
  }

  // 3. Update parent event request status to 'Sent to Vendors'
  const { error: updateError } = await supabase
    .from("event_requests")
    .update({ status: "Sent to Vendors" })
    .eq("id", requestId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/bookings/${requestId}`);
  revalidatePath("/admin/bookings");
}

export async function approveVendorAssignment(
  requestId: string,
  assignmentId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // 1. Fetch the assignment details
  const { data: assignment, error: fetchErr } = await supabase
    .from("vendor_assignments")
    .select("category_id, vendor_id")
    .eq("id", assignmentId)
    .single();

  if (fetchErr || !assignment) throw new Error("Assignment not found");

  // 2. Approve selected assignment
  const { error: approveErr } = await supabase
    .from("vendor_assignments")
    .update({ status: "Approved" })
    .eq("id", assignmentId);

  if (approveErr) throw new Error(approveErr.message);

  // 3. Reject other assignments for this request and category
  await supabase
    .from("vendor_assignments")
    .update({ status: "Rejected" })
    .eq("request_id", requestId)
    .eq("category_id", assignment.category_id)
    .neq("id", assignmentId);

  // 4. Update the event request status
  const { error: requestStatusErr } = await supabase
    .from("event_requests")
    .update({ status: "Vendor Approved by Admin" })
    .eq("id", requestId);

  if (requestStatusErr) throw new Error(requestStatusErr.message);

  revalidatePath(`/admin/bookings/${requestId}`);
  revalidatePath("/admin/bookings");
}

export async function updateRequestStatus(requestId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("event_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/bookings/${requestId}`);
  revalidatePath("/admin/bookings");
}

export async function lockPlanningAndFinalize(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("event_requests")
    .update({ status: "Ready For Execution" })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  // Log timeline milestone
  await supabase.from("timelines").insert({
    event_id: eventId,
    milestone_name: "Planning Locked",
    description: "All vendor services finalized. Event planning locked and moved to Ready For Execution.",
    is_internal: false,
    created_by: user.id
  });

  // Log audit record
  await logAuditRecord("Event Planning Locked", "event", eventId, { status: "Ready For Execution" });

  revalidatePath(`/admin/bookings/${eventId}`);
  revalidatePath("/admin/bookings");
}

export async function assignOperationalManager(
  eventId: string,
  managerId: string,
  notes: string,
  expectedCompletion: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // Verify OM is available and active
  const { data: manager, error: omErr } = await supabase
    .from("operational_managers")
    .select("availability_status, employment_status, current_workload")
    .eq("id", managerId)
    .single();

  if (omErr || !manager) throw new Error("Operational Manager not found");
  if (manager.employment_status !== "Active" || manager.availability_status !== "Available") {
    throw new Error("Operational Manager is not available for assignments");
  }

  // Create Assignment
  const { data: assignment, error: assignError } = await supabase
    .from("event_assignments")
    .insert({
      event_id: eventId,
      assigned_by: user.id,
      assigned_operational_manager_id: managerId,
      handover_notes: notes,
      expected_completion: expectedCompletion,
      status: "Pending"
    })
    .select("id")
    .single();

  if (assignError) throw new Error(`Assignment creation failed: ${assignError.message}`);

  // Update Event Case status
  await supabase
    .from("event_requests")
    .update({ status: "Operational Manager Assigned" })
    .eq("id", eventId);

  // Update OM workload count
  await supabase
    .from("operational_managers")
    .update({ current_workload: manager.current_workload + 1 })
    .eq("id", managerId);

  // Insert timeline milestone
  await supabase.from("timelines").insert({
    event_id: eventId,
    milestone_name: "Operational Manager Assigned",
    description: "Operational Manager has been assigned to execute the event case. Handover notes dispatched.",
    is_internal: true,
    created_by: user.id
  });

  // Log audit record
  await logAuditRecord("Operational Manager Assigned Event", "event", eventId, { 
    managerId, 
    assignmentId: assignment.id 
  });

  // Log notification to the OM
  const { data: omProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", managerId)
    .single();

  await logNotification({
    userId: managerId,
    userType: "operational_manager",
    userName: omProfile?.full_name || "Manager",
    message: `You have been assigned to execute a new Event Case (ID: ${eventId}). Please review and accept.`,
  });

  revalidatePath(`/admin/bookings/${eventId}`);
  revalidatePath("/admin/bookings");
}

export async function reassignOperationalManager(
  assignmentId: string,
  newManagerId: string,
  reason: string,
  notes: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // Fetch current assignment
  const { data: currentAsg, error: fetchErr } = await supabase
    .from("event_assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  if (fetchErr || !currentAsg) throw new Error("Current assignment not found");

  const oldManagerId = currentAsg.assigned_operational_manager_id;
  if (oldManagerId === newManagerId) throw new Error("Cannot reassign to the same manager");

  // Verify new OM is available and active
  const { data: newManager, error: newOmErr } = await supabase
    .from("operational_managers")
    .select("availability_status, employment_status, current_workload")
    .eq("id", newManagerId)
    .single();

  if (newOmErr || !newManager) throw new Error("New Operational Manager not found");
  if (newManager.employment_status !== "Active" || newManager.availability_status !== "Available") {
    throw new Error("New Operational Manager is not available for assignments");
  }

  // Preserve history entry
  const historyEntry = {
    previous_manager_id: oldManagerId,
    new_manager_id: newManagerId,
    reassigned_by: user.id,
    reassigned_at: new Date().toISOString(),
    reason: reason,
    internal_notes: notes
  };
  const updatedHistory = [...(currentAsg.reassignment_history || []), historyEntry];

  // Update assignment row
  const { error: updateAsgErr } = await supabase
    .from("event_assignments")
    .update({
      assigned_operational_manager_id: newManagerId,
      handover_notes: notes,
      status: "Pending", // Reset to pending for the new OM to accept
      reassignment_history: updatedHistory,
      updated_at: new Date().toISOString()
    })
    .eq("id", assignmentId);

  if (updateAsgErr) throw new Error(updateAsgErr.message);

  // Decrement old manager workload
  const { data: oldManager } = await supabase
    .from("operational_managers")
    .select("current_workload")
    .eq("id", oldManagerId)
    .single();
  await supabase
    .from("operational_managers")
    .update({ current_workload: Math.max(0, (oldManager?.current_workload || 0) - 1) })
    .eq("id", oldManagerId);

  // Increment new manager workload
  await supabase
    .from("operational_managers")
    .update({ current_workload: newManager.current_workload + 1 })
    .eq("id", newManagerId);

  // Log timeline milestone
  await supabase.from("timelines").insert({
    event_id: currentAsg.event_id,
    milestone_name: "Event Reassigned",
    description: `Event has been reassigned to a new Operational Manager. Reason: ${reason}`,
    is_internal: true,
    created_by: user.id
  });

  // Log audit record
  await logAuditRecord("Operational Manager Reassigned", "event", currentAsg.event_id, {
    assignmentId,
    oldManagerId,
    newManagerId,
    reason,
  });

  // Log notification to both OMs
  const { data: newOmProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", newManagerId)
    .single();
  const { data: oldOmProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", oldManagerId)
    .single();

  await logNotification({
    userId: newManagerId,
    userType: "operational_manager",
    userName: newOmProfile?.full_name || "Manager",
    message: `You have been reassigned to execute Event Case (ID: ${currentAsg.event_id}) by admin.`,
  });

  await logNotification({
    userId: oldManagerId,
    userType: "operational_manager",
    userName: oldOmProfile?.full_name || "Manager",
    message: `You have been removed from Event Case (ID: ${currentAsg.event_id}) by admin.`,
  });

  revalidatePath(`/admin/bookings/${currentAsg.event_id}`);
  revalidatePath("/admin/bookings");
}
