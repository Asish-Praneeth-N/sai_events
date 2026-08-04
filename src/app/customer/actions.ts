"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ExtendedProfileInput {
  fullName: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  whatsappSameAsPhone?: boolean;
  address: string;
  locationLat?: number;
  locationLng?: number;
}

export async function saveCustomerProfile(formData: {
  fullName: string;
  phoneNumber: string;
  address: string;
  phoneCountryCode?: string;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  whatsappSameAsPhone?: boolean;
  locationLat?: number;
  locationLng?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const phoneCC = formData.phoneCountryCode || "+91";
  const whatsappCC = formData.whatsappSameAsPhone ? phoneCC : (formData.whatsappCountryCode || "+91");
  const whatsappNum = formData.whatsappSameAsPhone ? formData.phoneNumber : (formData.whatsappNumber || formData.phoneNumber);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      phone_country_code: phoneCC,
      whatsapp_country_code: whatsappCC,
      whatsapp_number: whatsappNum,
      whatsapp_same_as_phone: formData.whatsappSameAsPhone ?? true,
      address: formData.address,
      location_lat: formData.locationLat || null,
      location_lng: formData.locationLng || null,
      profile_completed: true,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/profile");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/request");
}

export interface SaveDraftInput {
  draftId?: string;
  eventType: string;
  eventFor?: string;
  celebrantName?: string;
  eventDate?: string;
  eventTime?: string;
  durationHours?: number;
  venueName?: string;
  venueAddress?: string;
  locationLat?: number;
  locationLng?: number;
  minGuestCount?: number;
  maxGuestCount?: number;
  budgetRange?: string;
  customBudget?: number;
  specialRequirements?: string;
  referenceVideoUrl?: string;
  whatsappNumber?: string;
}

export async function saveEventDraft(draftInput: SaveDraftInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const draftData: Record<string, any> = {
    customer_id: user.id,
    event_type: draftInput.eventType || "Event",
    event_date: draftInput.eventDate || new Date().toISOString().split("T")[0],
    location: draftInput.venueAddress || draftInput.venueName || "TBD",
    guest_count: draftInput.maxGuestCount || draftInput.minGuestCount || 100,
    total_budget: draftInput.customBudget || 0,
    status: "Draft",
    is_draft: true,
    draft_status: "active",
    planning_stage: 1,
    event_for: draftInput.eventFor || null,
    celebrant_name: draftInput.celebrantName || null,
    event_time: draftInput.eventTime || null,
    duration_hours: draftInput.durationHours || 4.0,
    venue_address: draftInput.venueAddress || null,
    min_guest_count: draftInput.minGuestCount || null,
    max_guest_count: draftInput.maxGuestCount || null,
    budget_range: draftInput.budgetRange || null,
    custom_budget: draftInput.customBudget || null,
    special_requirements: draftInput.specialRequirements || null,
    reference_video_url: draftInput.referenceVideoUrl || null,
    whatsapp_number: draftInput.whatsappNumber || null,
  };

  let savedId = draftInput.draftId;

  if (savedId) {
    const { error } = await supabase
      .from("event_requests")
      .update(draftData)
      .eq("id", savedId)
      .eq("customer_id", user.id);

    if (error) throw new Error(error.message);
  } else {
    const { data: newDraft, error } = await supabase
      .from("event_requests")
      .insert(draftData)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    savedId = newDraft.id;
  }

  revalidatePath("/customer/request");
  revalidatePath("/customer/dashboard");
  return { draftId: savedId };
}

