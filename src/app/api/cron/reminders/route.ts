import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch active event requests that are not completed or cancelled
    const { data: eventRequests, error } = await supabase
      .from("event_requests")
      .select(`
        id,
        customer_id,
        event_type,
        event_date,
        location,
        guest_count,
        target_budget,
        venue_address,
        status,
        profiles ( full_name, email, phone_number )
      `)
      .not("status", "in", '("Completed", "Closed", "Cancelled")');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let remindersDispatched = 0;

    for (const req of eventRequests || []) {
      const missingFields: string[] = [];

      if (!req.venue_address || req.venue_address.trim().length === 0) {
        missingFields.push("Venue Address not selected");
      }
      if (!req.guest_count || req.guest_count <= 0) {
        missingFields.push("Guest count missing");
      }
      if (!req.target_budget || req.target_budget <= 0) {
        missingFields.push("Target budget missing");
      }
      if (req.status === "Request Submitted" || req.status === "Under Admin Review") {
        missingFields.push("Vendor selection / dispatch pending");
      }
      if (req.status === "Ready For Execution") {
        missingFields.push("Operational Manager not assigned");
      }

      if (missingFields.length > 0) {
        remindersDispatched++;

        const profileObj = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
        await supabase
          .from("notifications")
          .insert({
            user_id: req.customer_id,
            user_type: "customer",
            user_name: (profileObj as any)?.full_name || "Customer",
            message: `Hourly Reminder for Event File ${req.id.substring(0, 8)} (${req.event_type}): ${missingFields.join(", ")}. Please complete your event parameters.`,
            status: "Delivered",
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Hourly reminder scan complete. Dispatched ${remindersDispatched} reminder notifications.`,
      dispatchedCount: remindersDispatched,
      scannedEventsCount: eventRequests?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to run reminder cron" }, { status: 500 });
  }
}
