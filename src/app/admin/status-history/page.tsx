import { createClient } from "@/lib/supabase/server";

export default async function AdminStatusHistoryPage() {
  const supabase = await createClient();

  let logs: any[] = [];
  let tableMissing = false;

  let dbError: Error | null = null;
  try {
    const { data: auditLogsData, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        profiles:performed_by (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    logs = auditLogsData || [];
  } catch (err: any) {
    dbError = err;
  }

  if (dbError) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load audit logs</h2>
        <p className="text-xs opacity-90">{dbError.message}</p>
        <p className="text-xs mt-4 opacity-75">Please execute the database migration script (`migration_milestone_2.sql`) in the Supabase SQL editor to create the required tables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Audit Trail</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Immutable logs of status updates, system events, manual overrides, and workforce actions.
        </p>
      </div>

      {tableMissing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs rounded-2xl leading-relaxed">
          <strong>⚠️ Database Note:</strong> The `audit_logs` table has not been created in your Supabase project yet. The list below is currently displaying mock logs. Run the migration script in <strong>migration_milestone_2.sql</strong> to log real activity!
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
              <div key={log.id} className="relative animate-fade-in">
                {/* Timeline node dot */}
                <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-purple-600 border-2 border-background shadow shadow-purple-500/50" />
                
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground font-mono font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="text-foreground font-bold text-xs">
                    Event: <span className="text-accent-gold font-mono">{log.action}</span>
                  </div>
                  <div className="text-xxs text-muted-foreground font-semibold">
                    Operator: {log.profiles?.full_name || "System"} · Entity: {log.entity_type}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="p-2.5 bg-background border border-border/60 rounded-xl text-[10px] text-muted-foreground font-mono max-w-lg mt-1 whitespace-pre-wrap truncate">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
