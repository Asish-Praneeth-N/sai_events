import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users, Store, CalendarCheck, CheckCircle2, Clock, XCircle,
  Eye, Loader, ArrowRight, Activity, TrendingUp, AlertCircle
} from "lucide-react";

// Stat block component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  description,
  trend,
  colorClass = "text-foreground" 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  description?: string;
  trend?: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-accent-gold/25 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <h3 className={`text-2xl font-light font-heading ${colorClass}`}>{value}</h3>
        </div>
        <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-accent-gold">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {(trend || description) && (
        <div className="flex items-center gap-1 mt-4 text-[10px] text-muted-foreground">
          {trend && <span className="text-emerald-500 font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {trend}</span>}
          {description && <span>{description}</span>}
        </div>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch summary counts
  const { count: totalCustomers } = await supabase
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer");

  const { count: totalVendors } = await supabase
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor");

  const { count: pendingVendors } = await supabase
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor").eq("status", "Pending");

  const { count: pendingRequests } = await supabase
    .from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Request Submitted");

  const { count: activeBookings } = await supabase
    .from("event_requests").select("id", { count: "exact", head: true })
    .in("status", ["Confirmed", "Vendor Approved by Admin", "Customer Confirmation Pending"]);

  // Calculate estimated total volume
  const { data: budgetData } = await supabase
    .from("event_requests")
    .select("total_budget");
  const totalVolume = (budgetData || []).reduce((acc, curr) => acc + Number(curr.total_budget), 0);

  // Fetch active events checklist
  const { data: upcomingRequestsData } = await supabase
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
    .limit(5);

  const upcomingRequests = (upcomingRequestsData || []) as any[];

  // Fetch recent vendor registrations
  const { data: recentVendorsData } = await supabase
    .from("profiles")
    .select("id, full_name, business_name, created_at, status")
    .eq("role", "vendor")
    .order("created_at", { ascending: false })
    .limit(4);

  const recentVendors = (recentVendorsData || []) as any[];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Page header */}
      <div className="border-b border-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light font-heading text-foreground">Control Center</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            Real-time operations dashboard for managing the Sai Events ecosystem.
          </p>
        </div>
        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span>System Online</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Estimated Revenue" 
          value={`₹${totalVolume.toLocaleString("en-IN")}`} 
          icon={TrendingUp} 
          trend="+12%" 
          description="lifetime gross volume"
          colorClass="text-accent-gold"
        />
        <StatCard 
          label="Active Bookings" 
          value={activeBookings || 0} 
          icon={CalendarCheck} 
          description="in execution pipeline"
        />
        <StatCard 
          label="Pending Customer Inquiries" 
          value={pendingRequests || 0} 
          icon={Clock} 
          description="awaiting review" 
          colorClass={pendingRequests && pendingRequests > 0 ? "text-amber-500" : "text-foreground"}
        />
        <StatCard 
          label="Pending Vendor Approvals" 
          value={pendingVendors || 0} 
          icon={Store} 
          description="awaiting onboarding"
          colorClass={pendingVendors && pendingVendors > 0 ? "text-amber-500" : "text-foreground"}
        />
      </div>

      {/* Subsections: Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Operations Overview (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Upcoming Event Pipelines</h2>
              <Link href="/admin/bookings" className="text-xs text-accent-gold hover:underline flex items-center gap-1">
                View all bookings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {(!upcomingRequests || upcomingRequests.length === 0) ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No upcoming event requests found.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {upcomingRequests.map((req) => (
                  <div key={req.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{req.event_type}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap gap-2.5">
                        <span>Client: {req.profiles?.full_name}</span>
                        <span>•</span>
                        <span>Date: {formatDate(req.event_date)}</span>
                        <span>•</span>
                        <span className="truncate">Location: {req.location}</span>
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

        {/* Sidebar overview (Right Column) */}
        <div className="space-y-6">
          
          {/* Quick Onboarding Approvals card */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Vendor Registrations</h2>
            
            {(!recentVendors || recentVendors.length === 0) ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent vendor registration requests.
              </div>
            ) : (
              <div className="space-y-4">
                {recentVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-foreground">{vendor.business_name || vendor.full_name}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Joined: {formatDate(vendor.created_at)}</div>
                    </div>
                    <Link 
                      href="/admin/vendors"
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        vendor.status === "Pending" 
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {vendor.status === "Pending" ? "Review" : "Details"}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Helper */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-background border border-border text-accent-gold">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Operational Tip</h4>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Filter bookings under &quot;Vendor Selection&quot; status to quickly dispatch lead assignments to appropriate photography or decoration vendors.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
