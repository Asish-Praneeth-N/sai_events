import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorProfileForm from "./VendorProfileForm";

export default async function VendorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch full profile record with extended vendor fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-[9.5px] uppercase tracking-widest font-bold text-accent-gold">Business Management</p>
        <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Extended Business Profile & Assets</h1>
        <p className="text-xs text-muted-foreground font-light mt-1">
          Manage company credentials, location & service radius, bank verification, compliance certificates, godown, and vehicle assets.
        </p>
      </div>

      <VendorProfileForm
        profile={profile}
        userEmail={user.email || ""}
        categories={categories || []}
        initialMappings={mappings?.map((m) => m.category_id) || []}
        portfolioItems={portfolioItems || []}
      />
    </div>
  );
}
