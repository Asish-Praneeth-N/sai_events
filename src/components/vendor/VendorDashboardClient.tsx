"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, ShieldCheck, Clock, CheckCircle2, AlertCircle, 
  Calendar, Users, MapPin, Briefcase, 
  ChevronRight, Activity, Plus, FileText, Check, X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { respondToAssignment } from "@/app/vendor/inbox/actions";
import { updateVendorAvailability } from "@/app/vendor/actions";

interface Assignment {
  id: string;
  status: string;
  created_at: string;
  categories: { name: string } | null;
  event_requests: {
    id: string;
    event_type: string;
    event_date: string;
    location: string;
    guest_count: number;
    total_budget: number;
    event_assignments: {
      id: string;
      profiles: {
        full_name: string;
        phone_number: string;
        email: string;
      } | null;
    }[];
  } | null;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: string;
}

interface VendorDashboardClientProps {
  profile: {
    id: string;
    full_name: string;
    phone_number: string;
    business_name: string | null;
    address: string | null;
    status: string;
    email: string;
    created_at: string;
    availability_status: "Available" | "Busy" | "Leave";
  };
  categories: string[];
  assignments: Assignment[];
  notifications: Notification[];
}

export default function VendorDashboardClient({
  profile,
  categories,
  assignments,
  notifications,
}: VendorDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Availability state — seeded from DB (profiles.availability_status)
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Leave">(
    profile.availability_status
  );
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);

  const handleAvailabilityChange = async (state: "Available" | "Busy" | "Leave") => {
    setAvailabilityUpdating(true);
    setAvailability(state);
    try {
      await updateVendorAvailability(state);
    } catch (err: any) {
      setError(err.message || "Failed to update availability.");
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === "Pending").length;
    const accepted = assignments.filter((a) => a.status === "Accepted").length;
    const approved = assignments.filter((a) => a.status === "Approved").length;
    const rejected = assignments.filter((a) => a.status === "Rejected").length;

    // Profile completion calculations
    let strength = 0;
    if (profile.business_name) strength += 25;
    if (profile.address) strength += 25;
    if (profile.phone_number && profile.phone_number !== "0000000000") strength += 25;
    if (categories.length > 0) strength += 25;

    const acceptanceRate = total === 0 ? 100 : Math.round(((accepted + approved) / total) * 100);

    return {
      total,
      pending,
      accepted,
      approved,
      rejected,
      strength,
      acceptanceRate,
    };
  }, [assignments, profile, categories]);

  const handleInboxAction = async (id: string, accept: boolean) => {
    setActionLoadingId(id);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await respondToAssignment(id, accept);
        setSuccess(
          accept 
            ? "Invitation accepted successfully! Awaiting Admin review." 
            : "Invitation declined successfully."
        );
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to respond to invitation.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Grouped assignments
  const pendingLeads = useMemo(() => assignments.filter((a) => a.status === "Pending").slice(0, 2), [assignments]);
  const activeProjects = useMemo(() => assignments.filter((a) => a.status === "Approved").slice(0, 3), [assignments]);

  const getCountdownDays = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "Event is Today!";
    return `${diffDays} days left`;
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Custom Status & Alerts banner */}
      {error && (
        <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Dashboard Header Banner ── */}
      <div className="p-8 md:p-10 rounded-3xl bg-surface border border-border/80 shadow-md relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="light-leak" />
        
        <div className="space-y-4.5 relative z-10 max-w-xl">
          <div>
            <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">SAI EVENTS Business Workspace</span>
            <h2 className="text-3xl font-light font-heading text-foreground mt-1.5">
              {profile.business_name || "Enterprise Workspace"}
            </h2>
          </div>

          <div className="space-y-2 border-l border-accent-gold/25 pl-4 py-1">
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Vetted Supplier Partner mapped to <span className="text-foreground font-semibold">{categories.join(", ") || "General Services"}</span>. All logistics are synced directly with the operational managers.
            </p>
            <div className="flex gap-4 text-[10px] text-muted-foreground font-mono mt-2.5">
              <span>Owner: {profile.full_name}</span>
              <span>·</span>
              <span>Joined: {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved Partner
            </span>
          </div>
        </div>

        {/* Right Info Card: Daily Operational Availability status */}
        <div className="bg-background/45 backdrop-blur-md border border-border/60 p-6 rounded-2xl relative z-10 w-full lg:w-auto shrink-0 flex flex-col justify-between gap-5 min-w-[260px]">
          <div className="space-y-1.5 text-center lg:text-left">
            <span className="text-[8.5px] uppercase font-bold tracking-widest text-muted-foreground block">Workspace State</span>
            <div className="flex items-center justify-center lg:justify-start gap-2.5 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${
                availability === "Available" ? "bg-emerald-500 animate-pulse" : availability === "Busy" ? "bg-amber-500" : "bg-red-500"
              }`} />
              <h3 className="text-sm font-bold text-foreground">{availability} for Assigns</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {(["Available", "Busy", "Leave"] as const).map((state) => (
              <button
                key={state}
                disabled={availabilityUpdating}
                onClick={() => handleAvailabilityChange(state)}
                className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                  availability === state
                    ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold font-black"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-surface-raised"
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          <a
            href="/vendor/calendar"
            className="w-full text-center px-4 py-2.5 bg-surface-raised border border-border hover:border-accent-gold/40 text-xs font-semibold rounded-xl transition duration-200 block"
          >
            Update Calendar Dates
          </a>
        </div>
      </div>

      {/* ── Business Health Metrics Panel ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Business Health Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5.5 bg-surface border border-border/80 rounded-2xl flex flex-col justify-between gap-4.5 hover:border-accent-gold/25 transition">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Acceptance Rate</span>
              <Activity className="w-4 h-4 text-accent-gold" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-accent-gold">{stats.acceptanceRate}%</span>
              <span className="text-[9px] text-muted-foreground block mt-1 leading-normal font-light">Leads accepted compared to assignments received</span>
            </div>
          </div>

          <div className="p-5.5 bg-surface border border-border/80 rounded-2xl flex flex-col justify-between gap-4.5 hover:border-accent-gold/25 transition">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Active Bookings</span>
              <Briefcase className="w-4 h-4 text-accent-gold" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-foreground">{stats.approved} Active</span>
              <span className="text-[9px] text-muted-foreground block mt-1 leading-normal font-light">Confirmed event files currently in calibration execution</span>
            </div>
          </div>

          <div className="p-5.5 bg-surface border border-border/80 rounded-2xl flex flex-col justify-between gap-4.5 hover:border-accent-gold/25 transition">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Pending Leads</span>
              <Clock className="w-4 h-4 text-accent-gold" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-foreground">{stats.pending} Decisions</span>
              <span className="text-[9px] text-muted-foreground block mt-1 leading-normal font-light">Leads inbox opportunities awaiting business authorization</span>
            </div>
          </div>

          <div className="p-5.5 bg-surface border border-border/80 rounded-2xl flex flex-col justify-between gap-4.5 hover:border-accent-gold/25 transition">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Profile Strength</span>
              <CheckCircle2 className="w-4 h-4 text-accent-gold" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-foreground">{stats.strength}%</span>
              <span className="text-[9px] text-muted-foreground block mt-1 leading-normal font-light">Business profile details, locations, and category logs mapped</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Two-Column Dashboard Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Pending Invitations & Confirmed Bookings list */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Pending Invitations snapshot */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Leads Opportunities</h3>
              {stats.pending > 2 && (
                <a href="/vendor/inbox" className="text-[10px] text-accent-gold font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                  View All ({stats.pending}) <ChevronRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {pendingLeads.length > 0 ? (
              <div className="space-y-4">
                {pendingLeads.map((lead) => {
                  const req = lead.event_requests;
                  if (!req) return null;

                  return (
                    <div 
                      key={lead.id} 
                      className="p-6 bg-surface border border-border/80 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent-gold/20 transition duration-300 shadow-sm"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold bg-accent-gold/5 border border-accent-gold/20 px-2 py-0.5 rounded">
                            {lead.categories?.name} Lead
                          </span>
                          <span className="text-[9.5px] font-mono text-muted-foreground">ID: {lead.id.substring(0, 8)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{req.event_type}</h4>
                        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {req.event_date}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {req.location.split(",")[0]}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {req.guest_count} guests</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:self-center shrink-0">
                        <button
                          disabled={actionLoadingId === lead.id}
                          onClick={() => handleInboxAction(lead.id, false)}
                          className="px-3.5 py-2 border border-border hover:bg-red-950/15 hover:border-red-900/30 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          disabled={actionLoadingId === lead.id}
                          onClick={() => handleInboxAction(lead.id, true)}
                          className="px-4.5 py-2 bg-gradient-to-r from-accent-gold to-amber-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                          Accept Lead
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-light border border-dashed border-border/80 rounded-3xl bg-surface/50">
                No new invitations or planning leads available today.
              </div>
            )}
          </div>

          {/* Active Bookings (Confirmed Projects) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Coordination Files</h3>
              {stats.approved > 3 && (
                <a href="/vendor/bookings" className="text-[10px] text-accent-gold font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                  View All ({stats.approved}) <ChevronRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {activeProjects.length > 0 ? (
              <div className="space-y-4.5">
                {activeProjects.map((project) => {
                  const req = project.event_requests;
                  if (!req) return null;
                  const om = req.event_assignments?.[0]?.profiles;

                  return (
                    <div 
                      key={project.id} 
                      className="p-6 bg-surface border border-border/80 rounded-3xl flex flex-col justify-between gap-5 hover:border-accent-gold/20 transition duration-300 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[8.5px] uppercase font-bold text-accent-gold tracking-widest">{project.categories?.name} Assignment</span>
                          <h4 className="text-base font-bold text-foreground mt-1">{req.event_type}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1">{req.event_date} · {req.location}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8.5px] uppercase font-bold text-muted-foreground block">Countdown</span>
                          <span className="text-xs font-bold text-accent-gold font-mono tracking-wider block mt-0.5">
                            {getCountdownDays(req.event_date)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center text-accent-gold text-[9px] font-mono font-bold uppercase">
                            {om?.full_name?.substring(0, 2) || "OM"}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-light">
                            Assigned Partner: <span className="text-foreground font-semibold">{om?.full_name || "SAI EVENTS Dispatch"}</span>
                          </span>
                        </div>

                        <a
                          href={`/vendor/bookings/${project.id}`}
                          className="px-4.5 py-2 bg-background border border-border hover:border-accent-gold/40 text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Open Project Workspace
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-light border border-dashed border-border/80 rounded-3xl bg-surface/50">
                No active project files currently booked. Accept inbox leads to request assignments.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Quick Actions, Recent Notifications */}
        <div className="lg:col-span-4 space-y-8 w-full">
          
          {/* Quick Actions Shortcuts Grid */}
          <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Control Grid</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <a 
                href="/vendor/services" 
                className="p-4 bg-background border border-border/70 hover:border-accent-gold/40 hover:bg-surface-raised rounded-xl flex flex-col justify-between h-[85px] transition"
              >
                <Plus className="w-4 h-4 text-accent-gold" />
                <span className="text-[10.5px] font-bold text-foreground">Manage Services</span>
              </a>
              <a 
                href="/vendor/profile" 
                className="p-4 bg-background border border-border/70 hover:border-accent-gold/40 hover:bg-surface-raised rounded-xl flex flex-col justify-between h-[85px] transition"
              >
                <FileText className="w-4 h-4 text-accent-gold" />
                <span className="text-[10.5px] font-bold text-foreground">Update Portfolio</span>
              </a>
              <a 
                href="/vendor/calendar" 
                className="p-4 bg-background border border-border/70 hover:border-accent-gold/40 hover:bg-surface-raised rounded-xl flex flex-col justify-between h-[85px] transition"
              >
                <Calendar className="w-4 h-4 text-accent-gold" />
                <span className="text-[10.5px] font-bold text-foreground">Block Leave Days</span>
              </a>
              <a 
                href="/vendor/profile" 
                className="p-4 bg-background border border-border/70 hover:border-accent-gold/40 hover:bg-surface-raised rounded-xl flex flex-col justify-between h-[85px] transition"
              >
                <Store className="w-4 h-4 text-accent-gold" />
                <span className="text-[10.5px] font-bold text-foreground">Profile Settings</span>
              </a>
            </div>
          </div>

          {/* Activity Log Notifications snapshot */}
          <div className="p-6 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity Timeline</h3>
            {notifications.length > 0 ? (
              <div className="space-y-4 relative">
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-px bg-border/60" />
                
                <div className="space-y-4.5">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3 relative pl-6">
                      <span className={`absolute left-2.5 top-1.5 w-1.5 h-1.5 rounded-full -translate-x-1/2 ${
                        notif.status === "Delivered" ? "bg-accent-gold animate-pulse" : "bg-border"
                      }`} />
                      <div className="text-[10.5px] space-y-0.5">
                        <p className="text-foreground/80 font-light leading-normal">{notif.message}</p>
                        <span className="text-[8px] text-muted-foreground font-mono block">{formatDate(notif.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-4 font-light">No recent activity updates registered.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
