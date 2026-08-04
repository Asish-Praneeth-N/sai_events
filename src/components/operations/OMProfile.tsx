"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveOMProfile, updateOMAvailability } from "@/app/operations/actions";
import {
  CheckCircle2, AlertCircle, LogOut, ShieldCheck, User, Phone, MapPin,
  Clock, Info, Activity, Star, Calendar, Target, Globe
} from "lucide-react";

interface OMProfileProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    address: string;
    email: string;
    availabilityStatus: "Available" | "Busy" | "On Leave" | "Training" | "Inactive";
  };
  omData: {
    employee_id: string;
    designation: string;
    assigned_regions: string[];
    assigned_cities: string[];
    performance_score: number;
    completion_rate: number;
    current_workload: number;
    joining_date: string;
  };
}

export default function OMProfile({ initialProfile, omData }: OMProfileProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [address, setAddress] = useState(initialProfile.address);

  const [availability, setAvailability] = useState(initialProfile.availabilityStatus);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fields = [fullName, phoneNumber, address];
  const filledCount = fields.filter((f) => f.trim().length > 0).length;
  const completeness = Math.round((filledCount / 3) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (phoneNumber.trim().length < 10) {
        throw new Error("Phone number must contain at least 10 digits.");
      }
      await saveOMProfile({ fullName, phoneNumber, address });

      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(null), 3500);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (state: typeof availability) => {
    setAvailabilityLoading(true);
    setAvailability(state);
    try {
      await updateOMAvailability(state);
      setSuccess(`Availability changed to ${state}.`);
      setTimeout(() => setSuccess(null), 2500);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = (fullName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast feedback */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-scale-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden border border-border/80 shadow-md">
        <div className="h-44 bg-gradient-to-br from-[#1c1815] via-[#2d261f] to-[#120e0c] dark:from-[#0d0b0a] dark:to-[#050404] flex items-center justify-end px-8 relative">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-accent-gold/5 to-transparent blur-2xl pointer-events-none" />
          
          <div className="flex gap-2 relative z-10">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/25 select-none">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Employee
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-0 bg-surface flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-14 relative z-10">
            <div className="w-24 h-24 rounded-[28px] bg-zinc-900 border-2 border-accent-gold flex items-center justify-center text-accent-gold text-3xl font-heading shadow-xl select-none font-bold">
              {initials}
            </div>
            <div className="space-y-1 pb-1">
              <h2 className="text-2xl font-light text-foreground font-heading leading-tight">
                {fullName || "Manager"}
              </h2>
              <p className="text-xs text-muted-foreground font-mono font-light">
                {omData.designation} · {omData.employee_id}
              </p>
            </div>
          </div>

          {/* Profile completeness calibration */}
          <div className="w-full sm:w-64 space-y-2 self-end pb-1">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">
              <span>Profile Calibration</span>
              <span className={completeness === 100 ? "text-emerald-400 font-bold" : "text-accent-gold font-bold"}>
                {completeness}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-background border border-border/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completeness === 100 ? "bg-emerald-500" : "bg-accent-gold"
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editable Details */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Personal details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={initialProfile.email}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-muted-foreground opacity-60 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Address / Base Location</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home Address or base location details..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition resize-none font-light leading-relaxed"
              />
            </div>
          </div>

          {/* Quick status alignment */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Duty Status Selection</h3>
            </div>
            <p className="text-[10px] text-muted-foreground font-light leading-normal">
              Change your availability status. This affects automatic event assignment suggestions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Available", "Busy", "On Leave", "Training"] as const).map((state) => (
                <button
                  key={state}
                  type="button"
                  disabled={availabilityLoading}
                  onClick={() => handleAvailabilityChange(state)}
                  className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center cursor-pointer transition ${
                    availability === state
                      ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold font-black"
                      : "bg-background border-border text-muted-foreground hover:bg-surface-raised"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              {loading ? "Saving Profile..." : "Save Profile Details"}
            </button>
          </div>
        </form>

        {/* Right Column: Read Only KPIs & System Meta */}
        <div className="lg:col-span-5 space-y-6 w-full">
          {/* Performance metrics */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Performance Calibration</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-border/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] uppercase tracking-wider font-bold text-muted-foreground">Rating Score</span>
                  <Star className="w-3.5 h-3.5 text-accent-gold" />
                </div>
                <div className="text-xl font-light font-heading text-accent-gold">
                  {(omData.performance_score || 5).toFixed(1)}<span className="text-[10px] text-muted-foreground">/10</span>
                </div>
              </div>

              <div className="p-4 bg-background border border-border/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] uppercase tracking-wider font-bold text-muted-foreground">Completion Rate</span>
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-xl font-light font-heading text-blue-400">
                  {Math.round(omData.completion_rate || 100)}%
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-2 border-t border-border/40 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-light">Current Workload</span>
                <span className="font-semibold text-foreground font-mono">{omData.current_workload || 0} active assignments</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-light">Employment Status</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  {omData.joining_date ? "Active Employee" : "Active Partner"}
                </span>
              </div>
              {omData.joining_date && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-light">Joining Date</span>
                  <span className="font-semibold text-foreground font-mono">
                    {new Date(omData.joining_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location details card */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Jurisdiction Regions</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Assigned Regions</span>
                {omData.assigned_regions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {omData.assigned_regions.map((reg) => (
                      <span key={reg} className="px-2.5 py-1 bg-background border border-border rounded-lg text-[9.5px] font-bold text-foreground">
                        {reg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic font-light">All Regions Eligible</span>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/30">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Assigned Cities</span>
                {omData.assigned_cities?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {omData.assigned_cities.map((city) => (
                      <span key={city} className="px-2.5 py-1 bg-background border border-border rounded-lg text-[9.5px] font-bold text-foreground font-light">
                        {city}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic font-light">All Cities Eligible</span>
                )}
              </div>
            </div>
          </div>

          {/* Account control */}
          <div className="p-6 bg-surface border border-border/80 rounded-[32px] space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Session Control</h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{initialProfile.email}</p>
            </div>

            {!showSignOutConfirm ? (
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full py-2.5 border border-border hover:border-red-950/20 text-xs font-bold uppercase tracking-wider rounded-xl text-red-400 hover:bg-red-950/10 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-2xl animate-scale-in text-xs font-bold">
                <span className="text-muted-foreground">Are you sure?</span>
                <div className="flex items-center gap-2 font-bold">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    type="button"
                    className="px-3.5 py-1.5 border border-border rounded-xl text-muted-foreground cursor-pointer text-[10px]"
                  >Cancel</button>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    type="button"
                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl uppercase tracking-wider cursor-pointer text-[10px]"
                  >
                    {signingOut ? "Leaving..." : "Yes, Exit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
