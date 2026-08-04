import { createClient } from "@/lib/supabase/server";
import { PackageMaster, EventPart, ServiceItem } from "@/lib/types";
import PackageManager from "./PackageManager";

export const metadata = {
  title: "Package Builder — Sai Events Admin",
  description: "Configure Level 1 Event Part Packages & Level 2 Service Packages with budget fit recommendations.",
};

export default async function AdminPackagesPage() {
  const supabase = await createClient();

  const { data: rawPackages } = await supabase
    .from("packages")
    .select(`
      *,
      included_services:package_services(*),
      gallery_media:package_media(*)
    `)
    .order("created_at", { ascending: false });

  const { data: eventParts } = await supabase
    .from("event_parts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: serviceItems } = await supabase
    .from("service_items")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const packages = (rawPackages || []) as PackageMaster[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PackageManager
        initialPackages={packages}
        eventParts={(eventParts || []) as EventPart[]}
        serviceItems={(serviceItems || []) as ServiceItem[]}
      />
    </div>
  );
}
