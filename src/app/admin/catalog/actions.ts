"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Categories CRUD Server Actions
export async function saveCategory(formData: {
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}) {
  const supabase = await createClient();

  const payload: any = {
    name: formData.name,
    description: formData.description,
    image_url: formData.image_url,
    is_active: formData.is_active ?? true,
    sort_order: formData.sort_order ?? 0,
  };

  let error;

  if (formData.id) {
    const { error: err } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", formData.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("categories")
      .insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

// 2. Subcategories CRUD Server Actions
export async function saveSubcategory(formData: {
  id?: string;
  category_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}) {
  const supabase = await createClient();

  const payload: any = {
    category_id: formData.category_id,
    name: formData.name,
    description: formData.description,
    is_active: formData.is_active ?? true,
    sort_order: formData.sort_order ?? 0,
  };

  let error;

  if (formData.id) {
    const { error: err } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", formData.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("subcategories")
      .insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subcategories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

// 3. Service Items CRUD Server Actions
export async function saveServiceItem(formData: {
  id?: string;
  subcategory_id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: "flat" | "per_plate";
  is_available?: boolean;
  sort_order?: number;
  media_urls?: string[]; // Array of media urls uploaded to Supabase Storage
}) {
  const supabase = await createClient();

  const payload: any = {
    subcategory_id: formData.subcategory_id,
    name: formData.name,
    description: formData.description,
    price: formData.price,
    pricing_type: formData.pricing_type,
    is_available: formData.is_available ?? true,
    sort_order: formData.sort_order ?? 0,
  };

  let itemId = formData.id;
  let error;

  if (formData.id) {
    const { error: err } = await supabase
      .from("service_items")
      .update(payload)
      .eq("id", formData.id);
    error = err;
  } else {
    const { data, error: err } = await supabase
      .from("service_items")
      .insert([payload])
      .select("id")
      .single();
    itemId = data?.id;
    error = err;
  }

  if (error) throw new Error(error.message);
  if (!itemId) throw new Error("Failed to resolve service item ID.");

  // Save multiple media files if passed in
  if (formData.media_urls && formData.media_urls.length > 0) {
    // Delete existing media records for this item (to overwrite)
    if (formData.id) {
      await supabase
        .from("service_item_media")
        .delete()
        .eq("service_item_id", itemId);
    }

    const mediaRows = formData.media_urls.map((url, index) => ({
      service_item_id: itemId,
      media_url: url,
      media_type: url.toLowerCase().endsWith(".mp4") ? "video" : "image",
      display_order: index,
    }));

    const { error: mediaErr } = await supabase
      .from("service_item_media")
      .insert(mediaRows);

    if (mediaErr) throw new Error(mediaErr.message);
  }

  revalidatePath("/admin/catalog");
}

export async function deleteServiceItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("service_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}
