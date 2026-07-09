import { createClient } from "@/lib/supabase/server";
import CustomersList from "@/components/admin/CustomersList";

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
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to load customers: {error.message}
      </div>
    );
  }

  const customers = (customersData || []).map((c: any) => ({
    ...c,
    totalRequests: c.event_requests?.length || 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Clients Directory</h1>
        <p className="text-sm text-muted-foreground mt-1 font-light">
          Monitor customer user accounts, inspect booking metrics, and track venue parameters.
        </p>
      </div>

      {/* Customers List */}
      <CustomersList customers={customers} />
    </div>
  );
}
