"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify caller is admin
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") throw new Error("Unauthorized");

  // Prevent self-demotion
  if (userId === user.id) {
    throw new Error("You cannot change your own admin role to prevent locked access.");
  }

  // Update profile role
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // If promoted to operational_manager, guarantee they have an entry in operational_managers
  if (newRole === "operational_manager") {
    const { data: omEntry } = await supabase
      .from("operational_managers")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!omEntry) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const { error: omErr } = await supabase
        .from("operational_managers")
        .insert({
          id: userId,
          employee_id: `OM-PROM-${randNum}`,
          designation: "Coordinator",
          availability_status: "Available",
          employment_status: "Active",
          created_by_admin: user.id,
        });
      if (omErr) throw new Error(`Operational manager setup failed: ${omErr.message}`);
    }
  }

  revalidatePath("/admin/users");
  return { success: true };
}
