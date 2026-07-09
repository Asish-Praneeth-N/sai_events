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

  // Verify caller is admin
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

  // Log audit record
  await logAuditRecord(auditAction, "vendor", vendorId, { status });

  // Send a system notification log
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
  
  // Attempt logging if notifications table exists
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
    console.warn("Notifications table might not be migrated yet, error:", error.message);
  }
}

// 4. Media Object Deletion Action
export async function deleteMediaObject(mediaId: string, storagePath: string) {
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

  // Delete from storage bucket
  const filename = storagePath.split("/").pop();
  if (filename) {
    await supabase.storage
      .from("service-media")
      .remove([`service-items/${filename}`]);
  }

  // Delete from service_item_media table
  const { error } = await supabase
    .from("service_item_media")
    .delete()
    .eq("id", mediaId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
  revalidatePath("/admin/media");
}
