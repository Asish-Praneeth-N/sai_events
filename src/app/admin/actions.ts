"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Vendor Approval & Role Management Actions
export async function updateVendorStatus(
  vendorId: string,
  status: "Pending" | "Approved" | "Rejected" | "Active" | "Inactive"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", vendorId);

  if (error) throw new Error(error.message);

  const actionMap: Record<string, string> = {
    Approved: "Vendor Approved",
    Rejected: "Vendor Rejected",
    Active: "Vendor Activated",
    Inactive: "Vendor Suspended",
  };
  const auditAction = actionMap[status] || "Vendor Status Updated";

  await logAuditRecord(auditAction, "vendor", vendorId, { status });

  try {
    const { data: vendorProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", vendorId)
      .single();

    await logNotification({
      userId: vendorId,
      userType: "vendor",
      userName: vendorProfile?.full_name || "Vendor",
      message: `Vendor account status updated to ${status} by admin.`,
    });
  } catch (logErr) {
    console.error("Failed to log notification:", logErr);
  }

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin");
}

// 2. Audit Logging Actions
export async function logAuditRecord(
  action: string,
  entityType: string,
  entityId: string,
  details: any = {}
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("audit_logs")
    .insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      performed_by: user?.id || null,
      details,
    });

  if (error) {
    console.warn("Failed to write audit log:", error.message);
  }
}

// 3. Notification Logging Actions
export async function logNotification(data: {
  userId: string | null;
  userType: string;
  userName: string;
  message: string;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.userId,
      user_type: data.userType,
      user_name: data.userName,
      message: data.message,
      status: "Delivered",
    });

  if (error) {
    console.warn("Notifications error:", error.message);
  }
}

// 4. Admin Cancel Dispatched Vendor Request
export async function cancelDispatchedVendorRequest(assignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: assignment, error: getErr } = await supabase
    .from("vendor_assignments")
    .select("id, request_id, vendor_id")
    .eq("id", assignmentId)
    .single();

  if (getErr || !assignment) throw new Error("Assignment not found.");

  const { error } = await supabase
    .from("vendor_assignments")
    .update({ status: "Cancelled" })
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);

  await logNotification({
    userId: assignment.vendor_id,
    userType: "vendor",
    userName: "System",
    message: `Admin cancelled dispatched lead request for event file #${assignment.request_id.substring(0, 8)}.`,
  });

  revalidatePath(`/admin/bookings/${assignment.request_id}`);
}

// 5. Approve Vendor & Notify Other Candidate Vendors
export async function approveVendorAndNotifyOthers(requestId: string, approvedAssignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: targetAssignment } = await supabase
    .from("vendor_assignments")
    .select("id, vendor_id, category_id")
    .eq("id", approvedAssignmentId)
    .single();

  if (!targetAssignment) throw new Error("Assignment record missing.");

  await supabase
    .from("vendor_assignments")
    .update({ status: "Approved" })
    .eq("id", approvedAssignmentId);

  const { data: otherAssignments } = await supabase
    .from("vendor_assignments")
    .select("id, vendor_id")
    .eq("request_id", requestId)
    .eq("category_id", targetAssignment.category_id)
    .neq("id", approvedAssignmentId);

  if (otherAssignments && otherAssignments.length > 0) {
    for (const other of otherAssignments) {
      await supabase
        .from("vendor_assignments")
        .update({ status: "Rejected" })
        .eq("id", other.id);

      await logNotification({
        userId: other.vendor_id,
        userType: "vendor",
        userName: "System",
        message: "This opportunity has been assigned to another vendor.",
      });
    }
  }

  revalidatePath(`/admin/bookings/${requestId}`);
}

