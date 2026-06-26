import { createClient } from "@/lib/supabase/server";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  // 1. Fetch event requests joined with customer profile
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

  // 2. Fetch count stats
  const { count: totalRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true });

  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer");

  const { count: totalVendors } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "vendor");

  const { count: pendingRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["Request Submitted", "Under Admin Review", "Vendor Selection In Progress", "Sent to Vendors"]);

  const { count: activeRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["Vendor Accepted", "Vendor Approved by Admin", "Customer Confirmation Pending", "Confirmed"]);

  const { count: completedBookings } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Completed");

  const requests = requestsData || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Request Submitted":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400";
      case "Under Admin Review":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400";
      case "Vendor Selection In Progress":
      case "Sent to Vendors":
        return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30 text-purple-600 dark:text-purple-400";
      case "Vendor Accepted":
        return "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/30 text-pink-600 dark:text-pink-400";
      case "Vendor Approved by Admin":
      case "Customer Confirmation Pending":
        return "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/30 text-teal-600 dark:text-teal-400";
      case "Confirmed":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400";
      case "Completed":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400";
      case "Cancelled":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Bookings Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review client requirements, execute matching service assignments, and track planning lifecycles.
        </p>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-fade-in-up stagger-1">
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Bookings</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{totalRequests || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Stage</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">{pendingRequests || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Stage</div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{activeRequests || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed</div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-1">{completedBookings || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clients</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{totalCustomers || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow transition duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendors Mapped</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{totalVendors || 0}</div>
        </div>
      </div>

      {/* Main Table card */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-2">
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Event Requests Registry</h3>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-xl mb-4">
            {error.message}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No event booking requests have been submitted by customers.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Customer</th>
                  <th className="pb-4 px-3">Event Details</th>
                  <th className="pb-4 px-3">Location</th>
                  <th className="pb-4 px-3">Budget</th>
                  <th className="pb-4 px-3">Status</th>
                  <th className="pb-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3">
                      <div className="font-semibold text-foreground">{req.profiles?.full_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{req.profiles?.email}</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-medium text-foreground">{req.event_type}</div>
                      <div className="text-xxs text-muted-foreground mt-0.5">
                        Date: {req.event_date} • {req.guest_count} guests
                      </div>
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-sans max-w-[200px] truncate">
                      {req.location}
                    </td>
                    <td className="py-4 px-3 font-semibold text-purple-600 dark:text-purple-400 font-mono">
                      ₹{Number(req.total_budget).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <a
                        href={`/admin/bookings/${req.id}`}
                        className="inline-flex px-3.5 py-1.5 bg-surface hover:bg-surface-raised text-foreground border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold rounded-xl transition-all duration-200"
                      >
                        Manage Booking
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
