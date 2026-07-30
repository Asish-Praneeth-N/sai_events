import { createClient } from "@/lib/supabase/server";
import EventRequestForm from "./EventRequestForm";
import { EventPart, Recommendation } from "@/lib/types";

export default async function PlanEventPage() {
  const supabase = await createClient();

  // 1. Fetch active Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, is_active, sort_order, created_at, updated_at")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 2. Fetch active Subcategories
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("id, category_id, name, description, is_active, sort_order, created_at, updated_at")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 3. Fetch active Service Items and media
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

  // 4. Fetch active Event Parts Master
  const { data: eventPartsData } = await supabase
    .from("event_parts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 5. Fetch active Recommendations Master
  const { data: recommendationsData } = await supabase
    .from("recommendations")
    .select(`
      *,
      service_item:service_items (*)
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

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Event Planning Studio</h1>
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
      />
    </div>
  );
}
