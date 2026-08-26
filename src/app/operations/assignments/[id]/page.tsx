import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EventWorkspace from "@/components/operations/EventWorkspace";

export default async function EventWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the full assignment (verify ownership via RLS + explicit filter)
  const { data: assignment, error: assignmentErr } = await supabase
    .from("event_assignments")
    .select(`
      id, event_id, status, handover_notes, internal_notes,
      expected_completion, escalation_level, escalation_reason,
      timeline, activity, created_at, updated_at,
      event_requests (
        id, event_type, event_date, location, guest_count, total_budget, status,
        profiles:customer_id (
          id, full_name, phone_number, email, address
        )
      ),
      assigner:assigned_by (
        full_name
      )
    `)
    .eq("id", id)
    .eq("assigned_operational_manager_id", user.id)
    .single();

  if (assignmentErr || !assignment) notFound();

  const eventId = assignment.event_id;

  // Parallel data fetching for all workspace sections
  const [
    { data: vendorAssignments },
    { data: checklist },
    { data: timelineEntries },
    { data: notes },
    { data: documents },
    { data: completionReport },
    { data: vendorCoordination },
    { data: omProfile },
  ] = await Promise.all([
    // Vendor assignments for this event
    supabase
      .from("vendor_assignments")
      .select(`
        id, status, category_id, created_at,
        profiles:vendor_id (
          id, full_name, phone_number, email, business_name
        ),
        categories ( name )
      `)
      .eq("request_id", eventId),

    // Checklist items
    supabase
      .from("om_checklist_items")
      .select("id, label, is_completed, completed_at, sort_order, created_at")
      .eq("assignment_id", id)
      .order("sort_order"),

    // Timeline
    supabase
      .from("timelines")
      .select(`id, milestone_name, description, is_internal, created_at, profiles:created_by (full_name)`)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true }),

    // Notes
    supabase
      .from("om_notes")
      .select(`id, content, created_at, profiles:created_by (full_name)`)
      .eq("assignment_id", id)
      .order("created_at", { ascending: false }),

    // Documents (safe check)
    supabase
      .from("customer_media_items")
      .select("id, title, url, file_type, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),

    // Completion report
    supabase
      .from("om_completion_reports")
      .select("*")
      .eq("assignment_id", id)
      .maybeSingle(),

    // Vendor coordination records
    supabase
      .from("om_vendor_coordination")
      .select("*")
      .eq("assignment_id", id),

    // OM profile for current user
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <EventWorkspace
      assignment={assignment as any}
      eventId={eventId}
      vendorAssignments={(vendorAssignments || []) as any[]}
      checklist={(checklist || []) as any[]}
      timelineEntries={(timelineEntries || []) as any[]}
      notes={(notes || []) as any[]}
      documents={(documents || []) as any[]}
      completionReport={completionReport as any}
      vendorCoordination={(vendorCoordination || []) as any[]}
      currentUserName={omProfile?.full_name || ""}
    />
  );
}
