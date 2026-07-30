import { createClient } from "@/lib/supabase/server";
import { Recommendation, ServiceItem } from "@/lib/types";
import RecommendationsManager from "./RecommendationsManager";

export default async function AdminRecommendationsPage() {
  const supabase = await createClient();

  const { data: recsData } = await supabase
    .from("recommendations")
    .select(`
      *,
      service_item:service_items (*)
    `)
    .order("sort_order", { ascending: true });

  const { data: itemsData } = await supabase
    .from("service_items")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const recommendations = (recsData || []) as Recommendation[];
  const serviceItems = (itemsData || []) as ServiceItem[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <RecommendationsManager recommendations={recommendations} serviceItems={serviceItems} />
    </div>
  );
}
