"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
