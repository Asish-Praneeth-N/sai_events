import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch customer details
  const { data: customer, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (profileErr || !customer) {
    notFound();
  }

  // 2. Fetch customer request history
  const { data: requestsData, error: requestsErr } = await supabase
    .from("event_requests")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="px-3.5 py-2 bg-surface hover:bg-surface-raised text-foreground border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold rounded-xl transition-all duration-200"
        >
          ← Back to Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customer Information Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-6 lg:col-span-1 h-fit animate-fade-in-up stagger-1">
          <h2 className="text-xl font-bold font-heading text-purple-600 dark:text-purple-400 border-b border-border/50 pb-3">
            Client Information
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer Name</div>
              <div className="text-foreground font-bold mt-1">{customer.full_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</div>
              <div className="text-foreground font-semibold mt-1 font-sans">{customer.email}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</div>
              <div className="text-foreground font-semibold mt-1">{customer.phone_number}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Default Venue Address</div>
              <div className="text-foreground mt-2 bg-background p-4 rounded-2xl border border-border/50 leading-relaxed text-xs">
                {customer.address || "No address specified"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Joined Date</div>
              <div className="text-foreground font-semibold mt-1">
                {formatDate(customer.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Request History Log Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 animate-fade-in-up stagger-2">
          <h3 className="text-lg font-bold font-heading text-foreground">Historical Request Log</h3>

          {requests.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
              No booking requests have been planned by this client.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-4 px-3">Request ID</th>
                    <th className="pb-4 px-3">Event Type</th>
                    <th className="pb-4 px-3">Date</th>
                    <th className="pb-4 px-3">Budget</th>
                    <th className="pb-4 px-3">Status</th>
                    <th className="pb-4 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="py-4 px-3 font-mono text-[10px] text-muted-foreground">
                        {req.id.substring(0, 8)}...
                      </td>
                      <td className="py-4 px-3 font-semibold text-foreground">
                        {req.event_type}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-medium">
                        {req.event_date}
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
                          Manage
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
    </div>
  );
}
