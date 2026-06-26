import { createClient } from "@/lib/supabase/server";
import VendorsList from "@/components/admin/VendorsList";

export default async function AdminVendorsPage() {
  const supabase = await createClient();

  const { data: vendorsData, error } = await supabase
    .from("profiles")
    .select(`
      *,
      vendor_category_mappings (
        category_id,
        categories (
          name
        )
      )
    `)
    .eq("role", "vendor")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to load vendors: {error.message}
      </div>
    );
  }

  const vendors = (vendorsData || []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Vendor Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Approve incoming provider requests, configure service category mappings, and toggle active states.
        </p>
      </div>

      <VendorsList vendors={vendors} />
    </div>
  );
}
