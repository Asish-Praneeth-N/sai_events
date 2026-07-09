import { createClient } from "@/lib/supabase/server";
import BookingsClient from "./BookingsClient";

export default async function VendorBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
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
        event_assignments (
          id,
          profiles:assigned_operational_manager_id (
            full_name,
            phone_number,
            email
          )
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
    .neq("status", "Pending")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Failed to fetch bookings: {error.message}
      </div>
    );
  }

  const bookings = (bookingsData || []) as any[];
  const confirmedCount = bookings.filter((b) => b.status === "Approved").length;
  const pendingCount = bookings.filter((b) => b.status === "Accepted").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9.5px] uppercase tracking-widest font-bold text-muted-foreground">Project Management</p>
          <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Assignments</h1>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Your accepted leads and confirmed events.
          </p>
        </div>
        {bookings.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {confirmedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/25 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-400">{confirmedCount} Confirmed</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/8 border border-amber-500/25 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400">{pendingCount} Awaiting</span>
              </div>
            )}
          </div>
        )}
      </div>

      <BookingsClient bookings={bookings} />
    </div>
  );
}
