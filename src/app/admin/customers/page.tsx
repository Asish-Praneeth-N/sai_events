import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customersData, error } = await supabase
    .from("profiles")
    .select(`
      *,
      event_requests (
        id
      )
    `)
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-2xl">
        Failed to load customers: {error.message}
      </div>
    );
  }

  const customers = (customersData || []).map((c: any) => ({
    ...c,
    totalRequests: c.event_requests?.length || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all registered platform clients, check their booking volumes, and audit detailed activity histories.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Clients Registry</h3>

        {customers.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No customers have registered on the platform yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Customer ID</th>
                  <th className="pb-4 px-3">Customer Name</th>
                  <th className="pb-4 px-3">Mobile Number</th>
                  <th className="pb-4 px-3">Email Address</th>
                  <th className="pb-4 px-3">Default Location</th>
                  <th className="pb-4 px-3 col-span-1">Total Requests</th>
                  <th className="pb-4 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3 font-mono text-[10px] text-muted-foreground">
                      {customer.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-3 font-semibold text-foreground">
                      {customer.full_name}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground">
                      {customer.phone_number}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-sans">
                      {customer.email}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground max-w-[150px] truncate">
                      {customer.address || "N/A"}
                    </td>
                    <td className="py-4 px-3 font-semibold text-purple-600 dark:text-purple-400 font-mono">
                      {customer.totalRequests}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <a
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-foreground text-xs font-semibold rounded-xl transition-all duration-200"
                      >
                        View Details
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
