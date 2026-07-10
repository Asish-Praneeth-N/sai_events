"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Helper: verify caller is operational_manager ───────────────────────────
async function requireOM() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "operational_manager") throw new Error("Forbidden");
  return { supabase, user, profile };
}

// ─── 1. Availability ────────────────────────────────────────────────────────
export async function updateOMAvailability(
  status: "Available" | "Busy" | "On Leave" | "Training" | "Inactive"
) {
  const { supabase, user } = await requireOM();
  const { error } = await supabase
    .from("operational_managers")
    .update({ availability_status: status })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/operations");
}

// ─── 2. Accept Assignment ───────────────────────────────────────────────────
export async function acceptAssignment(assignmentId: string) {
  const { supabase, user, profile } = await requireOM();

  // Verify ownership
  const { data: assignment, error: fetchErr } = await supabase
    .from("event_assignments")
    .select("id, event_id, status")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (fetchErr || !assignment) throw new Error("Assignment not found");
  if (assignment.status !== "Assigned") throw new Error("Assignment cannot be accepted in current state");

  // Update status
  const { error } = await supabase
    .from("event_assignments")
    .update({ status: "Accepted" })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  // Add timeline entry
  await supabase.from("timelines").insert({
    event_id: assignment.event_id,
    milestone_name: "Assignment Accepted",
    description: `Operational Manager ${profile.full_name} accepted the assignment and will begin coordination.`,
    is_internal: false,
    created_by: user.id,
  });

  // Seed default checklist items
  const defaultChecklist = [
    "Customer Contacted",
    "Venue Confirmed",
    "Photography Confirmed",
    "Decoration Confirmed",
    "Food & Catering Confirmed",
    "DJ / Entertainment Confirmed",
    "Travel & Logistics Confirmed",
    "Equipment Ready",
    "Arrival Confirmed",
    "Event Started",
    "Service Delivered",
    "Completion Report Submitted",
  ];
  await supabase.from("om_checklist_items").insert(
    defaultChecklist.map((label, i) => ({
      assignment_id: assignmentId,
      label,
      sort_order: i,
    }))
  );

  // Notification to admin
  await supabase.from("notifications").insert({
    user_type: "admin",
    user_name: "System",
    message: `Operational Manager ${profile.full_name} accepted assignment ${assignmentId.substring(0, 8)}.`,
    status: "Delivered",
  });

  revalidatePath("/operations/assignments");
  revalidatePath(`/operations/assignments/${assignmentId}`);
  revalidatePath("/operations/dashboard");
}

// ─── 3. Update Assignment Status ────────────────────────────────────────────
export async function updateAssignmentStatus(
  assignmentId: string,
  status: "Accepted" | "Execution Started" | "Execution Complete"
) {
  const { supabase, user, profile } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id, event_id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Assignment not found");

  const { error } = await supabase
    .from("event_assignments")
    .update({ status })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  const milestoneMap: Record<string, string> = {
    "Execution Started": "Event Setup Started",
    "Execution Complete": "Event Execution Complete",
  };

  await supabase.from("timelines").insert({
    event_id: assignment.event_id,
    milestone_name: milestoneMap[status] || status,
    description: `Status updated to "${status}" by ${profile.full_name}.`,
    is_internal: false,
    created_by: user.id,
  });

  revalidatePath(`/operations/assignments/${assignmentId}`);
  revalidatePath("/operations/dashboard");
}

