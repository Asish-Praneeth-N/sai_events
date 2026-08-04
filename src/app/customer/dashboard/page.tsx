import { createClient } from "@/lib/supabase/server";
import DashboardList from "./DashboardList";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-zinc-400">Loading user session...</div>;
  }

  // Fetch event requests and nested items, assignments, documents, and timelines
  const { data: requestsData, error } = await supabase
    .from("event_requests")
    .select(`
      id,
      event_type,
      location,
      guest_count,
      status,
      total_budget,
      event_date,
      created_at,
      request_items (
        quantity,
        unit_price,
        pricing_type,
        service_items (
          name
        )
      ),
      event_assignments (
        id,
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
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch notifications
  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch linked guest enquiries
  let enquiries: any[] = [];
  try {
    const { data: enquiriesData } = await supabase
      .from("guest_enquiries")
      .select("id, event_type, event_description, status, created_at")
      .eq("linked_user_id", user.id)
      .order("created_at", { ascending: false });
    enquiries = enquiriesData || [];
  } catch (_) {}

  // Fetch all event meetings for this customer
  let meetings: any[] = [];
  try {
    const { data: meetingsData } = await supabase
      .from("event_meetings")
      .select(`
        *,
        event_requests (
          event_type,
          celebrant_name
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    meetings = meetingsData || [];
  } catch (_) {}

  if (error) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load planning dashboard</h2>
        <p className="text-xs opacity-90">{error.message}</p>
        <p className="text-xs mt-4 opacity-75">
          Please verify that you have run the database migrations (`migration_customer_workspace.sql`) in the Supabase SQL editor to create all required tables.
        </p>
      </div>
    );
  }

  const requests = (requestsData || []) as any[];
  const notifications = (notificationsData || []) as any[];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-heading text-foreground">Event Planning Studio</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            Track milestones, manage references, and coordinate your upcoming celebration.
          </p>
        </div>
        <a
          href="/customer/request"
          className="px-6 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold rounded-xl transition shadow text-xs uppercase tracking-wider"
        >
          Plan New Event
        </a>
      </div>

      <DashboardList
        requests={requests}
        notifications={notifications}
        enquiries={enquiries}
        meetings={meetings}
      />
    </div>
  );
}
