"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveEventPart(data: {
  id?: string;
  eventType: string;
  name: string;
  description?: string;
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
    name: data.name,
    description: data.description || null,
    sort_order: data.sortOrder ?? 0,
    is_active: data.isActive ?? true,
  };

  if (data.id) {
    const { error } = await supabase
      .from("event_parts")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("event_parts")
      .insert([payload]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/event-parts");
}

export async function deleteEventPart(id: string) {
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
    .from("event_parts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/event-parts");
}