// ─── 4. Add Timeline Entry ──────────────────────────────────────────────────
export async function addTimelineEntry(
  assignmentId: string,
  eventId: string,
  milestoneName: string,
  description: string,
  isInternal: boolean = true
) {
  const { supabase, user } = await requireOM();

  // Verify ownership
  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Assignment not found");

  const { error } = await supabase.from("timelines").insert({
    event_id: eventId,
    milestone_name: milestoneName,
    description,
    is_internal: isInternal,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/operations/assignments/${assignmentId}`);
}

// ─── 5. Toggle Checklist Item ───────────────────────────────────────────────
export async function toggleChecklistItem(
  itemId: string,
  assignmentId: string,
  completed: boolean
) {
  const { supabase, user } = await requireOM();

  // Verify ownership through assignment
  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { error } = await supabase
    .from("om_checklist_items")
    .update({
      is_completed: completed,
      completed_by: completed ? user.id : null,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", itemId)
    .eq("assignment_id", assignmentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/operations/assignments/${assignmentId}`);
}

// ─── 6. Add Checklist Item ──────────────────────────────────────────────────
export async function addChecklistItem(assignmentId: string, label: string) {
  const { supabase, user } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { count } = await supabase
    .from("om_checklist_items")
    .select("*", { count: "exact", head: true })
    .eq("assignment_id", assignmentId);

  const { error } = await supabase.from("om_checklist_items").insert({
    assignment_id: assignmentId,
    label: label.trim(),
    sort_order: count || 0,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/operations/assignments/${assignmentId}`);
}

// ─── 7. Add Note ────────────────────────────────────────────────────────────
export async function addNote(assignmentId: string, content: string) {
  const { supabase, user } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { error } = await supabase.from("om_notes").insert({
    assignment_id: assignmentId,
    content: content.trim(),
    created_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/operations/assignments/${assignmentId}`);
}

// ─── 8. Update Vendor Coordination ──────────────────────────────────────────
export async function updateVendorCoordination(
  assignmentId: string,
  vendorAssignmentId: string,
  arrivalStatus: string,
  coordinationNote: string
) {
  const { supabase, user } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { error } = await supabase.from("om_vendor_coordination").upsert({
    assignment_id: assignmentId,
    vendor_assignment_id: vendorAssignmentId,
    arrival_status: arrivalStatus,
    coordination_note: coordinationNote,
    last_contacted: new Date().toISOString(),
    noted_by: user.id,
  }, { onConflict: "assignment_id,vendor_assignment_id" });
  if (error) throw new Error(error.message);

  revalidatePath(`/operations/assignments/${assignmentId}`);
}

// ─── 9. Submit Escalation ───────────────────────────────────────────────────
export async function submitEscalation(
  assignmentId: string,
  eventId: string,
  escalationType: string,
  reason: string,
  level: 1 | 2 | 3
) {
  const { supabase, user, profile } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { error } = await supabase
    .from("event_assignments")
    .update({
      escalation_level: level,
      escalation_reason: `[${escalationType}] ${reason}`,
    })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  // Timeline entry for escalation
  await supabase.from("timelines").insert({
    event_id: eventId,
    milestone_name: `Escalation Raised — ${escalationType}`,
    description: reason,
    is_internal: true,
    created_by: user.id,
  });

  // Notify admin
  await supabase.from("notifications").insert({
    user_type: "admin",
    user_name: profile.full_name,
    message: `⚠️ ESCALATION by ${profile.full_name}: [${escalationType}] ${reason} — Assignment ${assignmentId.substring(0, 8)}`,
    status: "Delivered",
  });

  revalidatePath(`/operations/assignments/${assignmentId}`);
  revalidatePath("/operations/dashboard");
}

// ─── 10. Submit Completion Report ───────────────────────────────────────────
export async function submitCompletionReport(
  assignmentId: string,
  eventId: string,
  data: {
    executiveSummary: string;
    executionNotes: string;
    issuesFaced: string;
    vendorPerformance: string;
    customerSatisfaction: number;
    lessonsLearned: string;
  }
) {
  const { supabase, user, profile } = await requireOM();

  const { data: assignment } = await supabase
    .from("event_assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("assigned_operational_manager_id", user.id)
    .single();
  if (!assignment) throw new Error("Forbidden");

  const { error } = await supabase.from("om_completion_reports").upsert({
    assignment_id: assignmentId,
    executive_summary: data.executiveSummary,
    execution_notes: data.executionNotes,
    issues_faced: data.issuesFaced,
    vendor_performance: data.vendorPerformance,
    customer_satisfaction: data.customerSatisfaction,
    lessons_learned: data.lessonsLearned,
    submitted_by: user.id,
    submitted_at: new Date().toISOString(),
  }, { onConflict: "assignment_id" });
  if (error) throw new Error(error.message);

  // Update assignment to Execution Complete if not already
  await supabase
    .from("event_assignments")
    .update({ status: "Execution Complete" })
    .eq("id", assignmentId)
    .neq("status", "Closed");

  // Timeline entry
  await supabase.from("timelines").insert({
    event_id: eventId,
    milestone_name: "Completion Report Submitted",
    description: `Post-event completion report submitted by ${profile.full_name}. Customer satisfaction: ${data.customerSatisfaction}/10.`,
    is_internal: false,
    created_by: user.id,
  });

  // Notify admin
  await supabase.from("notifications").insert({
    user_type: "admin",
    user_name: profile.full_name,
    message: `✅ Completion report submitted by ${profile.full_name} for assignment ${assignmentId.substring(0, 8)}. Ready for Admin review.`,
    status: "Delivered",
  });

  revalidatePath(`/operations/assignments/${assignmentId}`);
  revalidatePath("/operations/dashboard");
}

// ─── 11. Mark Notifications Read ────────────────────────────────────────────
export async function markNotificationsRead(ids: string[]) {
  const { supabase, user } = await requireOM();
  if (ids.length === 0) return;
  await supabase
    .from("notifications")
    .update({ status: "Read" })
    .in("id", ids)
    .eq("user_id", user.id);
  revalidatePath("/operations/notifications");
  revalidatePath("/operations/dashboard");
}

// ─── 12. Log Document ───────────────────────────────────────────────────────
export async function logDocument(
  eventId: string,
  fileName: string,
  fileUrl: string,
  fileType: string
) {
  const { supabase, user } = await requireOM();

  const { error } = await supabase.from("documents").insert({
    event_id: eventId,
    uploaded_by: user.id,
    file_name: fileName,
    file_url: fileUrl,
    file_type: fileType,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/operations/assignments");
}

// ─── 13. Save OM Profile ────────────────────────────────────────────────────
export async function saveOMProfile(data: {
  fullName: string;
  phoneNumber: string;
  address?: string;
}) {
  const { supabase, user } = await requireOM();

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName.trim(),
      phone_number: data.phoneNumber.trim(),
      address: data.address?.trim() || null,
    })
    .eq("id", user.id);

  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/operations");
  revalidatePath("/operations/profile");
}

export async function completeOMPasswordChange() {
  const { supabase, user } = await requireOM();
  const { error } = await supabase
    .from("operational_managers")
    .update({ requires_password_change: false })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/operations");
}

