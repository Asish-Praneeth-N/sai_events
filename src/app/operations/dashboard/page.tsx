import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OMCommandCenter from "@/components/operations/OMCommandCenter";

export default async function OperationsDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone_number")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // OM metadata
  const { data: omData } = await supabase
    .from("operational_managers")
    .select("employee_id, designation, availability_status, employment_status, assigned_regions, assigned_cities, performance_score, completion_rate, current_workload, joining_date")
    .eq("id", user.id)
    .single();

  // All my event assignments
  const { data: assignments } = await supabase
    .from("event_assignments")
    .select(`
      id,
      status,
      escalation_level,
      escalation_reason,
      expected_completion,
      handover_notes,
      created_at,
      updated_at,
      event_requests (
        id,
        event_type,
        event_date,
        location,
        guest_count,
        total_budget,
        status,
        profiles:customer_id (
          full_name,
          phone_number,
          email
        )
      )
    `)
    .eq("assigned_operational_manager_id", user.id)
    .order("updated_at", { ascending: false });

  // Notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, message, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Checklist pending count (across all my active assignments)
  const activeAssignmentIds = (assignments || [])
    .filter((a) => ["Pending", "Assigned", "Accepted", "Execution Started"].includes(a.status))
    .map((a) => a.id);

  let pendingChecklistCount = 0;
  if (activeAssignmentIds.length > 0) {
    const { count } = await supabase
      .from("om_checklist_items")
      .select("*", { count: "exact", head: true })
      .in("assignment_id", activeAssignmentIds)
      .eq("is_completed", false);
    pendingChecklistCount = count || 0;
  }

  return (
    <OMCommandCenter
      profile={profile as any}
      omData={(omData || {}) as any}
      assignments={(assignments || []) as any[]}
      notifications={(notifications || []) as any[]}
      pendingChecklistCount={pendingChecklistCount}
    />
  );
}
