import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users, Store, CalendarCheck, CheckCircle2, Clock, XCircle,
  Eye, Loader, ArrowRight, Activity, UserPlus
} from "lucide-react";

// ─── Shared card shell ────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0d0b08] border border-white/8 rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}

// ─── Stat cell inside a card ──────────────────────────────────────────────────
function StatRow({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-[#F7F3EC]/45 font-light">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${color}`}>
      {label}
    </span>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // ── Customers ──
  const { count: totalCustomers } = await supabase
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer");

  // ── Vendors ──
  const { count: totalVendors } = await supabase
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor");

  const { data: pendingVendorsData } = await supabase
    .from("profiles").select("id").eq("role", "vendor").eq("status", "Pending");
  const pendingVendors = pendingVendorsData?.length ?? 0;

  const { data: approvedVendorsData } = await supabase
    .from("profiles").select("id").eq("role", "vendor").eq("status", "Approved");
  const approvedVendors = approvedVendorsData?.length ?? 0;

  // ── Event Requests ──
  const { count: totalRequests }     = await supabase.from("event_requests").select("id", { count: "exact", head: true });
  const { count: submittedRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Request Submitted");
  const { count: underReviewRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Under Admin Review");
  const { count: selectionRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Vendor Selection In Progress");
  const { count: confirmedRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Confirmed");
  const { count: completedRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Completed");
  const { count: cancelledRequests } = await supabase.from("event_requests").select("id", { count: "exact", head: true }).eq("status", "Cancelled");

  // ── Recent Activity ──
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentRequestsData } = await supabase
    .from("event_requests")
    .select(`id, event_type, created_at, profiles ( full_name )`)
    .order("created_at", { ascending: false })
    .limit(6);

  const recentRequests = recentRequestsData ?? [];

  return (
    <div className="space-y-8">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-white/8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[#D4AF37]/70 uppercase tracking-[0.28em]">
            Platform Overview
          </span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-light text-white tracking-tight"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Dashboard
        </h1>
        <p className="text-xs text-[#F7F3EC]/40 mt-1 font-light">
          Real-time metrics across customers, vendors, and event requests.
        </p>
      </div>

      {/* ── Top KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Customers */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]/60 mb-1">Customers</p>
              <p className="text-4xl font-light text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                {totalCustomers ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#f5db91] transition-colors duration-200"
          >
            Manage Clients <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Vendors */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]/60 mb-1">Vendors</p>
              <p className="text-4xl font-light text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                {totalVendors ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <StatRow label="Pending Approval" value={pendingVendors}  color="text-amber-400" />
            <StatRow label="Active / Approved" value={approvedVendors} color="text-emerald-400" />
          </div>
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#f5db91] transition-colors duration-200"
          >
            Manage Vendors <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Event Requests */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]/60 mb-1">Event Requests</p>
              <p className="text-4xl font-light text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                {totalRequests ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#f5db91] transition-colors duration-200"
          >
            Manage Bookings <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

      </div>

      {/* ── Request Status Breakdown ──────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Request Status Pipeline</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Submitted",   value: submittedRequests ?? 0,   icon: Eye,          color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
            { label: "Under Review",value: underReviewRequests ?? 0, icon: Loader,       color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
            { label: "Matching",    value: selectionRequests ?? 0,   icon: Users,        color: "text-[#D4AF37]",   bg: "bg-[#D4AF37]/10",   border: "border-[#D4AF37]/20"   },
            { label: "Confirmed",   value: confirmedRequests ?? 0,   icon: CheckCircle2, color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20"    },
            { label: "Completed",   value: completedRequests ?? 0,   icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Cancelled",   value: cancelledRequests ?? 0,   icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"     },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border ${bg} ${border} text-center gap-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <div className={`text-2xl font-light ${color}`} style={{ fontFamily: "Playfair Display, serif" }}>
                {value}
              </div>
              <div className="text-[9px] font-bold text-[#F7F3EC]/40 uppercase tracking-wider leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Recent Sign-Ups */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Recent Sign-Ups</h2>
          </div>
          {recentProfiles && recentProfiles.length > 0 ? (
            <div className="space-y-0 divide-y divide-white/5">
              {recentProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] text-[10px] font-bold shrink-0">
                      {p.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{p.full_name}</div>
                      <div className="text-[10px] text-[#F7F3EC]/35 mt-0.5">{formatDate(p.created_at)}</div>
                    </div>
                  </div>
                  <Badge
                    label={p.role}
                    color={
                      p.role === "vendor"
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/8"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#F7F3EC]/30 py-4 text-center">No recent sign-ups.</p>
          )}
        </Card>

        {/* Recent Bookings */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Recent Bookings</h2>
          </div>
          {recentRequests.length > 0 ? (
            <div className="space-y-0 divide-y divide-white/5">
              {recentRequests.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-xs font-semibold text-white">{r.event_type}</div>
                    <div className="text-[10px] text-[#F7F3EC]/35 mt-0.5">
                      {r.profiles?.full_name ?? "Unknown"} · <span className="font-mono">{r.id.substring(0, 8)}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#F7F3EC]/35 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg font-mono">
                    {formatDate(r.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#F7F3EC]/30 py-4 text-center">No recent event submissions.</p>
          )}
        </Card>

      </div>
    </div>
  );
}
