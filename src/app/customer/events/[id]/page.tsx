import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EventWorkspaceClient from "@/components/customer/EventWorkspaceClient";

export default async function EventWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const eventId = resolvedParams.id;
  const initialTab = resolvedSearchParams.tab || "overview";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Event Request and all related entities
  const { data: event, error } = await supabase
    .from("event_requests")
    .select(`
      *,
      request_items (
        id,
        quantity,
        unit_price,
        pricing_type,
        pricing_unit,
        service_items (
          name
        )
      ),
      event_assignments (
        id,
        status,
        expected_completion,
        handover_notes,
        profiles:assigned_operational_manager_id (
          full_name,
          phone_number,
          email
        )
      ),
      timelines (
        id,
        milestone_name,
        description,
        is_internal,
        created_at
      )
    `)
    .eq("id", eventId)
    .eq("customer_id", user.id)
    .single();

  if (error || !event) {
    notFound();
  }

  // 2. Fetch Edit Requests for this event
  let editRequests: any[] = [];
  try {
    const { data: edits } = await supabase
      .from("event_edit_requests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    editRequests = edits || [];
  } catch (_) {}

  // 3. Fetch Meetings for this event
  let meetings: any[] = [];
  try {
    const { data: meetList } = await supabase
      .from("event_meetings")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    meetings = meetList || [];
  } catch (_) {}

  return (
    <div className="relative mx-auto w-full max-w-[1480px] animate-fade-in-up space-y-8">
      {/* Decorative background watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-4 hidden select-none font-heading text-[clamp(7rem,14vw,13rem)] italic leading-none tracking-[-0.08em] text-[#173d2c]/[0.022] xl:block dark:text-white/[0.015]"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Event
      </span>

      {/* Main Content Workspace */}
      <main className="relative z-10">
        <EventWorkspaceClient
          event={event}
          editRequests={editRequests}
          meetings={meetings}
          initialTab={initialTab}
        />
      </main>

      {/* Footer Editorial Strip */}
      <footer className="relative z-10 flex flex-col gap-3 border-t border-[#173d2c]/10 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
          <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-[#173d2c]/40 sm:text-[8px] dark:text-white/30">
            Your Vision · Our Craft · One Celebration
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden h-px w-8 bg-[#173d2c]/15 sm:block dark:bg-white/10" />
          <span className="font-heading text-sm italic text-[#173d2c]/60 dark:text-[#d2b56b]/75" style={{ fontFamily: '"Playfair Display", serif' }}>
            SAI Events
          </span>
        </div>
      </footer>
    </div>
  );
}
