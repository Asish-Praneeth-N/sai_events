import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OMCalendar from "@/components/operations/OMCalendar";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assignments } = await supabase
    .from("event_assignments")
    .select(`
      id, status, escalation_level, expected_completion, updated_at,
      event_requests (
        id, event_type, event_date, location, guest_count, profiles:customer_id (full_name)
      )
    `)
    .eq("assigned_operational_manager_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Calendar</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">All your event assignments plotted on the calendar.</p>
      </div>
      <OMCalendar assignments={(assignments || []) as any[]} />
    </div>
  );
}