// 6. Media Object Deletion Action
export async function deleteMediaObject(mediaId: string, storagePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const filename = storagePath.split("/").pop();
  if (filename) {
    await supabase.storage
      .from("service-media")
      .remove([`service-items/${filename}`]);
  }

  const { error } = await supabase
    .from("service_item_media")
    .delete()
    .eq("id", mediaId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
  revalidatePath("/admin/media");
}

// 7. Admin Edit Access Management
export async function approveEditRequest(editRequestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: editReq, error: fetchErr } = await supabase
    .from("event_edit_requests")
    .select("id, event_id, customer_id")
    .eq("id", editRequestId)
    .single();

  if (fetchErr || !editReq) throw new Error("Edit request not found.");

  const { error } = await supabase
    .from("event_edit_requests")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("id", editRequestId);

  if (error) throw new Error(error.message);

  await logNotification({
    userId: editReq.customer_id,
    userType: "customer",
    userName: "SAI EVENTS Admin",
    message: `Edit access approved! You can now modify parameters for event file #${editReq.event_id.substring(0, 8)}.`,
  });

  revalidatePath(`/customer/events/${editReq.event_id}`);
  revalidatePath("/admin/edit-requests");
  return { success: true };
}

export async function rejectEditRequest(editRequestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: editReq, error: fetchErr } = await supabase
    .from("event_edit_requests")
    .select("id, event_id, customer_id")
    .eq("id", editRequestId)
    .single();

  if (fetchErr || !editReq) throw new Error("Edit request not found.");

  const { error } = await supabase
    .from("event_edit_requests")
    .update({ status: "rejected" })
    .eq("id", editRequestId);

  if (error) throw new Error(error.message);

  await logNotification({
    userId: editReq.customer_id,
    userType: "customer",
    userName: "SAI EVENTS Admin",
    message: `Edit access request for event file #${editReq.event_id.substring(0, 8)} was rejected by admin.`,
  });

  revalidatePath(`/customer/events/${editReq.event_id}`);
  revalidatePath("/admin/edit-requests");
  return { success: true };
}

// 8. Admin Event Meeting Scheduling
export async function scheduleEventMeeting(
  meetingId: string,
  confirmedDate: string,
  confirmedTime: string,
  meetingLink?: string,
  adminNotes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: meeting, error: fetchErr } = await supabase
    .from("event_meetings")
    .select("id, event_id, customer_id")
    .eq("id", meetingId)
    .single();

  if (fetchErr || !meeting) throw new Error("Meeting request not found.");

  const todayStr = new Date().toLocaleDateString("en-CA");
  if (confirmedDate < todayStr) {
    throw new Error("Cannot schedule a meeting for a past date. Please select today or a future date.");
  }

  const { error } = await supabase
    .from("event_meetings")
    .update({
      status: "Scheduled",
      confirmed_date: confirmedDate,
      confirmed_time: confirmedTime,
      meeting_link: meetingLink || null,
      admin_notes: adminNotes || null,
    })
    .eq("id", meetingId);

  if (error) throw new Error(error.message);

  await logNotification({
    userId: meeting.customer_id,
    userType: "customer",
    userName: "SAI EVENTS Admin",
    message: `Event Meeting Scheduled: Confirmed for ${confirmedDate} at ${confirmedTime}.`,
  });

  revalidatePath(`/customer/events/${meeting.event_id}`);
  revalidatePath("/admin/meetings");
  return { success: true };
}

export async function rejectEventMeeting(meetingId: string, adminNotes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: meeting, error: fetchErr } = await supabase
    .from("event_meetings")
    .select("id, event_id, customer_id")
    .eq("id", meetingId)
    .single();

  if (fetchErr || !meeting) throw new Error("Meeting request not found.");

  const { error } = await supabase
    .from("event_meetings")
    .update({
      status: "Rejected",
      admin_notes: adminNotes || null,
    })
    .eq("id", meetingId);

  if (error) throw new Error(error.message);

  await logNotification({
    userId: meeting.customer_id,
    userType: "customer",
    userName: "SAI EVENTS Admin",
    message: `Meeting request for event file #${meeting.event_id.substring(0, 8)} was rejected by admin.`,
  });

  revalidatePath(`/customer/events/${meeting.event_id}`);
  revalidatePath("/admin/meetings");
  return { success: true };
}
