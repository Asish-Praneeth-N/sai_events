import { createClient } from "@/lib/supabase/server";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  let notifications: any[] = [];
  let tableMissing = false;

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    tableMissing = true;
    // Mock list to ensure smooth UI showcase before SQL table migration is executed
    notifications = [
      {
        id: "sys-ntf-1",
        user_type: "vendor",
        user_name: "Rajesh Kumar",
        message: "Vendor account status updated to Approved by admin.",
        status: "Delivered",
        created_at: "2026-06-25T11:00:00.000Z",
      },
      {
        id: "sys-ntf-2",
        user_type: "customer",
        user_name: "Sai Client",
        message: "New Wedding Ceremony request submitted. Estimated Budget: ₹2,45,000.",
        status: "Delivered",
        created_at: "2026-06-25T10:15:00.000Z",
      },
      {
        id: "sys-ntf-3",
        user_type: "vendor",
        user_name: "Rajesh Kumar",
        message: "Vendor accepted Stage Setup lead for Wedding Ceremony.",
        status: "Delivered",
        created_at: "2026-06-25T09:30:00.000Z",
      },
    ];
  } else {
    notifications = data || [];
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">System Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log records of notifications dispatched to vendors and customers across workflow updates.
          </p>
        </div>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs rounded-2xl leading-relaxed">
          <strong>⚠️ Database Note:</strong> The `notifications` table has not been created in your Supabase project yet. The list below is currently displaying mock logs. Run the notification migration script in <strong>walkthrough.md</strong> to log real-time triggers!
        </div>
      )}

      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Notification Logs</h3>

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No system notifications logged.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 px-3">Notification ID</th>
                  <th className="pb-4 px-3">Recipient Type</th>
                  <th className="pb-4 px-3">Name</th>
                  <th className="pb-4 px-3">Log Message</th>
                  <th className="pb-4 px-3">Sent Time</th>
                  <th className="pb-4 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {notifications.map((ntf) => (
                  <tr key={ntf.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-4 px-3 font-mono text-[10px] text-muted-foreground">
                      {ntf.id}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${
                        ntf.user_type === "vendor" 
                          ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20" 
                          : "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/20"
                      }`}>
                        {ntf.user_type}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-semibold text-foreground">
                      {ntf.user_name}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground max-w-[300px] truncate" title={ntf.message}>
                      {ntf.message}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground">
                      {new Date(ntf.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-3 text-right font-sans">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        {ntf.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
