import { createClient } from "@/lib/supabase/server";
import DashboardList from "./DashboardList";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#173d2c]/40 dark:text-[#eee5d7]/35">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a17a34] dark:bg-[#d2b56b]" />
          Loading user session...
        </div>
      </div>
    );
  }

  // Fetch event requests and nested items, assignments, documents, and timelines
  const { data: requestsData, error } = await supabase
    .from("event_requests")
    .select(`
      id,
      event_type,
      location,
      guest_count,
      status,
      total_budget,
      event_date,
      created_at,
      request_items (
        quantity,
        unit_price,
        pricing_type,
        service_items (
          name
        )
      ),
      event_assignments (
        id,
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
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch notifications
  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch linked guest enquiries
  let enquiries: any[] = [];

  try {
    const { data: enquiriesData } = await supabase
      .from("guest_enquiries")
      .select("id, event_type, event_description, status, created_at")
      .eq("linked_user_id", user.id)
      .order("created_at", { ascending: false });

    enquiries = enquiriesData || [];
  } catch (_) {}

  // Fetch all event meetings for this customer
  let meetings: any[] = [];

  try {
    const { data: meetingsData } = await supabase
      .from("event_meetings")
      .select(`
        *,
        event_requests (
          event_type,
          celebrant_name
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    meetings = meetingsData || [];
  } catch (_) {}

  if (error) {
    return (
      <div className="mx-auto max-w-4xl border-l-2 border-red-500/60 bg-red-500/[0.06] px-5 py-4 text-red-700 dark:text-red-400">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-red-500/30 text-[9px] font-bold">
            !
          </span>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em]">
            Failed to load planning dashboard
          </h2>
        </div>

        <p className="text-xs opacity-90">{error.message}</p>

        <p className="mt-3 text-[10px] leading-relaxed opacity-70">
          Please verify that you have run the database migrations
          (`migration_customer_workspace.sql`) in the Supabase SQL editor to
          create all required tables.
        </p>
      </div>
    );
  }

  const requests = (requestsData || []) as any[];
  const notifications = (notificationsData || []) as any[];

  return (
    <div className="relative mx-auto w-full max-w-[1480px] animate-fade-in-up space-y-8">
      {/* Decorative background watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-4 hidden select-none font-heading text-[clamp(7rem,14vw,13rem)] italic leading-none tracking-[-0.08em] text-[#173d2c]/[0.022] xl:block dark:text-white/[0.015]"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Studio
      </span>

      {/* Header */}
      <header className="relative z-10 border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.07]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[800px]">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#173d2c]/40 dark:bg-[#d2b56b]/40" />
              <Sparkles className="h-3 w-3 text-[#a17a34] dark:text-[#d2b56b]" />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#173d2c]/55 sm:text-[9px] dark:text-[#d9c88d]/65">
                SAI Events · Private Planning Studio
              </span>
            </div>

            <h1
              className="font-heading text-[clamp(2.65rem,6vw,5.2rem)] font-normal leading-[0.95] tracking-[-0.05em] text-[#143d2b] dark:text-[#f0e8db]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Planning{" "}
              <span className="italic text-[#9a742e] dark:text-[#d2b56b]">
                Dashboard.
              </span>
            </h1>

            <div className="mt-5 flex max-w-[680px] items-start gap-4">
              <span className="mt-[9px] hidden h-px w-9 shrink-0 bg-[#a17a34]/50 sm:block" />
              <p className="text-[12px] font-normal leading-[1.8] text-[#17392b]/65 sm:text-[13px] dark:text-[#eee5d7]/55" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Track milestones, manage references, review active enquiries, and coordinate your upcoming celebrations through one calm, managed planning studio.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#173d2c]/10 pt-4 dark:border-white/[0.06]">
          <span className="text-[7.5px] font-bold uppercase tracking-[0.24em] text-[#a17a34] dark:text-[#d2b56b]">
            Your Workspace
          </span>
          <span className="h-1 w-1 rotate-45 bg-[#a17a34]/45" />
          <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[#173d2c]/40 sm:text-[8px] dark:text-white/30">
            End-to-End Concierge Management by SAI EVENTS
          </span>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="relative z-10">
        <DashboardList
          requests={requests}
          notifications={notifications}
          enquiries={enquiries}
          meetings={meetings}
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