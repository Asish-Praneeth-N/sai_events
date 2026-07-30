"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { VendorAvailabilityStatus } from "@/lib/types";

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

export async function saveExtendedVendorProfile(data: {
  fullName: string;
  phoneNumber: string;
  businessName: string;
  address: string;
  primaryCity?: string;
  serviceRadiusKm?: number;
  maxDailyCapacity?: number;
  yearsOfExperience?: number;
  instagramUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountName?: string;
  vendorDocuments?: any;
  godownPhotos?: string[];
  vehicleAssets?: Array<{ type: string; url: string; name: string }>;
  additionalNotes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone_number: data.phoneNumber,
      business_name: data.businessName,
      address: data.address,
      primary_city: data.primaryCity,
      service_radius_km: data.serviceRadiusKm || 100,
      max_daily_capacity: data.maxDailyCapacity || 5,
      years_of_experience: data.yearsOfExperience || 0,
      instagram_url: data.instagramUrl,
      website_url: data.websiteUrl,
      facebook_url: data.facebookUrl,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      ifsc_code: data.ifscCode,
      account_name: data.accountName,
      vendor_documents: data.vendorDocuments || {},
      godown_photos: data.godownPhotos || [],
      vehicle_assets: data.vehicleAssets || [],
      additional_notes: data.additionalNotes,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor");
}

export async function updateVendorCategoryMappings(categoryIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

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

// ─── Portfolio Actions ───────────────────────────────────────────────────────

export async function addPortfolioImage(imageUrl: string, caption?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("vendor_portfolio")
    .insert({ vendor_id: user.id, image_url: imageUrl, caption: caption || null });

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/profile");
}

export async function removePortfolioImage(portfolioItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("vendor_portfolio")
    .delete()
    .eq("id", portfolioItemId)
    .eq("vendor_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/profile");
}

// ─── Availability & Capacity Actions ─────────────────────────────────────────

export async function updateVendorAvailability(status: VendorAvailabilityStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ availability_status: status })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor");
  revalidatePath("/vendor/calendar");
}

// ─── Personal Schedules Actions ────────────────────────────────────────────────

