"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function respondToAssignment(assignmentId: string, accept: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Fetch assignment and check ownership
  const { data: assignment, error: fetchErr } = await supabase
    .from("vendor_assignments")
    .select("vendor_id, request_id")
    .eq("id", assignmentId)
    .single();

  if (fetchErr || !assignment) throw new Error("Lead assignment not found.");
  if (assignment.vendor_id !== user.id) throw new Error("Unauthorized action.");

  const targetStatus = accept ? "Accepted" : "Rejected";

  // 2. Update assignment status
  const { error: updateErr } = await supabase
    .from("vendor_assignments")
    .update({ status: targetStatus })
    .eq("id", assignmentId);

  if (updateErr) throw new Error(updateErr.message);

  // 3. If accepted, update parent request status to 'Vendor Accepted'
  if (accept) {
    const { error: requestErr } = await supabase
      .from("event_requests")
      .update({ status: "Vendor Accepted" })
      .eq("id", assignment.request_id);

    if (requestErr) throw new Error(requestErr.message);
  }

  revalidatePath("/vendor/inbox");
  revalidatePath("/vendor/bookings");
}
