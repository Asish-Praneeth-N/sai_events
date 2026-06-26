import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorServicesManager from "./VendorServicesManager";

export default async function VendorServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: services, error } = await supabase
    .from("vendor_custom_services")
    .select(`
      id,
      category_name,
      subcategory_name,
      service_name,
      custom_price,
      vendor_custom_service_media ( media_url )
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl">
        Failed to load services: {error.message}
      </div>
    );
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id, category_id, name")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">Services</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Build and manage your custom service catalog with pricing.
        </p>
      </div>

      <VendorServicesManager
        initialServices={services || []}
        categories={categories || []}
        subcategories={subcategories || []}
      />
    </div>
  );
}
