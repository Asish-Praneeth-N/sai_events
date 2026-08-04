import { createClient } from "@/lib/supabase/server";
import MeetingsClient from "./MeetingsClient";

export const metadata = {
  title: "Meeting Requests — Sai Events Admin",
  description: "Review and manage customer meeting consultation requests.",
};

interface RawMeeting {
  id: string;
  event_id: string;
  customer_id: string;
  purpose: string;
  preferred_date: string;
  preferred_time_window: string;
  notes: string | null;
  status: "Pending" | "Scheduled" | "Rejected";
  confirmed_date: string | null;
  confirmed_time: string | null;
  meeting_link: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles:
    | { full_name: string; email: string; phone_number?: string }
    | { full_name: string; email: string; phone_number?: string }[]
    | null;
  event_requests:
    | { event_type: string; event_date: string }
    | { event_type: string; event_date: string }[]
    | null;
}

export default async function AdminMeetingsPage() {
  const supabase = await createClient();

  const { data: rawMeetings, error } = await supabase
    .from("event_meetings")
    .select(
      `
      id,
      event_id,
      customer_id,
      purpose,
      preferred_date,
      preferred_time_window,
      notes,
      status,
      confirmed_date,
      confirmed_time,
      meeting_link,
      admin_notes,
      created_at,
      updated_at,
      profiles!customer_id (
        full_name,
        email,
        phone_number
      ),
      event_requests!event_id (
        event_type,
        event_date
      )
    `
    )
    .order("created_at", { ascending: false }) as {
    data: RawMeeting[] | null;
    error: { message?: string; code?: string } | null;
  };

  // Only show "table missing" banner if the table genuinely doesn't exist
  const tableMissing =
    !!error &&
    (error.message?.includes("does not exist") || error.code === "42P01");

  if (error && !tableMissing) {
    console.error("[AdminMeetingsPage] Supabase query error:", error.message);
  }

  // Normalise array joins → single object (Supabase returns arrays for FK joins)
  const meetings = (rawMeetings ?? []).map((m) => {
    const profile = Array.isArray(m.profiles)
      ? (m.profiles[0] ?? null)
      : m.profiles;

    const eventRaw = Array.isArray(m.event_requests)
      ? (m.event_requests[0] ?? null)
      : m.event_requests;

    return {
      ...m,
      profiles: profile
        ? {
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone_number,
          }
        : null,
      bookings: eventRaw
        ? {
            event_name: eventRaw.event_type,
            event_type: eventRaw.event_type,
          }
        : null,
    };
  });

  return (
    <MeetingsClient
      initialMeetings={meetings}
      tableMissing={tableMissing}
    />
  );
}
