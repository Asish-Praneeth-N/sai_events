"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CustomServiceInput {
  categoryName: string;
  subcategoryName: string;
  serviceName: string;
  customPrice: number;
  mediaUrls: string[];
}

export async function addCustomService(data: CustomServiceInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Validate fields
  if (!data.categoryName.trim()) throw new Error("Category name is required.");
  if (!data.subcategoryName.trim()) throw new Error("Subcategory name is required.");
  if (!data.serviceName.trim()) throw new Error("Service name is required.");
  if (data.customPrice < 0) throw new Error("Price cannot be negative.");

  // 1. Insert into vendor_custom_services
  const { data: service, error: serviceErr } = await supabase
    .from("vendor_custom_services")
    .insert({
      vendor_id: user.id,
      category_name: data.categoryName.trim(),
      subcategory_name: data.subcategoryName.trim(),
      service_name: data.serviceName.trim(),
      custom_price: data.customPrice,
    })
    .select("id")
    .single();

  if (serviceErr) throw new Error(serviceErr.message);

  // 2. Insert media URLs if present
  if (data.mediaUrls.length > 0) {
    const mediaRecords = data.mediaUrls.map((url) => ({
      vendor_custom_service_id: service.id,
      media_url: url,
    }));

    const { error: mediaErr } = await supabase
      .from("vendor_custom_service_media")
      .insert(mediaRecords);

    if (mediaErr) {
      // Rollback service insert if media link fails
      await supabase.from("vendor_custom_services").delete().eq("id", service.id);
      throw new Error(mediaErr.message);
    }
  }

  revalidatePath("/vendor/services");
  // Also revalidate admin view in case they are looking at vendor profile
  revalidatePath("/admin/vendors");
}

export async function deleteCustomService(serviceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const { data: existing, error: fetchErr } = await supabase
    .from("vendor_custom_services")
    .select("vendor_id")
    .eq("id", serviceId)
    .single();

  if (fetchErr || !existing) throw new Error("Service not found.");
  if (existing.vendor_id !== user.id) throw new Error("Unauthorized action.");

  // Delete
  const { error: delErr } = await supabase
    .from("vendor_custom_services")
    .delete()
    .eq("id", serviceId);

  if (delErr) throw new Error(delErr.message);

  revalidatePath("/vendor/services");
  revalidatePath("/admin/vendors");
}
