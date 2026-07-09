import { createClient } from "@/lib/supabase/server";
import UsersList from "@/components/admin/UsersList";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Get current logged-in user to prevent self-actions
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: usersData, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load platform users</h2>
        <p className="text-xs opacity-90">{error.message}</p>
        <p className="text-xs mt-4 opacity-75">Please execute the database migration script (`migration_milestone_2.sql`) in the Supabase SQL editor to create the required tables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Users Management</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Manage system users, inspect profile details, promote roles, and audit account access parameters.
        </p>
      </div>

      {/* Users List */}
      <UsersList initialUsers={usersData || []} currentUserId={currentUser?.id || ""} />
    </div>
  );
}
