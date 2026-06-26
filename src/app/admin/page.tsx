import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch Customer stats
  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer");

  // 2. Fetch Vendor stats
  const { count: totalVendors } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "vendor");

  const { data: pendingVendorsData } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "vendor")
    .eq("status", "Pending");
  const pendingVendors = pendingVendorsData?.length || 0;

  const { data: approvedVendorsData } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "vendor")
    .eq("status", "Approved");
  const approvedVendors = approvedVendorsData?.length || 0;

  // 3. Fetch Event Request stats
  const { count: totalRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true });

  const { count: submittedRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Request Submitted");

  const { count: underReviewRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Under Admin Review");

  const { count: selectionRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Vendor Selection In Progress");

  const { count: confirmedRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Confirmed");

  const { count: completedRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Completed");

  const { count: cancelledRequests } = await supabase
    .from("event_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "Cancelled");

  // 4. Fetch Recent Activities
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentRequestsData } = await supabase
    .from("event_requests")
    .select(`
      id,
      event_type,
      created_at,
      profiles (
        full_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentRequests = recentRequestsData || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time metrics, active bookings progression, and registration requests dashboard.
        </p>
      </div>

      {/* Stats Category Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* A. CUSTOMERS */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all duration-300 border-t-4 border-t-purple-500 animate-fade-in-up stagger-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-heading font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Customers Portal
              </h3>
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs font-medium">Total Customers</span>
              <span className="text-4xl font-extrabold font-heading text-foreground">{totalCustomers || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/customers"
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Manage Clients</span>
            <span>→</span>
          </Link>
        </div>

        {/* B. VENDORS */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all duration-300 border-t-4 border-t-indigo-500 animate-fade-in-up stagger-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-heading font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Service Vendors
              </h3>
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Registered</span>
                <span className="font-bold text-foreground">{totalVendors || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pending Approvals</span>
                <span className="font-bold text-amber-500">{pendingVendors || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Approved Active</span>
                <span className="font-bold text-emerald-500">{approvedVendors || 0}</span>
              </div>
            </div>
          </div>
          <Link
            href="/admin/vendors"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Manage Vendors & Mappings</span>
            <span>→</span>
          </Link>
        </div>

        {/* C. BOOKINGS OVERVIEW */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all duration-300 border-t-4 border-t-teal-500 animate-fade-in-up stagger-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-heading font-bold text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Event Requests
              </h3>
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs font-medium">Total Requests</span>
              <span className="text-4xl font-extrabold font-heading text-foreground">{totalRequests || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Manage Bookings & Status</span>
            <span>→</span>
          </Link>
        </div>

      </div>

      {/* D. EVENT STATES BREAKDOWN */}
      <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-4">
        <h3 className="font-heading font-bold text-base text-foreground">Requests Breakdown by Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-blue-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submitted</div>
            <div className="text-2xl font-extrabold text-blue-500 dark:text-blue-400 mt-1">{submittedRequests || 0}</div>
          </div>
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-amber-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Under Review</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">{underReviewRequests || 0}</div>
          </div>
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-purple-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Matching</div>
            <div className="text-2xl font-extrabold text-purple-500 dark:text-purple-400 mt-1">{selectionRequests || 0}</div>
          </div>
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-teal-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confirmed</div>
            <div className="text-2xl font-extrabold text-teal-500 dark:text-teal-400 mt-1">{confirmedRequests || 0}</div>
          </div>
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-emerald-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400 mt-1">{completedRequests || 0}</div>
          </div>
          <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/30 hover:border-red-500/30 transition-all duration-200">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cancelled</div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">{cancelledRequests || 0}</div>
          </div>
        </div>
      </div>

      {/* E. RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-5">
        
        {/* Recent Registrations */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
          <h3 className="font-heading font-bold text-base text-foreground">Recent Member Sign-Ups</h3>
          {recentProfiles && recentProfiles.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentProfiles.map((p) => (
                <div key={p.id} className="py-3.5 flex justify-between text-xs items-center first:pt-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-foreground">{p.full_name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Joined {formatDate(p.created_at)}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${
                    p.role === "vendor" 
                      ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20" 
                      : "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/20"
                  }`}>
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4">No recent sign-ups found.</p>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="p-6 rounded-2xl bg-surface border border-border/50 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
          <h3 className="font-heading font-bold text-base text-foreground">Recent Booking Submissions</h3>
          {recentRequests && recentRequests.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentRequests.map((r: any) => (
                <div key={r.id} className="py-3.5 flex justify-between text-xs items-center first:pt-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-foreground">{r.event_type}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Client: {r.profiles?.full_name || "Unknown"} • ID: <span className="font-mono">{r.id.substring(0, 8)}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {formatDate(r.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4">No recent event submissions found.</p>
          )}
        </div>

      </div>
    </div>
  );
}
