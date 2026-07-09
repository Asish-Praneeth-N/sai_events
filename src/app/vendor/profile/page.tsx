import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorProfileForm from "./VendorProfileForm";

export default async function VendorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, business_name, address, availability_status")
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

  // Fetch vendor portfolio from DB
  const { data: portfolioItems } = await supabase
    .from("vendor_portfolio")
    .select("id, image_url, caption, display_order")
    .eq("vendor_id", user.id)
    .order("display_order", { ascending: true });

  const initialProfile = {
    fullName: profile?.full_name || "",
    phoneNumber: profile?.phone_number === "0000000000" ? "" : profile?.phone_number || "",
    businessName: profile?.business_name || "",
    address: profile?.address || "",
    email: user.email || "",
    availabilityStatus: (profile?.availability_status as "Available" | "Busy" | "Leave") || "Available",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-[9.5px] uppercase tracking-widest font-bold text-muted-foreground">Account</p>
        <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Business Profile</h1>
        <p className="text-xs text-muted-foreground font-light mt-1">
          Manage your business details, service categories, and showcase gallery.
        </p>
      </div>

      <VendorProfileForm
        initialProfile={initialProfile}
        categories={categories || []}
        initialMappings={mappings?.map((m) => m.category_id) || []}
        portfolioItems={portfolioItems || []}
      />
    </div>
  );
}
