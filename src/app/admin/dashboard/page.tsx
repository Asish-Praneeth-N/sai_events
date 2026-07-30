import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users, Store, CalendarCheck, CheckCircle2, Clock, XCircle,
  Eye, Loader, ArrowRight, Activity, TrendingUp, AlertCircle,
  Shield, ShieldAlert, Send, Briefcase, History, AlertTriangle, Zap, Calendar,
  BookOpen, GitBranch
} from "lucide-react";

// Stat block component
function AttentionCard({ 
  label, 
  value, 
  icon: Icon, 
  description,
  colorClass = "text-foreground",
  bgClass = "bg-surface",
  href,
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  description?: string;
  colorClass?: string;
  bgClass?: string;
  href?: string;
}) {
  const cardContent = (
    <div className={`${bgClass} border border-border rounded-2xl p-5 hover:border-accent-gold/45 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-36 cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-accent-gold transition-colors">{label}</p>
          <h3 className={`text-3xl font-light font-heading mt-1 ${colorClass}`}>{value}</h3>
        </div>
        <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-accent-gold group-hover:scale-110 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {description && (
        <div className="text-[10px] text-muted-foreground font-medium pt-2 border-t border-border/30 truncate flex items-center justify-between">
          <span>{description}</span>
          <span className="text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{cardContent}</Link>;
  }

  return cardContent;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().split("T")[0];
  let dbError: Error | null = null;
  let todaysEvents = 0;
  let pendingEventCases = 0;
  let pendingVendors = 0;
  let pendingVendorInvitations = 0;
  let availableOMs = 0;
  let waitingOMAssignment = 0;
  let activeEvents = 0;
  let delayedEvents = 0;
  let escalatedEvents = 0;
  let recentAuditLogs: any[] = [];
  let recentNotifications: any[] = [];
  let upcomingEvents: any[] = [];

  try {
    // 1. Fetch Today's Events
    const { count: todaysEventsCount, error: err1 } = await supabase
      .from("event_requests")
      .select("id", { count: "exact", head: true })
      .eq("event_date", todayStr);
    if (err1) throw err1;
    todaysEvents = todaysEventsCount || 0;

    // 2. Fetch Pending Customer Requests (Event Cases)
    const { count: pendingEventCasesCount, error: err2 } = await supabase
      .from("event_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["Request Submitted", "Under Admin Review"]);
    if (err2) throw err2;
    pendingEventCases = pendingEventCasesCount || 0;

    // 3. Fetch Pending Vendor Registrations
    const { count: pendingVendorsCount, error: err3 } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "vendor")
      .eq("status", "Pending");
    if (err3) throw err3;
    pendingVendors = pendingVendorsCount || 0;

    // 4. Fetch Pending Vendor Invitations
    const { count: pendingVendorInvitationsCount, error: err4 } = await supabase
      .from("vendor_assignments")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending");
    if (err4) throw err4;
    pendingVendorInvitations = pendingVendorInvitationsCount || 0;

    // 5. Fetch Available OMs
    const { count: availableOMCount, error: omError } = await supabase
      .from("operational_managers")
      .select("id", { count: "exact", head: true })
      .eq("availability_status", "Available")
      .eq("employment_status", "Active");
    if (omError) throw omError;
    availableOMs = availableOMCount || 0;

    // 6. Fetch Event Cases Waiting OM Assignment
    const { count: waitingOMCount, error: err6 } = await supabase
      .from("event_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "Ready For Execution");
    if (err6) throw err6;
    waitingOMAssignment = waitingOMCount || 0;

    // 7. Fetch Events In Progress
    const { count: activeCount, error: err7 } = await supabase
      .from("event_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["Operational Manager Assigned", "Preparation", "Execution"]);
    if (err7) throw err7;
    activeEvents = activeCount || 0;

    // 8. Fetch Delayed Events
    const { count: delayedCount, error: err8 } = await supabase
      .from("event_assignments")
      .select("id", { count: "exact", head: true })
      .lt("expected_completion", new Date().toISOString())
      .neq("status", "Closed");
    if (err8) throw err8;
    delayedEvents = delayedCount || 0;

    // 9. Fetch Escalated Events
    const { count: escalatedCount, error: err9 } = await supabase
      .from("event_assignments")
      .select("id", { count: "exact", head: true })
      .gt("escalation_level", 0);
    if (err9) throw err9;
    escalatedEvents = escalatedCount || 0;

    // Fetch Recent Activity (Audit logs)
    const { data: auditData, error: err10 } = await supabase
      .from("audit_logs")
      .select("id, action, created_at, profiles ( full_name )")
      .order("created_at", { ascending: false })
      .limit(5);
    if (err10) throw err10;
    recentAuditLogs = auditData || [];

    // Fetch Recent Notifications
    const { data: notificationData, error: err11 } = await supabase
      .from("notifications")
      .select("id, message, created_at, user_name")
      .order("created_at", { ascending: false })
      .limit(5);
    if (err11) throw err11;
    recentNotifications = notificationData || [];

    // Fetch upcoming requests calendar
    const { data: upcomingEventsData, error: err12 } = await supabase
      .from("event_requests")
      .select(`
        id,
        event_type,
        event_date,
        location,
        status,
        total_budget,
        profiles ( full_name )
      `)
      .order("event_date", { ascending: true })
      .limit(4);
    if (err12) throw err12;
    upcomingEvents = upcomingEventsData || [];

  } catch (err: any) {
    dbError = err;
  }

  if (dbError) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-2xl animate-fade-in-up">
        <h2 className="text-base font-bold mb-2">Failed to load live Operations Control Center dashboard</h2>
        <p className="text-xs opacity-90">{dbError.message}</p>
        <p className="text-xs mt-4 opacity-75">Please execute the database migration script (`migration_milestone_2.sql`) in the Supabase SQL editor to create the required tables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Page Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-heading text-foreground">Operations Control Center</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            Real-time workforce, vendor, and event management ecosystem controls.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>System Online</span>
          </div>
        </div>
      </div>

      {/* "What requires my attention today?" Attention Indicators */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What requires my attention today?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AttentionCard 
            label="Today's Events" 
            value={todaysEvents || 0} 
            icon={Calendar} 
            description={todaysEvents ? "Events executing today!" : "No events scheduled for today"}
            colorClass="text-accent-gold"
            bgClass={todaysEvents ? "bg-accent-gold/5 border-accent-gold/35" : "bg-surface"}
            href="/admin/bookings?filter=today"
          />
          <AttentionCard 
            label="Pending Event Cases" 
            value={pendingEventCases || 0} 
            icon={Clock} 
            description="Awaiting customer requests review"
            colorClass={pendingEventCases ? "text-amber-500" : "text-foreground"}
            href="/admin/bookings?filter=pending"
          />
          <AttentionCard 
            label="Pending Vendor Reg." 
            value={pendingVendors || 0} 
            icon={Users} 
            description="Awaiting supplier onboarding approval"
            colorClass={pendingVendors ? "text-amber-500" : "text-foreground"}
            href="/admin/vendors?tab=pending"
          />
          <AttentionCard 
            label="Pending Vendor Invites" 
            value={pendingVendorInvitations || 0} 
            icon={Send} 
            description="Active category leads pending response"
            colorClass={pendingVendorInvitations ? "text-pink-500" : "text-foreground"}
            href="/admin/vendor-invitations"
          />
          <AttentionCard 
            label="OMs Available" 
            value={availableOMs} 
            icon={Briefcase} 
            description="Operational Managers ready for assignment"
            colorClass="text-emerald-500"
            href="/admin/operational-managers?status=available"
          />
          <AttentionCard 
            label="Waiting OM Assignment" 
            value={waitingOMAssignment} 
            icon={Shield} 
            description="Locked event cases waiting OM dispatch"
            colorClass={waitingOMAssignment ? "text-rose-500" : "text-foreground"}
            bgClass={waitingOMAssignment ? "bg-rose-500/5 border-rose-500/35" : "bg-surface"}
            href="/admin/assignments?filter=unassigned"
          />
          <AttentionCard 
            label="Events In Progress" 
            value={activeEvents} 
            icon={Activity} 
            description="Active events in preparation or execution"
            colorClass="text-blue-500"
            href="/admin/bookings?filter=active"
          />
          <AttentionCard 
            label="Delayed Event Tasks" 
            value={delayedEvents} 
            icon={AlertTriangle} 
            description="OM assignments past expected completion"
            colorClass={delayedEvents ? "text-red-500 animate-pulse" : "text-foreground"}
            href="/admin/assignments?filter=delayed"
          />
          <AttentionCard 
            label="Escalated Events" 
            value={escalatedEvents} 
            icon={ShieldAlert} 
            description="Events flagged with active escalations"
            colorClass={escalatedEvents ? "text-red-500" : "text-foreground"}
            bgClass={escalatedEvents ? "bg-red-500/10 border-red-500/30 animate-pulse" : "bg-surface"}
            href="/admin/assignments?filter=escalated"
          />
        </div>
      </div>

      {/* Main Grid: split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Quick Actions Console</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link 
                href="/admin/operational-managers" 
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:border-accent-gold/30 hover:scale-[1.02] transition duration-200 text-center gap-2 group cursor-pointer"
              >
                <Briefcase className="w-5 h-5 text-accent-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-foreground">Add OM Profile</span>
              </Link>
              <Link 
                href="/admin/bookings" 
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:border-accent-gold/30 hover:scale-[1.02] transition duration-200 text-center gap-2 group cursor-pointer"
              >
                <GitBranch className="w-5 h-5 text-accent-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-foreground">Review Cases</span>
              </Link>
              <Link 
                href="/admin/catalog" 
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:border-accent-gold/30 hover:scale-[1.02] transition duration-200 text-center gap-2 group cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-accent-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-foreground">Edit Catalog</span>
              </Link>
              <Link 
                href="/admin/reports" 
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:border-accent-gold/30 hover:scale-[1.02] transition duration-200 text-center gap-2 group cursor-pointer"
              >
                <TrendingUp className="w-5 h-5 text-accent-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-foreground">View Analytics</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Event Calendar */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Upcoming Events Log</h3>
              <Link href="/admin/bookings" className="text-xs text-accent-gold hover:underline flex items-center gap-1">
                Open Cases Registry <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {(!upcomingEvents || upcomingEvents.length === 0) ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No upcoming event requests found.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {upcomingEvents.map((req) => (
                  <div key={req.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{req.event_type}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap gap-2.5">
                        <span>Client: {req.profiles?.full_name}</span>
                        <span>•</span>
                        <span>Date: {formatDate(req.event_date)}</span>
                        <span>•</span>
                        <span className="truncate">Venue: {req.location}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                      <span className="text-xs font-semibold text-foreground font-mono">
                        ₹{Number(req.total_budget).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 bg-background border border-border text-muted-foreground rounded-md">
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications & Audit log */}
        <div className="space-y-6">
          
          {/* Notifications Log */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Alerts Log</h3>
              <Link href="/admin/notifications" className="text-[10px] text-accent-gold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3.5">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No recent alerts.</p>
              ) : (
                recentNotifications.map((ntf) => (
                  <div key={ntf.id} className="text-xs p-3 bg-background border border-border/50 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                      <span className="font-bold text-foreground truncate">{ntf.user_name || "System"}</span>
                      <span className="font-mono">{formatDate(ntf.created_at)}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-[10px]">{ntf.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Activity Audit Trail</h3>
              <Link href="/admin/status-history" className="text-[10px] text-accent-gold hover:underline">
                Audit Log
              </Link>
            </div>
            <div className="space-y-3">
              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No recent activity.</p>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold shrink-0 mt-1.5" />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{log.action}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        By {log.profiles?.full_name || "System"} · {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
