import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VendorDetailsCard from "@/components/admin/VendorDetailsCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminVendorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vendor, error } = await supabase
    .from("profiles")
    .select(`
      *,
      vendor_category_mappings (
        category_id,
        categories (
          name
        )
      )
    `)
    .eq("id", id)
    .eq("role", "vendor")
    .single();

  if (error || !vendor) {
    notFound();
  }

  let customServices: any[] = [];
  try {
    const { data: servicesData } = await supabase
      .from("vendor_custom_services")
      .select(`
        id,
        category_name,
        subcategory_name,
        service_name,
        custom_price,
        vendor_custom_service_media (
          media_url
        )
      `)
      .eq("vendor_id", id);
    if (servicesData) {
      customServices = servicesData;
    }
  } catch (err) {
    console.warn("vendor_custom_services not migrated:", err);
  }

  return (
    <div className="space-y-6">
      <VendorDetailsCard vendor={vendor as any} customServices={customServices} />
    </div>
  );
}
