import { createClient } from "@/lib/supabase/server";

export default async function AdminStatusHistoryPage() {
  const supabase = await createClient();

  let logs: any[] = [];
  let tableMissing = false;

  const { data: ntfData, error } = await supabase
    .from("notifications")
    .select("*")
    .like("message", "%status%")
    .order("created_at", { ascending: false });

  if (error) {
    tableMissing = true;
    // Mock data for seamless setup
    logs = [
      {
        id: "log-1",
        user_name: "John Client",
        message: "Event request status advanced to 'Sent to Vendors'.",
        created_at: "2026-06-25T11:00:00.000Z",
      },
      {
        id: "log-2",
        user_name: "Vendor Rajesh",
        message: "Vendor lead assignment accepted. Request status advanced to 'Vendor Accepted'.",
        created_at: "2026-06-25T10:15:00.000Z",
      },
      {
        id: "log-3",
        user_name: "Operations Admin",
        message: "Request status updated manually to 'Under Admin Review'. Remarks: Verifying caterer availability.",
        created_at: "2026-06-25T09:30:00.000Z",
      },
      {
        id: "log-4",
        user_name: "John Client",
        message: "Event request submitted. Initial status set to 'Request Submitted'.",
        created_at: "2026-06-25T08:00:00.000Z",
      },
    ];
  } else {
    logs = ntfData || [];
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Status Management History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit logs of status updates, manual workflow overrides, and state progression remarks.
        </p>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs rounded-2xl leading-relaxed">
          <strong>⚠️ Database Note:</strong> The `notifications` table has not been created in your Supabase project yet. The list below is currently displaying mock logs. Run the migration script in <strong>walkthrough.md</strong> to log real status trails!
        </div>
      )}

      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Workflow Transition Audits</h3>

        {logs.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
            No status transition logs recorded.
          </div>
        ) : (
          <div className="relative border-l border-border/70 ml-4 pl-6 space-y-6 py-2">
            {logs.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline node dot */}
                <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-purple-600 border-2 border-background shadow shadow-purple-500/50" />
                
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground font-mono font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="text-foreground font-bold text-xs">
                    Operator: {log.user_name}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
