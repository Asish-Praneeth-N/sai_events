import { createClient } from "@/lib/supabase/server";
import EventRequestForm from "./EventRequestForm";

export default async function PlanEventPage() {
  const supabase = await createClient();

  // 1. Fetch active Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 2. Fetch active Subcategories
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("id, category_id, name, description")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 3. Fetch active Service Items and media
  const { data: itemsData } = await supabase
    .from("service_items")
    .select(`
      id,
      subcategory_id,
      name,
      description,
      price,
      pricing_type,
      service_item_media (
        media_url
      )
    `)
    .is("deleted_at", null)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const items = (itemsData || []).map((item: any) => ({
    ...item,
    price: Number(item.price),
    service_item_media: item.service_item_media || [],
  })) as any[];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Plan New Event</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Specify your event parameters and select services from our verified service catalog.
        </p>
      </div>

      <EventRequestForm
        categories={categories}
        subcategories={subcategories}
        items={items}
      />
    </div>
  );
}
