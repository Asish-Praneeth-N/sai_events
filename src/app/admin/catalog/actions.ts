"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Main Categories (Level 1) CRUD Server Actions
export async function saveMainCategory(formData: {
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
      .from("main_categories")
      .update(payload)
      .eq("id", formData.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("main_categories")
      .insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

export async function deleteMainCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("main_categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/catalog");
}

// 2. Categories (Level 2) CRUD Server Actions
export async function saveCategory(formData: {
  id?: string;
  main_category_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}) {
  const supabase = await createClient();

  const payload: any = {
    main_category_id: formData.main_category_id || null,
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

// 3. Subcategories (Level 3) CRUD Server Actions
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

// 4. Service Items (Level 4) CRUD Server Actions
export async function saveServiceItem(formData: {
  id?: string;
  subcategory_id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: "flat" | "per_plate";
  pricing_unit?: "per_plate" | "per_piece" | "fixed";
  food_category?: "veg" | "non_veg" | "beverage" | "dessert" | "general";
  meal_type?: "breakfast" | "lunch" | "dinner" | "high_tea" | "cocktail" | "dessert" | "general";
  is_available?: boolean;
  sort_order?: number;
  media_urls?: string[];
}) {
  const supabase = await createClient();

  const payload: any = {
    subcategory_id: formData.subcategory_id,
    name: formData.name,
    description: formData.description,
    price: formData.price,
    pricing_type: formData.pricing_type,
    pricing_unit: formData.pricing_unit || (formData.pricing_type === "per_plate" ? "per_plate" : "fixed"),
    food_category: formData.food_category || "general",
    meal_type: formData.meal_type || "general",
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

  if (formData.media_urls && formData.media_urls.length > 0) {
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
