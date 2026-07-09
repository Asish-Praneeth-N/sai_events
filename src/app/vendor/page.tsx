import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorDashboardClient from "@/components/vendor/VendorDashboardClient";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch vendor profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number, business_name, address, status, email, created_at, role, availability_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "vendor") {
    redirect("/unauthorized");
  }

  // If status is Pending or Rejected, the layout will intercept it. But as a secondary check:
  if (profile.status === "Pending" || profile.status === "Rejected") {
    redirect("/vendor/profile"); // fallback
  }

  // 2. Fetch category mappings
  const { data: categoryMappings } = await supabase
    .from("vendor_category_mappings")
    .select("categories(name)")
    .eq("vendor_id", user.id);

  const categories = (categoryMappings || [])
    .map((m) => m.categories?.name)
    .filter(Boolean) as string[];

  // 3. Fetch all vendor assignments to calculate stats & list cards
  const { data: assignments } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      status,
      created_at,
      category_id,
      categories(name),
      event_requests(
        id,
        event_type,
        event_date,
        location,
        guest_count,
        total_budget,
        event_assignments(
          id,
          profiles:assigned_operational_manager_id (
            full_name,
            phone_number,
            email
          )
        )
      )
    `)
    .eq("vendor_id", user.id);

  // 4. Fetch notifications for activity log
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, message, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <VendorDashboardClient
      profile={profile}
      categories={categories}
      assignments={assignments || []}
      notifications={notifications || []}
    />
  );
}
