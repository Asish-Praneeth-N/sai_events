import { createClient } from "@/lib/supabase/server";
import DashboardList from "./DashboardList";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-zinc-400">Loading user session...</div>;
  }

  // Fetch event requests and nested items/vendor details
  const { data: requestsData, error } = await supabase
    .from("event_requests")
    .select(`
      id,
      event_type,
      event_date,
      location,
      guest_count,
      status,
      total_budget,
      created_at,
      request_items (
        quantity,
        unit_price,
        pricing_type,
        service_items (
          name
        )
      ),
      vendor_assignments (
        id,
        status,
        categories (
          name
        ),
        profiles (
          full_name,
          phone_number,
          email,
          business_name
        )
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to fetch booking details: {error.message}
      </div>
    );
  }

  const requests = (requestsData || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-zinc-900 dark:text-white">My Events Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track the status of your planned events and coordinate with approved service vendors.
          </p>
        </div>
        <a
          href="/customer/request"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition shadow shadow-purple-950/20 text-sm hover:scale-[1.01]"
        >
          Plan New Event
        </a>
      </div>

      <DashboardList requests={requests} />
    </div>
  );
}
