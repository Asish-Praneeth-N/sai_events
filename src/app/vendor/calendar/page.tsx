import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";

export default async function VendorCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch confirmed vendor assignments
  const { data: bookingsData, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      status,
      created_at,
      category_id,
      categories ( name ),
      event_requests (
        id,
        event_type,
        event_date,
        event_time,
        location,
        guest_count,
        status,
        request_items (
          quantity,
          unit_price,
          pricing_type,
          service_items (
            name
          )
        )
      )
    `)
    .eq("vendor_id", user.id)
    .in("status", ["Accepted", "Approved"]);

  // Fetch personal schedule entries
  const { data: personalSchedulesData } = await supabase
    .from("vendor_personal_schedules")
    .select("*")
    .eq("vendor_id", user.id)
    .order("start_date", { ascending: true });

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
        Failed to fetch calendar data: {error.message}
      </div>
    );
  }

  const bookings = (bookingsData || []) as any[];
  const personalSchedules = (personalSchedulesData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-[9.5px] uppercase tracking-widest font-bold text-accent-gold">Scheduling Studio</p>
        <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Interactive Calendar & Schedule</h1>
        <p className="text-xs text-muted-foreground font-light mt-1">
          Monitor daily event capacity, track confirmed bookings, block personal leave, and manage availability.
        </p>
      </div>

      <CalendarClient
        bookings={bookings}
        personalSchedules={personalSchedules}
        profile={profile}
      />
    </div>
  );
}
