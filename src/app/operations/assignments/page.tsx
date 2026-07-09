import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, AlertTriangle, ArrowRight, Clock, CheckSquare, Briefcase } from "lucide-react";

function getStatusConfig(status: string) {
  switch (status) {
    case "Assigned":          return { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25",   label: "Awaiting Acceptance" };
    case "Accepted":          return { color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/25",       label: "Accepted" };
    case "Execution Started": return { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/25", label: "In Execution" };
    case "Execution Complete":return { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25", label: "Complete" };
    case "Closed":            return { color: "text-zinc-500",   bg: "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700",  label: "Closed" };
    default:                  return { color: "text-muted-foreground", bg: "bg-muted border-border", label: status };
  }
}

function getDaysUntil(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0)  return { label: "Past",     urgent: false, class: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700" };
  if (diff === 0) return { label: "TODAY",   urgent: true,  class: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 animate-pulse" };
  if (diff === 1) return { label: "Tomorrow", urgent: true, class: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" };
  if (diff <= 7)  return { label: `${diff}d`, urgent: false, class: "text-accent-gold bg-accent-gold/8 border-accent-gold/20" };
  return { label: `${diff}d`,  urgent: false, class: "text-muted-foreground bg-muted border-border/40" };
}

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assignmentsData, error } = await supabase
    .from("event_assignments")
    .select(`
      id, status, escalation_level, escalation_reason,
      expected_completion, handover_notes, created_at, updated_at,
      event_requests (
        id, event_type, event_date, location, guest_count, total_budget, status,
        profiles:customer_id ( full_name, phone_number, email )
      )
    `)
    .eq("assigned_operational_manager_id", user.id)
    .order("updated_at", { ascending: false });

  const assignments = assignmentsData as any[] | null;


  // Checklist completion data
  const assignmentIds = (assignments || []).map(a => a.id);
  let checklistData: { assignment_id: string; is_completed: boolean }[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from("om_checklist_items")
      .select("assignment_id, is_completed")
      .in("assignment_id", assignmentIds);
    checklistData = data || [];
  }

  const checklistMap = assignmentIds.reduce((acc, id) => {
    const items = checklistData.filter(c => c.assignment_id === id);
    acc[id] = { total: items.length, done: items.filter(c => c.is_completed).length };
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 text-red-400 text-sm rounded-2xl">
        <p className="font-bold">Failed to load assignments</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  const active  = (assignments || []).filter(a => ["Assigned", "Accepted", "Execution Started"].includes(a.status));
  const closed  = (assignments || []).filter(a => ["Execution Complete", "Closed"].includes(a.status));
  const all     = assignments || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-heading text-foreground">My Assignments</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">All event assignments delegated to you by Admin.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-muted-foreground bg-surface border border-border px-3 py-1.5 rounded-lg">
            {active.length} Active · {closed.length} Closed
          </span>
        </div>
      </div>

      {/* Empty state */}
      {all.length === 0 && (
        <div className="py-20 text-center border border-dashed border-border/60 rounded-3xl bg-surface/30">
          <Briefcase className="w-10 h-10 text-muted-foreground/25 mx-auto mb-4" />
          <h3 className="text-sm font-light font-heading text-foreground mb-1">No Assignments Yet</h3>
          <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto">
            Admin will assign events to you once they are finalized and ready for execution.
          </p>
        </div>
      )}

      {/* Active Assignments */}
      {active.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Active Assignments ({active.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {active.map(a => {
              const req = a.event_requests;
              if (!req) return null;
              const sc = getStatusConfig(a.status);
              const cd = getDaysUntil(req.event_date);
              const cl = checklistMap[a.id] || { total: 0, done: 0 };
              const healthPct = cl.total === 0 ? 0 : Math.round((cl.done / cl.total) * 100);
              const healthColor = healthPct >= 70 ? "bg-emerald-500" : healthPct >= 40 ? "bg-amber-500" : "bg-red-500";

              return (
                <div key={a.id} className="group bg-surface border border-border/70 hover:border-accent-gold/30 rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                  {/* Card header */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {a.escalation_level > 0 && (
                            <span className="text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Escalated
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-light font-heading text-foreground group-hover:text-accent-gold transition truncate">{req.event_type}</h3>
                        <p className="text-[10px] text-muted-foreground">Client: <span className="font-semibold text-foreground/80">{req.profiles?.full_name || "—"}</span></p>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg border shrink-0 ${cd.class}`}>{cd.label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9.5px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-accent-gold" />{formatDate(req.event_date)}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-accent-gold" />{req.guest_count} guests</span>
                      <span className="flex items-center gap-1.5 col-span-2 truncate"><MapPin className="w-3 h-3 text-accent-gold shrink-0" /><span className="truncate">{req.location}</span></span>
                    </div>

                    {/* Checklist progress */}
                    {cl.total > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] uppercase tracking-widest font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><CheckSquare className="w-2.5 h-2.5" /> Checklist</span>
                          <span className="font-mono">{cl.done}/{cl.total} · {healthPct}%</span>
                        </div>
                        <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
                          <div className={`h-full ${healthColor} rounded-full transition-all duration-500`} style={{ width: `${healthPct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="px-5 pb-5">
                    <Link href={`/operations/assignments/${a.id}`}
                      className="flex items-center justify-between w-full px-4 py-2.5 bg-background border border-border/60 hover:border-accent-gold/30 hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition group/btn"
                    >
                      Open Event Workspace
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-accent-gold group-hover/btn:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Closed / Completed */}
      {closed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground font-mono">Completed ({closed.length})</h2>
          </div>
          <div className="space-y-2">
            {closed.map(a => {
              const req = a.event_requests;
              if (!req) return null;
              const sc = getStatusConfig(a.status);
              return (
                <Link key={a.id} href={`/operations/assignments/${a.id}`}
                  className="flex items-center justify-between p-4 bg-surface border border-border/50 hover:border-accent-gold/20 rounded-xl transition group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-light text-foreground truncate">{req.event_type}</p>
                    <p className="text-[9.5px] text-muted-foreground font-mono">{formatDate(req.event_date)} · {req.profiles?.full_name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
