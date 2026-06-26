import { createClient } from "@/lib/supabase/server";
import AssignmentList from "@/components/admin/AssignmentList";

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();

  const { data: assignmentsData, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      request_id,
      status,
      created_at,
      updated_at,
      category_id,
      categories (
        name
      ),
      profiles (
        id,
        full_name,
        business_name
      ),
      event_requests (
        event_type,
        event_date
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to load assignments: {error.message}
      </div>
    );
  }

  const assignments = (assignmentsData || []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Vendor Assignments</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Monitor active lead invitations sent to vendors, audit response decisions, and execute final approvals.
        </p>
      </div>

      <AssignmentList assignments={assignments} />
    </div>
  );
}
