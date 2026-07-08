import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";

export default async function VendorCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure profile details are completed (onboarded vendor check)
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, phone_number")
    .eq("id", user.id)
    .single();

  if (!profile?.business_name || !profile?.phone_number || profile.phone_number === "0000000000") {
    redirect("/vendor/profile");
  }

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
        location,
        guest_count,
        status,
        profiles (
          full_name,
          phone_number,
          email
        ),
        request_items (
          quantity,
          unit_price,
          pricing_type,
          service_items (
            name,
            subcategory_id,
            subcategories ( category_id )
          )
        )
      )
    `)
    .eq("vendor_id", user.id)
    .in("status", ["Accepted", "Approved"]);

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Failed to fetch calendar bookings: {error.message}
      </div>
    );
  }

  const bookings = (bookingsData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">Event Calendar</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage your schedule, track upcoming confirmed bookings, and review past completed events.
        </p>
      </div>

      <CalendarClient bookings={bookings} />
    </div>
  );
}