export async function savePersonalSchedule(entry: {
  id?: string;
  title: string;
  entryType: "Leave" | "Personal Function" | "Equipment Maintenance" | "Office Work" | "Family Function";
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const payload = {
    vendor_id: user.id,
    title: entry.title,
    entry_type: entry.entryType,
    start_date: entry.startDate,
    end_date: entry.endDate,
    start_time: entry.startTime || null,
    end_time: entry.endTime || null,
    notes: entry.notes || null,
  };

  if (entry.id) {
    const { error } = await supabase
      .from("vendor_personal_schedules")
      .update(payload)
      .eq("id", entry.id)
      .eq("vendor_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("vendor_personal_schedules")
      .insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/vendor/calendar");
  revalidatePath("/vendor/inbox");
}

export async function deletePersonalSchedule(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("vendor_personal_schedules")
    .delete()
    .eq("id", id)
    .eq("vendor_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/calendar");
  revalidatePath("/vendor/inbox");
}

// ─── Grouped Quotations Actions ───────────────────────────────────────────────

export async function submitGroupedVendorQuotation(data: {
  requestId: string;
  items: Array<{ serviceItemId: string; itemPrice: number; quantity: number }>;
  notes?: string;
  isConfirmed: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!data.isConfirmed) {
    throw new Error("You must explicitly confirm that you can provide this service before submitting.");
  }

  let grandTotal = 0;
  const itemPayloads = data.items.map((i) => {
    const sub = i.itemPrice * i.quantity;
    grandTotal += sub;
    return {
      service_item_id: i.serviceItemId,
      item_price: i.itemPrice,
      quantity: i.quantity,
      subtotal: sub,
    };
  });

  // 1. Insert or Update Quotation Header
  const { data: qData, error: qErr } = await supabase
    .from("vendor_quotations")
    .insert({
      request_id: data.requestId,
      vendor_id: user.id,
      grand_total: grandTotal,
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      notes: data.notes || null,
      status: "Submitted",
    })
    .select("id")
    .single();

  if (qErr) throw new Error(qErr.message);

  // 2. Insert Quotation Items
  const itemsWithQId = itemPayloads.map((ip) => ({
    ...ip,
    quotation_id: qData.id,
  }));

  const { error: itemsErr } = await supabase
    .from("vendor_quotation_items")
    .insert(itemsWithQId);

  if (itemsErr) throw new Error(itemsErr.message);

  // 3. Update vendor assignment status to 'Quotation Submitted'
  await supabase
    .from("vendor_assignments")
    .update({ status: "Quotation Submitted" })
    .eq("request_id", data.requestId)
    .eq("vendor_id", user.id);

  revalidatePath("/vendor/inbox");
  revalidatePath("/vendor/bookings");
}

// ─── Vendor Services ─────────────────────────────────────────────────────────

interface ServiceInput {
  serviceItemId: string;
  customPrice: number;
  mediaUrls: string[];
}

export async function saveVendorServices(services: ServiceInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: existingServices, error: fetchErr } = await supabase
    .from("vendor_services")
    .select("id, service_item_id")
    .eq("vendor_id", user.id);

  if (fetchErr) throw new Error(fetchErr.message);

  const existingMap = new Map(existingServices?.map((s) => [s.service_item_id, s.id]) || []);

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

  for (const s of services) {
    let vendorServiceId = existingMap.get(s.serviceItemId);

    if (vendorServiceId) {
      const { error: updErr } = await supabase
        .from("vendor_services")
        .update({ custom_price: s.customPrice })
        .eq("id", vendorServiceId);
      if (updErr) throw new Error(updErr.message);
    } else {
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

  revalidatePath("/vendor/services");
}

// ─── Document Actions ─────────────────────────────────────────────────────────

export async function uploadVendorDocument(
  eventId: string,
  fileName: string,
  file: File,
  fileType: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: assignment, error: getError } = await supabase
    .from("vendor_assignments")
    .select("id")
    .eq("request_id", eventId)
    .eq("vendor_id", user.id)
    .eq("status", "Approved")
    .single();

  if (getError || !assignment) {
    throw new Error("Unauthorized event case access. Booking must be confirmed.");
  }

  const storagePath = `vendor-documents/${user.id}/${eventId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("vendor-uploads")
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("vendor-uploads")
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      event_id: eventId,
      uploaded_by: user.id,
      file_name: fileName,
      file_url: publicUrl,
      file_type: fileType,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/vendor/bookings/${assignment.id}`);
  return data;
}

export async function deleteVendorDocument(documentId: string, eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: assignment, error: getError } = await supabase
    .from("vendor_assignments")
    .select("id")
    .eq("request_id", eventId)
    .eq("vendor_id", user.id)
    .eq("status", "Approved")
    .single();

  if (getError || !assignment) {
    throw new Error("Unauthorized event case access.");
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", documentId)
    .eq("uploaded_by", user.id)
    .single();

  if (doc?.file_url) {
    try {
      const url = new URL(doc.file_url);
      const pathMatch = url.pathname.match(/vendor-uploads\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage.from("vendor-uploads").remove([pathMatch[1]]);
      }
    } catch (_) {}
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("uploaded_by", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/vendor/bookings/${assignment.id}`);
  return { success: true };
}

// ─── Completion Report ────────────────────────────────────────────────────────

export async function submitCompletionReport(
  eventId: string,
  summaryText: string,
  photoUrls: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: assignment, error: getError } = await supabase
    .from("vendor_assignments")
    .select("id")
    .eq("request_id", eventId)
    .eq("vendor_id", user.id)
    .eq("status", "Approved")
    .single();

  if (getError || !assignment) {
    throw new Error("Unauthorized event case access. Booking must be confirmed.");
  }

  const { error: notesError } = await supabase
    .from("vendor_assignments")
    .update({
      completion_notes: summaryText,
      completion_submitted_at: new Date().toISOString(),
    })
    .eq("id", assignment.id);

  if (notesError) throw new Error(notesError.message);

  if (photoUrls.length > 0) {
    const docRecords = photoUrls.map((url, idx) => ({
      event_id: eventId,
      uploaded_by: user.id,
      file_name: `Completion Photo ${idx + 1}`,
      file_url: url,
      file_type: "summary",
    }));

    const { error: mediaErr } = await supabase
      .from("documents")
      .insert(docRecords);

    if (mediaErr) throw new Error(mediaErr.message);
  }

  await supabase
    .from("notifications")
    .insert({
      user_type: "admin",
      message: `Vendor submitted completion report for event file ${eventId.substring(0, 8)}.`,
      status: "Delivered",
    });

  revalidatePath(`/vendor/bookings/${assignment.id}`);
  return { success: true };
}
