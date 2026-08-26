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

export interface AdditionalContactInput {
  name: string;
  phone: string;
  relation?: string;
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
  additionalContacts?: AdditionalContactInput[];
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
    additional_contacts: draftInput.additionalContacts || null,
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

export interface EventPartConfigInput {
  eventPartId: string;
  eventPartName: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueLocation?: string;
  requiredServices?: string[];
  minGuests?: number;
  maxGuests?: number;
  planningMode?: "RECOMMENDED" | "CUSTOM" | string;
  selectedPackageId?: string;
  customServices?: {
    serviceItemId?: string;
    servicePackageId?: string;
    customRequirements?: string;
  }[];
  cateringConfig?: {
    mealTypes: string[];
    foodPreference: "veg" | "non_veg" | "both";
    vegPlateCount: number;
    nonVegPlateCount: number;
  };
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
  additionalContacts?: AdditionalContactInput[];
  eventPartIds?: string[];
  eventPartsConfig?: EventPartConfigInput[];
  items: { serviceItemId: string; quantity: number }[];
}

export async function createEventRequest(eventData: CreateEventInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (eventData.guestCount <= 0) throw new Error("Guest count must be greater than zero.");

  let totalBudget = 0;
  let requestItemsToInsert: any[] = [];

  // Calculate items total if traditional service items passed
  if (eventData.items && eventData.items.length > 0) {
    const isValidUUID = (id: string) =>
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    const validItemIds = eventData.items
      .map((i) => i.serviceItemId)
      .filter((id) => isValidUUID(id));

    let dbItems: any[] = [];
    if (validItemIds.length > 0) {
      const { data, error: itemsError } = await supabase
        .from("service_items")
        .select("id, price, pricing_type, pricing_unit, food_category, meal_type, is_available, name")
        .in("id", validItemIds)
        .is("deleted_at", null);

      if (!itemsError && data) dbItems = data;
    }

    // Default price map for built-in gourmet catering items
    const DEFAULT_PRICE_MAP: Record<string, { price: number; type: string }> = {
      "00000000-0000-4000-8000-000000000101": { price: 350, type: "per_plate" },
      "00000000-0000-4000-8000-000000000102": { price: 380, type: "per_plate" },
      "00000000-0000-4000-8000-000000000103": { price: 250, type: "per_plate" },
      "00000000-0000-4000-8000-000000000104": { price: 450, type: "per_plate" },
      "00000000-0000-4000-8000-000000000105": { price: 550, type: "per_plate" },
      "00000000-0000-4000-8000-000000000106": { price: 750, type: "per_plate" },
      "00000000-0000-4000-8000-000000000107": { price: 320, type: "per_plate" },
      "00000000-0000-4000-8000-000000000108": { price: 650, type: "per_plate" },
      "00000000-0000-4000-8000-000000000109": { price: 680, type: "per_plate" },
      "00000000-0000-4000-8000-000000000110": { price: 880, type: "per_plate" },
      "00000000-0000-4000-8000-000000000111": { price: 220, type: "per_plate" },
      "00000000-0000-4000-8000-000000000112": { price: 280, type: "per_plate" },
    };

    requestItemsToInsert = [];
    for (const clientItem of eventData.items) {
      if (!isValidUUID(clientItem.serviceItemId) || clientItem.quantity <= 0) continue;

      const dbItem = dbItems.find((item) => item.id === clientItem.serviceItemId);
      const fallback = DEFAULT_PRICE_MAP[clientItem.serviceItemId];

      const unitPrice = dbItem ? Number(dbItem.price) : fallback ? fallback.price : 350;
      const pricingType = dbItem ? dbItem.pricing_type : fallback ? fallback.type : "per_plate";

      if (pricingType === "flat") {
        totalBudget += unitPrice * clientItem.quantity;
      } else {
        totalBudget += unitPrice * eventData.guestCount * clientItem.quantity;
      }

      // ONLY insert into request_items DB table if item actually exists in service_items DB table (prevents foreign key violation)
      if (dbItem) {
        requestItemsToInsert.push({
          service_item_id: clientItem.serviceItemId,
          quantity: clientItem.quantity,
          unit_price: unitPrice,
          pricing_type: pricingType,
        });
      }
    }
  }

  // Calculate snapshot price if hierarchical event parts config passed
  if (eventData.eventPartsConfig && eventData.eventPartsConfig.length > 0) {
    for (const pConfig of eventData.eventPartsConfig) {
      if (pConfig.planningMode === "RECOMMENDED" && pConfig.selectedPackageId) {
        const { data: pkgData } = await supabase
          .from("packages")
          .select("price")
          .eq("id", pConfig.selectedPackageId)
          .single();
        if (pkgData) {
          totalBudget += Number(pkgData.price);
        }
      } else if (pConfig.planningMode === "CUSTOM" && pConfig.customServices) {
        for (const cs of pConfig.customServices) {
          if (cs.servicePackageId) {
            const { data: sp } = await supabase.from("packages").select("price").eq("id", cs.servicePackageId).single();
            if (sp) totalBudget += Number(sp.price);
          } else if (cs.serviceItemId) {
            const { data: si } = await supabase.from("service_items").select("price").eq("id", cs.serviceItemId).single();
            if (si) totalBudget += Number(si.price);
          }
        }
      }

      if (pConfig.cateringConfig) {
        const cat = pConfig.cateringConfig;
        const basePlateEstimate = 600;
        totalBudget += (cat.vegPlateCount + cat.nonVegPlateCount) * basePlateEstimate;
      }
    }
  }

  if (eventData.customBudget && eventData.customBudget > 0) {
    totalBudget = Math.max(totalBudget, eventData.customBudget);
  }

  let finalSpecialRequirements = eventData.specialRequirements || null;
  if (eventData.additionalContacts && eventData.additionalContacts.length > 0) {
    const contactsStr = eventData.additionalContacts
      .filter(c => c.name && c.phone)
      .map(c => `${c.name} (${c.phone}${c.relation ? ` - ${c.relation}` : ""})`)
      .join(", ");
    if (contactsStr) {
      finalSpecialRequirements = finalSpecialRequirements
        ? `${finalSpecialRequirements}\n[Secondary Contacts: ${contactsStr}]`
        : `[Secondary Contacts: ${contactsStr}]`;
    }
  }

  let requestId = eventData.requestId;
  const refNumber = `SAI-${Date.now().toString().slice(-6)}`;

  if (requestId) {
    const { data: existing, error: getErr } = await supabase
      .from("event_requests")
      .select("id, status, is_draft")
      .eq("id", requestId)
      .eq("customer_id", user.id)
      .single();

    if (getErr || !existing) {
      throw new Error("Event request not found or access denied.");
    }

    const isSubmittedState = existing.status === "Request Submitted" || existing.is_draft;
    if (!isSubmittedState) {
      const { data: approvedEdit } = await supabase
        .from("event_edit_requests")
        .select("id")
        .eq("event_id", requestId)
        .eq("status", "approved")
        .maybeSingle();

      if (!approvedEdit) {
        throw new Error("Event request is locked and requires Admin edit permission to modify.");
      }

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
        special_requirements: finalSpecialRequirements,
        reference_video_url: eventData.referenceVideoUrl || null,
        additional_contacts: eventData.additionalContacts || null,
      })
      .eq("id", requestId);

    if (updateErr) throw new Error(updateErr.message);

    await supabase.from("request_items").delete().eq("request_id", requestId);
    await supabase.from("event_request_parts").delete().eq("request_id", requestId);
    await supabase.from("customer_event_parts").delete().eq("request_id", requestId);
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
        special_requirements: finalSpecialRequirements,
        reference_video_url: eventData.referenceVideoUrl || null,
        additional_contacts: eventData.additionalContacts || null,
      })
      .select("id, reference_number")
      .single();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Failed to insert event request.");

    requestId = request.id;
  }

  // Insert standard request items if present
  if (requestItemsToInsert.length > 0) {
    const finalItems = requestItemsToInsert.map((item) => ({
      request_id: requestId,
      ...item,
    }));
    const { error: insertItemsErr } = await supabase.from("request_items").insert(finalItems);
    if (insertItemsErr) throw new Error(insertItemsErr.message);
  }

  // Insert event_request_parts if eventPartIds provided
  if (eventData.eventPartIds && eventData.eventPartIds.length > 0) {
    const partRows = eventData.eventPartIds.map((partId) => ({
      request_id: requestId,
      event_part_id: partId,
    }));
    await supabase.from("event_request_parts").insert(partRows);
  }

  // Insert hierarchical customer_event_parts with price snapshots
  if (eventData.eventPartsConfig && eventData.eventPartsConfig.length > 0) {
    for (const pConfig of eventData.eventPartsConfig) {
      let pkgSnapshot: number | null = null;

      if (pConfig.planningMode === "RECOMMENDED" && pConfig.selectedPackageId) {
        const { data: pkgData } = await supabase
          .from("packages")
          .select("price")
          .eq("id", pConfig.selectedPackageId)
          .single();
        if (pkgData) {
          pkgSnapshot = Number(pkgData.price);
        }
      }

      const { data: insertedPart, error: partErr } = await supabase
        .from("customer_event_parts")
        .insert({
          request_id: requestId,
          event_part_id: pConfig.eventPartId,
          event_part_name: pConfig.eventPartName,
          event_date: pConfig.eventDate || null,
          start_time: pConfig.startTime || null,
          end_time: pConfig.endTime || null,
          venue_name: pConfig.venueName || null,
          venue_address: pConfig.venueAddress || null,
          venue_location: pConfig.venueLocation || pConfig.venueAddress || null,
          required_services: pConfig.requiredServices || [],
          min_guests: pConfig.minGuests || null,
          max_guests: pConfig.maxGuests || null,
          planning_mode: pConfig.planningMode || "CUSTOM",
          selected_package_id: pConfig.selectedPackageId || null,
          package_price_snapshot: pkgSnapshot,
        })
        .select("id")
        .single();

      if (partErr) console.error("Error inserting customer_event_parts:", partErr.message);

      if (insertedPart) {
        // Insert custom services if present
        if (pConfig.planningMode === "CUSTOM" && pConfig.customServices && pConfig.customServices.length > 0) {
          const serviceRows: any[] = [];
          for (const cs of pConfig.customServices) {
            let priceSnap = 0;
            if (cs.servicePackageId) {
              const { data: sp } = await supabase.from("packages").select("price").eq("id", cs.servicePackageId).single();
              if (sp) priceSnap = Number(sp.price);
            } else if (cs.serviceItemId) {
              const { data: si } = await supabase.from("service_items").select("price").eq("id", cs.serviceItemId).single();
              if (si) priceSnap = Number(si.price);
            }

            serviceRows.push({
              customer_event_part_id: insertedPart.id,
              service_item_id: cs.serviceItemId || null,
              service_package_id: cs.servicePackageId || null,
              custom_requirements: cs.customRequirements || null,
              price_snapshot: priceSnap,
            });
          }
          if (serviceRows.length > 0) {
            await supabase.from("customer_event_part_services").insert(serviceRows);
          }
        }

        // Insert catering configuration if present
        if (pConfig.cateringConfig) {
          const cat = pConfig.cateringConfig;
          const plateSnap = 600; // base plate estimation
          const totalCateringSnap = (cat.vegPlateCount + cat.nonVegPlateCount) * plateSnap;

          await supabase.from("catering_configurations").insert({
            customer_event_part_id: insertedPart.id,
            meal_types: cat.mealTypes || [],
            food_preference: cat.foodPreference || "both",
            veg_plate_count: cat.vegPlateCount || 0,
            non_veg_plate_count: cat.nonVegPlateCount || 0,
            plate_price_snapshot: plateSnap,
            total_catering_price_snapshot: totalCateringSnap,
          });
        }
      }
    }
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
