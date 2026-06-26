import { createClient } from "@/lib/supabase/server";
import VendorProfileForm from "./VendorProfileForm";

export default async function VendorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-zinc-400">Loading session…</div>
      </div>
    );
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, business_name, address")
    .eq("id", user.id)
    .single();

  // Fetch active categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, description")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Fetch current category mappings
  const { data: mappings } = await supabase
    .from("vendor_category_mappings")
    .select("category_id")
    .eq("vendor_id", user.id);

  const initialProfile = {
    fullName: profile?.full_name || "",
    phoneNumber: profile?.phone_number === "0000000000" ? "" : profile?.phone_number || "",
    businessName: profile?.business_name || "",
    address: profile?.address || "",
    email: user.email || "",
  };

  return (
    <VendorProfileForm
      initialProfile={initialProfile}
      categories={categories || []}
      initialMappings={mappings?.map((m) => m.category_id) || []}
    />
  );
}
