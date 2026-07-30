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

export interface CreateEventInput {
  requestId?: string; // Optional for Edit Mode
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  whatsappNumber?: string;
  eventFor?: string;
  eventTime?: string;
  durationHours?: number;
  venueAddress?: string;
  targetBudget?: number;
  specialRequirements?: string;
  eventPartIds?: string[];
  items: { serviceItemId: string; quantity: number }[];
}

export async function createEventRequest(eventData: CreateEventInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (eventData.items.length === 0) throw new Error("Please select at least one service item.");
  if (eventData.guestCount <= 0) throw new Error("Guest count must be greater than zero.");

  const itemIds = eventData.items.map((i) => i.serviceItemId);

  // 1. Fetch item prices, pricing units, and categories directly from database
  const { data: dbItems, error: itemsError } = await supabase
    .from("service_items")
    .select("id, price, pricing_type, pricing_unit, food_category, meal_type, is_available, name")
    .in("id", itemIds)
    .is("deleted_at", null);

  if (itemsError) throw new Error(itemsError.message);
  if (!dbItems || dbItems.length !== itemIds.length) {
    throw new Error("One or more selected service items are no longer available.");
  }

  // 2. Calculate total budget based on pricing_unit
  let totalBudget = 0;
  const requestItemsToInsert = eventData.items.map((clientItem) => {
    const dbItem = dbItems.find((i) => i.id === clientItem.serviceItemId);
    if (!dbItem) throw new Error("Item not found");
    if (!dbItem.is_available) throw new Error(`Item ${dbItem.name} is not available.`);

    const unitPrice = Number(dbItem.price);
    const unit = dbItem.pricing_unit || (dbItem.pricing_type === "per_plate" ? "per_plate" : "fixed");

    let itemTotal = 0;
    if (unit === "per_plate") {
      itemTotal = unitPrice * eventData.guestCount * clientItem.quantity;
    } else {
      // per_piece or fixed
      itemTotal = unitPrice * clientItem.quantity;
    }

    totalBudget += itemTotal;

    return {
      service_item_id: clientItem.serviceItemId,
      quantity: clientItem.quantity,
      unit_price: unitPrice,
      pricing_type: dbItem.pricing_type,
      pricing_unit: unit,
      food_category: dbItem.food_category || "general",
      meal_type: dbItem.meal_type || "general",
    };
  });

  // Generate Reference Number
  const refNumber = `SAI-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let requestId = eventData.requestId;

  if (requestId) {
    // EDIT MODE: Update existing event request if status is 'Request Submitted'
    const { data: existing, error: fetchErr } = await supabase
      .from("event_requests")
      .select("status, customer_id")
      .eq("id", requestId)
      .single();

    if (fetchErr || !existing) throw new Error("Event request not found.");
    if (existing.customer_id !== user.id) throw new Error("Unauthorized.");
    if (existing.status !== "Request Submitted") throw new Error("Event request is locked and cannot be edited.");

    const { error: updateErr } = await supabase
      .from("event_requests")
      .update({
        event_type: eventData.eventType,
        event_date: eventData.eventDate,
        location: eventData.location,
        guest_count: eventData.guestCount,
        total_budget: totalBudget,
        whatsapp_number: eventData.whatsappNumber || null,
        event_for: eventData.eventFor || null,
        event_time: eventData.eventTime || null,
        duration_hours: eventData.durationHours || 4.0,
        venue_address: eventData.venueAddress || eventData.location,
        target_budget: eventData.targetBudget || null,
        special_requirements: eventData.specialRequirements || null,
      })
      .eq("id", requestId);

    if (updateErr) throw new Error(updateErr.message);

    // Delete existing request_items and event_request_parts to overwrite
    await supabase.from("request_items").delete().eq("request_id", requestId);
    await supabase.from("event_request_parts").delete().eq("request_id", requestId);
  } else {
    // CREATE MODE: Insert new event request
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
        whatsapp_number: eventData.whatsappNumber || null,
        event_for: eventData.eventFor || null,
        event_time: eventData.eventTime || null,
        duration_hours: eventData.durationHours || 4.0,
        venue_address: eventData.venueAddress || eventData.location,
        reference_number: refNumber,
        target_budget: eventData.targetBudget || null,
        special_requirements: eventData.specialRequirements || null,
      })
      .select("id, reference_number")
      .single();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Failed to insert event request.");

    requestId = request.id;
  }

  // 3. Create request items
  const itemsPayload = requestItemsToInsert.map((item) => ({
    request_id: requestId,
    ...item,
  }));

  const { error: itemsInsertError } = await supabase
    .from("request_items")
    .insert(itemsPayload);

  if (itemsInsertError) {
    if (!eventData.requestId) {
      await supabase.from("event_requests").delete().eq("id", requestId);
    }
    throw new Error(itemsInsertError.message);
  }

  // 4. Create event request parts if selected
  if (eventData.eventPartIds && eventData.eventPartIds.length > 0) {
    const partsPayload = eventData.eventPartIds.map((partId) => ({
      request_id: requestId,
      event_part_id: partId,
    }));

    await supabase.from("event_request_parts").insert(partsPayload);
  }

  revalidatePath("/customer/dashboard");
  return { id: requestId, referenceNumber: refNumber };
}

export async function cancelEventRequest(requestId: string, reason?: string) {
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
    .update({
      status: "Cancelled",
      cancellation_reason: reason || "Cancelled by customer",
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/dashboard");
}

export async function uploadCustomerDocument(
  eventId: string,
  fileName: string,
  fileUrl: string,
  fileType: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: request, error: getError } = await supabase
    .from("event_requests")
    .select("customer_id")
    .eq("id", eventId)
    .single();

  if (getError) throw new Error("Event request not found");
  if (request.customer_id !== user.id) throw new Error("Unauthorized action.");

  const { data, error } = await supabase
    .from("documents")
    .insert({
      event_id: eventId,
      uploaded_by: user.id,
      file_name: fileName,
      file_url: fileUrl,
      file_type: fileType,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/customer/dashboard");
  return data;
}

export async function deleteCustomerDocument(documentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("uploaded_by", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/dashboard");
  return { success: true };
}
