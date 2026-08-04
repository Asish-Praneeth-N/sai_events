import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, eventType, message } = body;

    // 1. Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Full Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      return NextResponse.json(
        { error: "Phone number must contain at least 10 digits." },
        { status: 400 }
      );
    }

    if (!eventType || typeof eventType !== "string" || !eventType.trim()) {
      return NextResponse.json(
        { error: "Event Type is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please tell us about your event." },
        { status: 400 }
      );
    }

    // 2. Instantiate Supabase server client
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "placeholder-key";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Existing Account Check: Match normalized email against profiles
    let linkedUserId: string | null = null;
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        linkedUserId = existingProfile.id;
      }
    } catch (_) {}

    // 4. Sanitize strings
    const sanitizedName = name.trim();
    const sanitizedPhone = phone.trim();
    const sanitizedEventType = eventType.trim();
    const sanitizedMessage = message.trim();

    // 5. Primary execution: Try secure RPC function (submit_guest_enquiry)
    let enquiryId: string | null = null;

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "submit_guest_enquiry",
      {
        p_full_name: sanitizedName,
        p_email: normalizedEmail,
        p_phone: sanitizedPhone,
        p_event_type: sanitizedEventType,
        p_event_description: sanitizedMessage,
      }
    );

    if (!rpcError && rpcData) {
      enquiryId = rpcData;
    } else {
      // Fallback: Direct insert without .select() (prevents RLS RETURNING check error for anon callers)
      const { error: insertError } = await supabase
        .from("guest_enquiries")
        .insert({
          full_name: sanitizedName,
          email: normalizedEmail,
          phone: sanitizedPhone,
          event_type: sanitizedEventType,
          event_description: sanitizedMessage,
          status: "new",
          linked_user_id: linkedUserId,
        });

      if (insertError) {
        console.error("Error inserting guest enquiry:", insertError);
        const isMissingTable =
          insertError.code === "42P01" ||
          insertError.message?.toLowerCase().includes("does not exist");

        return NextResponse.json(
          {
            error: isMissingTable
              ? "Database setup required: Please execute the updated 'migration_guest_enquiries.sql' script in your Supabase SQL Editor."
              : `Failed to store enquiry: ${insertError.message || "Database insertion failed."}`,
          },
          { status: 500 }
        );
      }

      // Log notification if direct insert fallback was used
      try {
        await supabase.from("notifications").insert({
          user_type: "admin",
          user_name: sanitizedName,
          message: `New Event Enquiry: ${sanitizedName} submitted a ${sanitizedEventType} enquiry.`,
          status: "Delivered",
        });
      } catch (_) {}
    }

    // 6. Success response
    return NextResponse.json({
      success: true,
      message:
        "Thank you for reaching out. Our team has received your enquiry and will get in touch with you soon.",
      enquiryId,
    });
  } catch (err: any) {
    console.error("Guest enquiry API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your enquiry." },
      { status: 500 }
    );
  }
}
