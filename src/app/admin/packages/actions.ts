"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PackageType } from "@/lib/types";

export async function savePackage(formData: {
  id?: string;
  packageType: PackageType;
  eventType: string;
  eventPartId?: string | null;
  serviceItemId?: string | null;
  name: string;
  description: string;
  price: number;
  originalValue?: number | null;
  isRecommended?: boolean;
  minSuitableBudget?: number | null;
  maxSuitableBudget?: number | null;
  recommendationPriority?: number;
  coverImageUrl?: string | null;
  refVideoUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  includedServices?: string[];
  galleryUrls?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const originalVal = formData.originalValue && formData.originalValue > 0 ? formData.originalValue : null;
  const savings = originalVal && originalVal > formData.price ? originalVal - formData.price : 0;

  const payload = {
    package_type: formData.packageType,
    event_type: formData.eventType,
    event_part_id: formData.eventPartId || null,
    service_item_id: formData.serviceItemId || null,
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: formData.price,
    original_value: originalVal,
    savings: savings,
    is_recommended: formData.isRecommended ?? false,
    min_suitable_budget: formData.minSuitableBudget || null,
    max_suitable_budget: formData.maxSuitableBudget || null,
    recommendation_priority: formData.recommendationPriority ?? 0,
    cover_image_url: formData.coverImageUrl || null,
    ref_video_url: formData.refVideoUrl || null,
    is_active: formData.isActive ?? true,
    sort_order: formData.sortOrder ?? 0,
  };

  let packageId = formData.id;

  if (formData.id) {
    const { error } = await supabase
      .from("packages")
      .update(payload)
      .eq("id", formData.id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("packages")
      .insert([payload])
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    packageId = data.id;
  }

  if (!packageId) throw new Error("Failed to resolve package ID.");

  // Save included services list
  if (formData.includedServices) {
    await supabase.from("package_services").delete().eq("package_id", packageId);
    if (formData.includedServices.length > 0) {
      const rows = formData.includedServices
        .filter((s) => s.trim().length > 0)
        .map((serviceName) => ({
          package_id: packageId,
          service_name: serviceName.trim(),
          is_included: true,
        }));
      if (rows.length > 0) {
        await supabase.from("package_services").insert(rows);
      }
    }
  }

  // Save media gallery
  if (formData.galleryUrls) {
    await supabase.from("package_media").delete().eq("package_id", packageId);
    if (formData.galleryUrls.length > 0) {
      const mediaRows = formData.galleryUrls
        .filter((u) => u.trim().length > 0)
        .map((url, idx) => ({
          package_id: packageId,
          media_url: url.trim(),
          media_type: url.toLowerCase().endsWith(".mp4") ? "video" : "image",
          display_order: idx,
        }));
      if (mediaRows.length > 0) {
        await supabase.from("package_media").insert(mediaRows);
      }
    }
  }

  revalidatePath("/admin/packages");
  revalidatePath("/admin/catalog");
  return { success: true, packageId };
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/packages");
  revalidatePath("/admin/catalog");
  return { success: true };
}
