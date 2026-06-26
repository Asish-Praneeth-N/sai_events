import { createClient } from "@/lib/supabase/server";
import CatalogList from "@/components/admin/CatalogList";

export default async function AdminCatalogPage() {
  const supabase = await createClient();

  // 1. Fetch Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 2. Fetch Subcategories
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 3. Fetch Service Items along with their associated media URLs
  const { data: itemsData } = await supabase
    .from("service_items")
    .select(`
      *,
      service_item_media (
        media_url
      )
    `)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  
  const items = itemsData?.map((item: any) => ({
    ...item,
    media: item.service_item_media?.map((m: any) => m.media_url) || [],
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Service Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your main event service categories, sub-divisions, packages, and pricing structures.
          </p>
        </div>
      </div>

      <CatalogList
        categories={categories}
        subcategories={subcategories}
        items={items}
      />
    </div>
  );
}
