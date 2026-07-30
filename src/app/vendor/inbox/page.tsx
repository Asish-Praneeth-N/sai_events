import { createClient } from "@/lib/supabase/server";
import InboxList from "./InboxList";

export default async function VendorInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-muted-foreground">Loading vendor dispatch...</div>
      </div>
    );
  }

  // 1. Fetch vendor profile (for capacity & availability)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Fetch pending lead invitations
  const { data: assignmentsData, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      created_at,
      category_id,
      categories ( name ),
      event_requests (
        id,
        event_type,
        event_date,
        location,
        guest_count,
        total_budget,
        request_items (
          service_item_id,
          quantity,
          unit_price,
          pricing_type,
          service_items (
            id,
            name,
            price,
            pricing_unit,
            subcategory_id,
            subcategories ( category_id )
          )
        )
      )
    `)
    .eq("vendor_id", user.id)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  // 3. Fetch vendor confirmed bookings for schedule preview
  const { data: confirmedBookingsData } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      event_requests (
        id,
        event_type,
        event_date,
        event_time,
        location
      )
    `)
    .eq("vendor_id", user.id)
    .eq("status", "Approved");

  // 4. Fetch vendor personal schedule blocks
  const { data: personalSchedulesData } = await supabase
    .from("vendor_personal_schedules")
    .select("*")
    .eq("vendor_id", user.id);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
        Could not fetch lead invitations: {error.message}
      </div>
    );
  }

  const assignments = (assignmentsData || []) as any[];
  const confirmedBookings = (confirmedBookingsData || []) as any[];
  const personalSchedules = (personalSchedulesData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9.5px] uppercase tracking-widest font-bold text-accent-gold">SAI EVENTS DISPATCH</p>
          <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Lead Invitations</h1>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Review event leads, inspect your schedule for the event date, group multi-service quotes, and confirm availability.
          </p>
        </div>
        {assignments.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400">
              {assignments.length} pending {assignments.length === 1 ? "invitation" : "invitations"}
            </span>
          </div>
        )}
      </div>

      <InboxList
        assignments={assignments}
        profile={profile}
        confirmedBookings={confirmedBookings}
        personalSchedules={personalSchedules}
      />
    </div>
  );
}
