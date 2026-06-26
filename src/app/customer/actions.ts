"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveCustomerProfile(formData: {
  fullName: string;
  phoneNumber: string;
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
      address: formData.address,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/profile");
}

export async function createEventRequest(eventData: {
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  items: { serviceItemId: string; quantity: number }[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (eventData.items.length === 0) throw new Error("Please select at least one service item.");
  if (eventData.guestCount <= 0) throw new Error("Guest count must be greater than zero.");

  const itemIds = eventData.items.map((i) => i.serviceItemId);

  // 1. Fetch item prices and pricing types from database to prevent client-side tempering
  const { data: dbItems, error: itemsError } = await supabase
    .from("service_items")
    .select("id, price, pricing_type, is_available, name")
    .in("id", itemIds)
    .is("deleted_at", null);

  if (itemsError) throw new Error(itemsError.message);
  if (!dbItems || dbItems.length !== itemIds.length) {
    throw new Error("One or more selected service items are no longer available.");
  }

  // 2. Calculate budget
  let totalBudget = 0;
  const requestItemsToInsert = eventData.items.map((clientItem) => {
    const dbItem = dbItems.find((i) => i.id === clientItem.serviceItemId);
    if (!dbItem) throw new Error("Item not found");
    if (!dbItem.is_available) throw new Error(`Item ${dbItem.name} is not available.`);

    const unitPrice = Number(dbItem.price);
    let itemTotal = 0;
    if (dbItem.pricing_type === "flat") {
      itemTotal = unitPrice * clientItem.quantity;
    } else if (dbItem.pricing_type === "per_plate") {
      itemTotal = unitPrice * eventData.guestCount * clientItem.quantity;
    }

    totalBudget += itemTotal;

    return {
      service_item_id: clientItem.serviceItemId,
      quantity: clientItem.quantity,
      unit_price: unitPrice,
      pricing_type: dbItem.pricing_type,
    };
  });

  // 3. Create the event request
  const { data: request, error: requestError } = await supabase
    .from("event_requests")
    .insert({
      customer_id: user.id,
      event_type: eventData.eventType,
      event_date: eventData.eventDate,
      location: eventData.location,
      guest_count: eventData.guestCount,
      total_budget: totalBudget,
      status: "Request Submitted",
    })
    .select("id")
    .single();

  if (requestError) throw new Error(requestError.message);
  if (!request) throw new Error("Failed to insert event request.");

  // 4. Create request items
  const itemsPayload = requestItemsToInsert.map((item) => ({
    request_id: request.id,
    ...item,
  }));

  const { error: itemsInsertError } = await supabase
    .from("request_items")
    .insert(itemsPayload);

  if (itemsInsertError) {
    // Attempt cleanup of request
    await supabase.from("event_requests").delete().eq("id", request.id);
    throw new Error(itemsInsertError.message);
  }

  revalidatePath("/customer/dashboard");
  return request.id;
}

export async function cancelEventRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Validate owner or admin
  const { data: request, error: getError } = await supabase
    .from("event_requests")
    .select("customer_id")
    .eq("id", requestId)
    .single();

  if (getError) throw new Error("Request not found");
  if (request.customer_id !== user.id) throw new Error("Unauthorized action.");

  const { error } = await supabase
    .from("event_requests")
    .update({ status: "Cancelled" })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/dashboard");
}
