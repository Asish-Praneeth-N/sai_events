import { createClient } from "@/lib/supabase/server";
import InboxList from "./InboxList";

export default async function VendorInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  const { data: assignmentsData, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      created_at,
      category_id,
      categories ( name ),
      event_requests (
        id,
        event_type,
        event_date,
        location,
        guest_count,
        total_budget,
        request_items (
          quantity,
          unit_price,
          pricing_type,
          service_items (
            name,
            subcategory_id,
            subcategories ( category_id )
          )
        )
      )
    `)
    .eq("vendor_id", user.id)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Could not fetch leads: {error.message}
      </div>
    );
  }

  const assignments = (assignmentsData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">Leads Inbox</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            New opportunities waiting for your response.
          </p>
        </div>
        {assignments.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {assignments.length} pending {assignments.length === 1 ? "lead" : "leads"}
            </span>
          </div>
        )}
      </div>

      <InboxList assignments={assignments} />
    </div>
  );
}
