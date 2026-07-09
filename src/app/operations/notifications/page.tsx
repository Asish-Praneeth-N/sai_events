import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationCenter from "@/components/operations/NotificationCenter";

export default async function OperationsNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, message, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 text-red-400 text-sm rounded-2xl">
        <p className="font-bold">Failed to load notifications</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  return <NotificationCenter initialNotifications={notifications || []} />;
}
