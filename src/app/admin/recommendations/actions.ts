"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveRecommendation(data: {
  id?: string;
  eventType: string;
  serviceItemId: string;
  badgeLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
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

  const payload = {
    event_type: data.eventType,
    service_item_id: data.serviceItemId,
    badge_label: data.badgeLabel || "Recommended",
    sort_order: data.sortOrder ?? 0,
    is_active: data.isActive ?? true,
  };

  if (data.id) {
    const { error } = await supabase
      .from("recommendations")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("recommendations")
      .insert([payload]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/recommendations");
}

export async function deleteRecommendation(id: string) {
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
    .from("recommendations")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/recommendations");
}
