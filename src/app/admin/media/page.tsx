import { createClient } from "@/lib/supabase/server";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function AdminMediaPage() {
  const supabase = await createClient();

  // 1. Fetch categories for filters
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null)
    .eq("is_active", true);

  // 2. Fetch media list
  const { data: mediaData, error } = await supabase
    .from("service_item_media")
    .select(`
      id,
      media_url,
      media_type,
      created_at,
      service_items (
        name,
        subcategories (
          name,
          categories (
            id,
            name
          )
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-2xl">
        Failed to load media assets: {error.message}
      </div>
    );
  }

  const media = (mediaData || []) as any[];
  const categories = categoriesData || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Media Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor files uploaded to the catalog storage bucket and manage item links.
        </p>
      </div>

      <MediaLibrary media={media} categories={categories} />
    </div>
  );
}
