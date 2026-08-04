import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorCommandCenter from "@/components/vendor/VendorCommandCenter";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number, business_name, address, status, email, created_at, availability_status")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Category mappings
  const { data: categoryMappings } = await supabase
    .from("vendor_category_mappings")
    .select("categories(name)")
    .eq("vendor_id", user.id);

  const categories = (categoryMappings || [])
    .map((m: any) => m.categories?.name)
    .filter(Boolean) as string[];

  // All assignments (for stats + dashboard cards)
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
          profiles:assigned_operational_manager_id(
            full_name,
            phone_number,
            email
          )
        ),
        request_items(
          quantity,
          unit_price,
          pricing_type,
          service_items(
            name,
            subcategory_id,
            subcategories(category_id)
          )
        )
      )
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  // Notifications (activity feed)
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, message, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  // Portfolio count
  const { count: portfolioCount } = await supabase
    .from("vendor_portfolio")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user.id);

  // Fetch previous guest enquiries linked to vendor account
  let previousEnquiries: any[] = [];
  try {
    const { data: enquiriesData } = await supabase
      .from("guest_enquiries")
      .select("id, event_type, event_description, status, created_at")
      .eq("linked_user_id", user.id)
      .order("created_at", { ascending: false });
    previousEnquiries = enquiriesData || [];
  } catch (_) {}

  return (
    <VendorCommandCenter
      profile={profile as any}
      categories={categories}
      assignments={(assignments || []) as any[]}
      notifications={(notifications || []) as any[]}
      portfolioCount={portfolioCount || 0}
      previousEnquiries={previousEnquiries}
    />
  );
}
