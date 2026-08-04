"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateEnquiryStatus(
  enquiryId: string,
  newStatus: "new" | "in_progress" | "resolved",
  adminNotes?: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized. Please sign in as an admin.");
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Forbidden: Admin access required.");
    }

    // Check existing enquiry status to prevent reverting resolved state
    const { data: existingEnquiry } = await supabase
      .from("guest_enquiries")
      .select("status, resolved_at, resolved_by")
      .eq("id", enquiryId)
      .single();

    if (existingEnquiry?.status === "resolved" && newStatus !== "resolved") {
      throw new Error("Resolved enquiries are finalized and cannot be reverted back to New or In Progress.");
    }

    const updatePayload: Record<string, any> = {
      status: newStatus,
      admin_notes: adminNotes !== undefined ? adminNotes : null,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "resolved") {
      updatePayload.resolved_at = existingEnquiry?.resolved_at || new Date().toISOString();
      updatePayload.resolved_by = existingEnquiry?.resolved_by || user.id;
    } else {
      updatePayload.resolved_at = null;
      updatePayload.resolved_by = null;
    }

    const { error: updateError } = await supabase
      .from("guest_enquiries")
      .update(updatePayload)
      .eq("id", enquiryId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/dashboard");

    return { success: true, message: `Enquiry status updated to ${newStatus}.` };
  } catch (err: any) {
    console.error("Error updating enquiry status:", err);
    return { success: false, error: err.message || "Failed to update enquiry." };
  }
}
