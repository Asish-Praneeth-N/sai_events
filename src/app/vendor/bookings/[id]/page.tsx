import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventWorkspaceClient from "./EventWorkspaceClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorEventWorkspacePage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // 1. Fetch vendor assignment record
  const { data: booking, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      vendor_id,
      status,
      created_at,
      category_id,
      categories ( name ),
      event_requests (
        id,
        event_type,
        event_date,
        location,
        guest_count,
        status,
        event_assignments (
          id,
          status,
          profiles:assigned_operational_manager_id (
            full_name,
            phone_number,
            email
          )
        ),
        request_items (
          quantity,
          unit_price,
          pricing_type,
          service_items (
            name,
            subcategory_id,
            subcategories ( category_id )
          )
        ),
        timelines (
          id,
          milestone_name,
          description,
          is_internal,
          created_at
        ),
        documents (
          id,
          file_name,
          file_url,
          file_type,
          created_at,
          uploaded_by
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !booking) {
    redirect("/vendor/bookings");
  }

  // 2. Validate ownership of the assignment
  if (booking.vendor_id !== user.id) {
    redirect("/unauthorized");
  }

  // 3. Confirm booking is approved / confirmed
  if (booking.status !== "Approved") {
    redirect("/vendor/bookings");
  }

  return (
    <EventWorkspaceClient 
      booking={booking as any} 
      userId={user.id}
    />
  );
}
