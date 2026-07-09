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

// ─── Availability Status ─────────────────────────────────────────────────────

export async function updateVendorAvailability(status: "Available" | "Busy" | "Leave") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ availability_status: status })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor");
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

  // 1. Fetch existing vendor services
  const { data: existingServices, error: fetchErr } = await supabase
    .from("vendor_services")
    .select("id, service_item_id")
    .eq("vendor_id", user.id);

  if (fetchErr) throw new Error(fetchErr.message);

  const existingMap = new Map(existingServices?.map((s) => [s.service_item_id, s.id]) || []);

  // 2. Delete vendor services that are no longer selected
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

  // 3. Upsert selected services
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

    // 4. Replace media for this vendor_service
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

  // Validate that the vendor is confirmed (Approved) for this event
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

  // Upload to Supabase Storage (vendor-uploads bucket)
  const storagePath = `vendor-documents/${user.id}/${eventId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("vendor-uploads")
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("vendor-uploads")
    .getPublicUrl(storagePath);

  // Insert document record
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

  // Validate assignment
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

  // Fetch the document to get the storage path for deletion
  const { data: doc } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", documentId)
    .eq("uploaded_by", user.id)
    .single();

  // If the file is hosted on Supabase Storage (vendor-uploads), delete from storage too
  if (doc?.file_url) {
    try {
      const url = new URL(doc.file_url);
      const pathMatch = url.pathname.match(/vendor-uploads\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage.from("vendor-uploads").remove([pathMatch[1]]);
      }
    } catch (_) {
      // Non-storage URLs: skip storage deletion
    }
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

  // 1. Verify vendor is assigned and approved
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

  // 2. Save completion notes to the vendor_assignments record
  const { error: notesError } = await supabase
    .from("vendor_assignments")
    .update({
      completion_notes: summaryText,
      completion_submitted_at: new Date().toISOString(),
    })
    .eq("id", assignment.id);

  if (notesError) throw new Error(notesError.message);

  // 3. Insert any photo URL links as documents
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

  // 4. Dispatch system notification for Admins
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
