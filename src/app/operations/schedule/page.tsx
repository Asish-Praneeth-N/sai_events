import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, Clock, ArrowRight, CheckSquare } from "lucide-react";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assignmentsData } = await supabase
    .from("event_assignments")
    .select(`
      id, status, escalation_level, expected_completion,
      event_requests (
        id, event_type, event_date, location, guest_count, profiles:customer_id (full_name)
      )
    `)
    .eq("assigned_operational_manager_id", user.id)
    .in("status", ["Pending", "Assigned", "Accepted", "Execution Started"]);

  const assignments = assignmentsData as any[] | null;


  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayStr = now.toISOString().split("T")[0];
  const in7days = new Date(now); in7days.setDate(now.getDate() + 7);
  const in30days = new Date(now); in30days.setDate(now.getDate() + 30);

  function classifyDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    if (d.toISOString().split("T")[0] === todayStr) return "today";
    if (d <= in7days) return "week";
    if (d <= in30days) return "month";
    return "future";
  }

  const groups = {
    today: (assignments || []).filter(a => a.event_requests?.event_date && classifyDate(a.event_requests.event_date) === "today"),
    week: (assignments || []).filter(a => a.event_requests?.event_date && classifyDate(a.event_requests.event_date) === "week"),
    month: (assignments || []).filter(a => a.event_requests?.event_date && classifyDate(a.event_requests.event_date) === "month"),
    future: (assignments || []).filter(a => a.event_requests?.event_date && classifyDate(a.event_requests.event_date) === "future"),
  };

  function AssignmentRow({ a }: { a: any }) {
    const req = a.event_requests;
    if (!req) return null;
    const statusColors: Record<string, string> = {
      "Pending":           "text-orange-400 bg-orange-500/10 border-orange-500/20",
      "Assigned":         "text-amber-400 bg-amber-500/10 border-amber-500/20",
      "Accepted":         "text-blue-400 bg-blue-500/10 border-blue-500/20",
      "Execution Started":"text-violet-400 bg-violet-500/10 border-violet-500/20",
    };
    return (
      <Link href={`/operations/assignments/${a.id}`}
        className="flex items-center justify-between gap-4 p-4 bg-surface border border-border/60 hover:border-accent-gold/25 rounded-xl transition group"
      >
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-light font-heading text-foreground group-hover:text-accent-gold transition truncate">{req.event_type}</h3>
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusColors[a.status] || ""}`}>{a.status}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-[9.5px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-accent-gold" />{formatDate(req.event_date)}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent-gold" />{req.location.split(",")[0]}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3 text-accent-gold" />{req.guest_count}</span>
          </div>
          <p className="text-[9.5px] text-muted-foreground">Client: {req.profiles?.full_name}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-gold transition shrink-0" />
      </Link>
    );
  }

  const sections = [
    { key: "today", label: "Today", icon: "🔴", accent: "text-red-400", list: groups.today },
    { key: "week", label: "This Week", icon: "🟡", accent: "text-amber-400", list: groups.week },
    { key: "month", label: "This Month", icon: "🔵", accent: "text-blue-400", list: groups.month },
    { key: "future", label: "Future", icon: "⚪", accent: "text-muted-foreground", list: groups.future },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Schedule</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">Your upcoming event schedule, grouped by timeframe.</p>
      </div>

      {(assignments || []).length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border/60 rounded-3xl">
          <Clock className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-light">No active or upcoming assignments to schedule.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(s => s.list.length > 0 && (
            <section key={s.key} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{s.icon}</span>
                <h2 className={`text-xs font-bold uppercase tracking-widest font-mono ${s.accent}`}>{s.label} ({s.list.length})</h2>
              </div>
              <div className="space-y-2">
                {s.list
                  .sort((a: any, b: any) => new Date(a.event_requests?.event_date).getTime() - new Date(b.event_requests?.event_date).getTime())
                  .map((a: any) => <AssignmentRow key={a.id} a={a} />)
                }
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
