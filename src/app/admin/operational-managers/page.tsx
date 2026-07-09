import { createClient } from "@/lib/supabase/server";
import OMRegistryClient from "./OMRegistryClient";

export default async function AdminOperationalManagersPage() {
  const supabase = await createClient();

  let managers: any[] = [];
  let tableMissing = false;

  let dbError: Error | null = null;
  try {
    const { data, error } = await supabase
      .from("operational_managers")
      .select(`
        *,
        profiles:id (
          id,
          full_name,
          email,
          phone_number,
          address
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    managers = data || [];
  } catch (err: any) {
    dbError = err;
  }

  if (dbError) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load operations team</h2>
        <p className="text-xs opacity-90">{dbError.message}</p>
        <p className="text-xs mt-4 opacity-75">Please execute the database migration script (`migration_milestone_2.sql`) in the Supabase SQL editor to create the required tables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Operations Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage internal Operational Managers, assign geographical coverage, monitor workloads, and audit performance metrics.
        </p>
      </div>

      <OMRegistryClient initialManagers={managers} databasePending={tableMissing} />
    </div>
  );
}
