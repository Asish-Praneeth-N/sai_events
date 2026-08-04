import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EventWorkspaceClient from "@/components/customer/EventWorkspaceClient";

export default async function EventWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const eventId = resolvedParams.id;
  const initialTab = resolvedSearchParams.tab || "overview";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Event Request and all related entities
  const { data: event, error } = await supabase
    .from("event_requests")
    .select(`
      *,
      request_items (
        id,
        quantity,
        unit_price,
        pricing_type,
        pricing_unit,
        service_items (
          name
        )
      ),
      event_assignments (
        id,
        status,
        expected_completion,
        handover_notes,
        profiles:assigned_operational_manager_id (
          full_name,
          phone_number,
          email
        )
      ),
      documents (
        id,
        file_name,
        file_url,
        file_type,
        created_at
      ),
      timelines (
        id,
        milestone_name,
        description,
        is_internal,
        created_at
      )
    `)
    .eq("id", eventId)
    .eq("customer_id", user.id)
    .single();

  if (error || !event) {
    notFound();
  }

  // 2. Fetch Edit Requests for this event
  let editRequests: any[] = [];
  try {
    const { data: edits } = await supabase
      .from("event_edit_requests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    editRequests = edits || [];
  } catch (_) {}

  // 3. Fetch Meetings for this event
  let meetings: any[] = [];
  try {
    const { data: meetList } = await supabase
      .from("event_meetings")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    meetings = meetList || [];
  } catch (_) {}

  return (
    <EventWorkspaceClient
      event={event}
      editRequests={editRequests}
      meetings={meetings}
      initialTab={initialTab}
    />
  );
}
