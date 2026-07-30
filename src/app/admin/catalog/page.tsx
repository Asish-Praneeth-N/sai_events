import { createClient } from "@/lib/supabase/server";
import CatalogList from "@/components/admin/CatalogList";

export default async function AdminCatalogPage() {
  const supabase = await createClient();

  // 1. Fetch Main Categories (Level 1)
  const { data: mainCategoriesData } = await supabase
    .from("main_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // 2. Fetch Categories (Level 2)
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 3. Fetch Subcategories (Level 3)
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 4. Fetch Service Items (Level 4)
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

  const mainCategories = mainCategoriesData || [];
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
          <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest">Master Data</span>
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">4-Level Service Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hierarchy: <strong className="text-accent-gold">Main Category</strong> → <strong>Category</strong> → <strong>Subcategory</strong> → <strong>Service Items</strong>.
          </p>
        </div>
      </div>

      <CatalogList
        mainCategories={mainCategories}
        categories={categories}
        subcategories={subcategories}
        items={items}
      />
    </div>
  );
}