export async function discardEventDraft(draftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("event_requests")
    .update({
      draft_status: "discarded",
      discarded_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .eq("customer_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/customer/request");
  revalidatePath("/customer/dashboard");
  return { success: true };
}

export interface CreateEventInput {
  requestId?: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  whatsappNumber?: string;
  eventFor?: string;
  celebrantName?: string;
  eventTime?: string;
  durationHours?: number;
  venueAddress?: string;
  minGuestCount?: number;
  maxGuestCount?: number;
  budgetRange?: string;
  customBudget?: number;
  specialRequirements?: string;
  referenceVideoUrl?: string;
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

  const { data: dbItems, error: itemsError } = await supabase
    .from("service_items")
    .select("id, price, pricing_type, pricing_unit, food_category, meal_type, is_available, name")
    .in("id", itemIds)
    .is("deleted_at", null);

  if (itemsError) throw new Error(itemsError.message);
  if (!dbItems || dbItems.length !== itemIds.length) {
    throw new Error("One or more selected service items are no longer available.");
  }

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

  const refNumber = `SAI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  let requestId = eventData.requestId;

  if (requestId) {
    const { data: existing, error: fetchErr } = await supabase
      .from("event_requests")
      .select("status, customer_id, is_draft")
      .eq("id", requestId)
      .single();

    if (fetchErr || !existing) throw new Error("Event request not found.");
    if (existing.customer_id !== user.id) throw new Error("Unauthorized.");
    
    // Allow editing if status is Request Submitted OR if it is a Draft OR if edit permission granted
    const isSubmittedState = existing.status === "Request Submitted" || existing.is_draft;
    if (!isSubmittedState) {
      // Check if there is an approved edit request
      const { data: approvedEdit } = await supabase
        .from("event_edit_requests")
        .select("id")
        .eq("event_id", requestId)
        .eq("status", "approved")
        .maybeSingle();

      if (!approvedEdit) {
        throw new Error("Event request is locked and requires Admin edit permission to modify.");
      }

      // Mark the edit request as used
      await supabase
        .from("event_edit_requests")
        .update({ status: "used", used_at: new Date().toISOString() })
        .eq("id", approvedEdit.id);
    }

    const { error: updateErr } = await supabase
      .from("event_requests")
      .update({
        event_type: eventData.eventType,
        event_date: eventData.eventDate,
        location: eventData.location,
        guest_count: eventData.guestCount,
        total_budget: totalBudget,
        status: existing.is_draft ? "Request Submitted" : existing.status,
        is_draft: false,
        draft_status: "submitted",
        whatsapp_number: eventData.whatsappNumber || null,
        event_for: eventData.eventFor || null,
        celebrant_name: eventData.celebrantName || null,
        event_time: eventData.eventTime || null,
        duration_hours: eventData.durationHours || 4.0,
        venue_address: eventData.venueAddress || eventData.location,
        min_guest_count: eventData.minGuestCount || null,
        max_guest_count: eventData.maxGuestCount || null,
        budget_range: eventData.budgetRange || null,
        custom_budget: eventData.customBudget || null,
        special_requirements: eventData.specialRequirements || null,
        reference_video_url: eventData.referenceVideoUrl || null,
      })
      .eq("id", requestId);

    if (updateErr) throw new Error(updateErr.message);

    await supabase.from("request_items").delete().eq("request_id", requestId);
    await supabase.from("event_request_parts").delete().eq("request_id", requestId);
  } else {
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
        is_draft: false,
        draft_status: "submitted",
        whatsapp_number: eventData.whatsappNumber || null,
        event_for: eventData.eventFor || null,
        celebrant_name: eventData.celebrantName || null,
        event_time: eventData.eventTime || null,
        duration_hours: eventData.durationHours || 4.0,
        venue_address: eventData.venueAddress || eventData.location,
        reference_number: refNumber,
        min_guest_count: eventData.minGuestCount || null,
        max_guest_count: eventData.maxGuestCount || null,
        budget_range: eventData.budgetRange || null,
        custom_budget: eventData.customBudget || null,
        special_requirements: eventData.specialRequirements || null,
        reference_video_url: eventData.referenceVideoUrl || null,
      })
      .select("id, reference_number")
      .single();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Failed to insert event request.");

    requestId = request.id;
  }

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

  if (eventData.eventPartIds && eventData.eventPartIds.length > 0) {
    const partsPayload = eventData.eventPartIds.map((partId) => ({
      request_id: requestId,
      event_part_id: partId,
    }));

    await supabase.from("event_request_parts").insert(partsPayload);
  }

  revalidatePath("/customer/dashboard");
  revalidatePath(`/customer/events/${requestId}`);
  return { id: requestId, referenceNumber: refNumber };
}

// Request Edit Access for locked/accepted events
export async function createEditRequest(eventId: string, requestedCategories: string[], description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (!requestedCategories || requestedCategories.length === 0) {
    throw new Error("Please select at least one category to edit.");
  }
  if (!description || !description.trim()) {
    throw new Error("Please describe the requested changes.");
  }

  const { error } = await supabase
    .from("event_edit_requests")
    .insert({
      event_id: eventId,
      customer_id: user.id,
      requested_categories: requestedCategories,
      description: description.trim(),
      status: "pending",
    });

  if (error) throw new Error(error.message);

  // Notify Admin
  try {
    await supabase.from("notifications").insert({
      user_type: "admin",
      user_name: user.email,
      message: `Edit Access Requested: Customer requested changes for event ${eventId}.`,
      status: "Delivered",
    });
  } catch (_) {}

  revalidatePath(`/customer/events/${eventId}`);
  return { success: true };
}

// Request Event Meeting
export async function requestEventMeeting(
  eventId: string,
  purpose: string,
  preferredDate: string,
  preferredTimeWindow: string,
  notes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (!purpose || !purpose.trim()) throw new Error("Meeting purpose is required.");
  if (!preferredDate) throw new Error("Preferred meeting date is required.");
  if (!preferredTimeWindow) throw new Error("Preferred time window is required.");

  const { error } = await supabase
    .from("event_meetings")
    .insert({
      event_id: eventId,
      customer_id: user.id,
      purpose: purpose.trim(),
      preferred_date: preferredDate,
      preferred_time_window: preferredTimeWindow,
      notes: notes?.trim() || null,
      status: "Pending",
    });

  if (error) throw new Error(error.message);

  // Notify Admin
  try {
    await supabase.from("notifications").insert({
      user_type: "admin",
      user_name: user.email,
      message: `Meeting Request: Customer requested a sync for event ${eventId}.`,
      status: "Delivered",
    });
  } catch (_) {}

  revalidatePath(`/customer/events/${eventId}`);
  revalidatePath("/customer/dashboard");
  return { success: true };
}

export async function cancelEventRequest(requestId: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

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
  revalidatePath(`/customer/events/${requestId}`);
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
  revalidatePath(`/customer/events/${eventId}`);
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
