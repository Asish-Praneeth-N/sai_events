import { createClient } from "@/lib/supabase/server";
import BookingsKanban from "@/components/admin/BookingsKanban";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  // Fetch event requests joined with customer profile
  const { data: requestsData, error } = await supabase
    .from("event_requests")
    .select(`
      *,
      profiles (
        full_name,
        email,
        phone_number
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to load bookings: {error.message}
      </div>
    );
  }

  const requests = (requestsData || []) as any[];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Bookings Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1 font-light">
          Track and orchestrate the planning lifecycle of customer event reservations.
        </p>
      </div>

      {/* Kanban Board */}
      <BookingsKanban initialRequests={requests} />
    </div>
  );
}
