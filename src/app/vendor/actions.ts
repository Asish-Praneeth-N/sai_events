"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveVendorProfile(formData: {
  fullName: string;
  phoneNumber: string;
  businessName: string;
  address: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      business_name: formData.businessName,
      address: formData.address,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/vendor/profile");
}

export async function updateVendorCategoryMappings(categoryIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Delete current mappings
  await supabase
    .from("vendor_category_mappings")
    .delete()
    .eq("vendor_id", user.id);

  if (categoryIds.length > 0) {
    const mappings = categoryIds.map((catId) => ({
      vendor_id: user.id,
      category_id: catId,
    }));

    const { error } = await supabase
      .from("vendor_category_mappings")
      .insert(mappings);

    if (error) throw new Error(error.message);
  }

  revalidatePath("/vendor/profile");
}

interface ServiceInput {
  serviceItemId: string;
  customPrice: number;
  mediaUrls: string[];
}

export async function saveVendorServices(services: ServiceInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Fetch current vendor services to identify existing and deleted
  const { data: existingServices, error: fetchErr } = await supabase
    .from("vendor_services")
    .select("id, service_item_id")
    .eq("vendor_id", user.id);

  if (fetchErr) throw new Error(fetchErr.message);

  const existingMap = new Map(existingServices?.map((s) => [s.service_item_id, s.id]) || []);

  // 2. Identify service items to delete (those that are in existingMap but not in new services list)
  const newServiceItemIds = new Set(services.map((s) => s.serviceItemId));
  const toDeleteIds: string[] = [];
  existingMap.forEach((id, serviceItemId) => {
    if (!newServiceItemIds.has(serviceItemId)) {
      toDeleteIds.push(id);
    }
  });

  if (toDeleteIds.length > 0) {
    const { error: delErr } = await supabase
      .from("vendor_services")
      .delete()
      .in("id", toDeleteIds);
    if (delErr) throw new Error(delErr.message);
  }

  // 3. Upsert selected services and insert media
  for (const s of services) {
    let vendorServiceId = existingMap.get(s.serviceItemId);

    if (vendorServiceId) {
      // Update price
      const { error: updErr } = await supabase
        .from("vendor_services")
        .update({ custom_price: s.customPrice })
        .eq("id", vendorServiceId);
      if (updErr) throw new Error(updErr.message);
    } else {
      // Insert new vendor service
      const { data: insData, error: insErr } = await supabase
        .from("vendor_services")
        .insert({
          vendor_id: user.id,
          service_item_id: s.serviceItemId,
          custom_price: s.customPrice,
        })
        .select("id")
        .single();
      if (insErr) throw new Error(insErr.message);
      vendorServiceId = insData.id;
    }

    // Update media items for this vendor service
    // Simplest approach: delete existing media links for this vendor_service_id, then insert new ones
    const { error: mediaDelErr } = await supabase
      .from("vendor_service_media")
      .delete()
      .eq("vendor_service_id", vendorServiceId);
      
    if (mediaDelErr) throw new Error(mediaDelErr.message);

    if (s.mediaUrls.length > 0) {
      const mediaRecords = s.mediaUrls.map((url) => ({
        vendor_service_id: vendorServiceId,
        media_url: url,
      }));
      const { error: mediaErr } = await supabase
        .from("vendor_service_media")
        .insert(mediaRecords);
      if (mediaErr) throw new Error(mediaErr.message);
    }
  }

  revalidatePath("/vendor/profile");
}
