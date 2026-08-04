import { createClient } from "@/lib/supabase/server";
import EventRequestForm from "./EventRequestForm";
import { EventPart, Recommendation } from "@/lib/types";

export default async function PlanEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch user profile for contact prefill
  let userProfile = null;
  let existingDraft = null;

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, email, phone_number, phone_country_code, whatsapp_number, whatsapp_country_code")
      .eq("id", user.id)
      .single();

    userProfile = prof ? {
      fullName: prof.full_name && prof.full_name !== "Unnamed User" ? prof.full_name : "",
      email: prof.email || user.email || "",
      phoneNumber: prof.phone_number === "0000000000" ? "" : prof.phone_number || "",
      phoneCountryCode: prof.phone_country_code || "+91",
      whatsappNumber: prof.whatsapp_number || (prof.phone_number === "0000000000" ? "" : prof.phone_number || ""),
      whatsappCountryCode: prof.whatsapp_country_code || "+91",
    } : {
      fullName: "",
      email: user.email || "",
      phoneNumber: "",
      phoneCountryCode: "+91",
      whatsappNumber: "",
      whatsappCountryCode: "+91",
    };

    // 2. Fetch existing active draft if any
    try {
      const { data: draft } = await supabase
        .from("event_requests")
        .select("*")
        .eq("customer_id", user.id)
        .eq("is_draft", true)
        .eq("draft_status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      existingDraft = draft || null;
    } catch (_) {}
  }

  // 3. Fetch active Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, is_active, sort_order, created_at, updated_at")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 4. Fetch active Subcategories
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("id, category_id, name, description, is_active, sort_order, created_at, updated_at")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 5. Fetch active Service Items and media
  const { data: itemsData } = await supabase
    .from("service_items")
    .select(`
      *,
      service_item_media (
        media_url
      )
    `)
    .is("deleted_at", null)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  // 6. Fetch active Event Parts Master
  const { data: eventPartsData } = await supabase
    .from("event_parts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 7. Fetch active Recommendations Master
  const { data: recommendationsData } = await supabase
    .from("recommendations")
    .select(`
      *,
      service_item:service_items (*)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 8. Fetch active Master Packages
  const { data: packagesData } = await supabase
    .from("packages")
    .select(`
      *,
      included_services:package_services(*),
      gallery_media:package_media(*)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const items = (itemsData || []).map((item: any) => ({
    ...item,
    price: Number(item.price),
    service_item_media: item.service_item_media || [],
  })) as any[];

  const eventParts = (eventPartsData || []) as EventPart[];
  const recommendations = (recommendationsData || []) as Recommendation[];
  const packages = (packagesData || []) as any[];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-light font-heading text-foreground">Event Planning Studio</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Specify your event parameters, select sub-events, review curated recommendations, and customize catering options.
        </p>
      </div>

      <EventRequestForm
        categories={categories}
        subcategories={subcategories}
        items={items}
        eventParts={eventParts}
        recommendations={recommendations}
        packages={packages}
        userProfile={userProfile}
        existingDraft={existingDraft}
      />
    </div>
  );
}
