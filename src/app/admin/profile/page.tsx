import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  User, Mail, Phone, Shield, Calendar, Lock, ShieldAlert,
  Bell, Palette, History
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/unauthorized");

  // Mock activity history list for premium dashboard feel
  const mockActivity = [
    { action: "Vendor Account Approved", details: "Approved Elara Decor Co. mapping", time: "2 hours ago" },
    { action: "Request Status Updated", details: "Marked Wedding Stage booking as Confirmed", time: "1 day ago" },
    { action: "Category Created", details: "Added Stage Setup under corporate catalog", time: "3 days ago" },
    { action: "Security Login Verification", details: "Session started from Hyderabad, IN", time: "4 days ago" }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-light font-heading text-foreground">Account Profile</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Manage your personal details, credentials, and notification parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Meta details */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-4 hover:shadow-md transition-all duration-300">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-accent-gold bg-background flex items-center justify-center text-accent-gold text-2xl font-black uppercase shadow-lg shadow-[#D4AF37]/5">
              {profile.full_name ? profile.full_name.substring(0, 2) : "AD"}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{profile.full_name || "Administrator"}</h3>
              <p className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">Master Controller</p>
            </div>

            <div className="pt-4 border-t border-border/50 text-left space-y-3 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="w-4 h-4 text-accent-gold" />
                <span>Full Platform Access</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent-gold" />
                <span>Session: {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* 2FA & Security card */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 hover:shadow-md transition-all duration-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-gold" />
              <span>Multi-Factor Authentication</span>
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Add an extra layer of protection to your platform operations account by requiring an authenticator code.
            </p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground font-semibold">Enable 2FA Protection</span>
              <span className="text-[9px] uppercase tracking-wider font-bold bg-background border border-border text-muted-foreground px-2 py-0.5 rounded-lg">
                Disabled
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Editing details & Settings tab panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Form Details */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">General Parameters</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <div className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-semibold">
                  {profile.full_name}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Account
                </label>
                <div className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-semibold font-mono">
                  {profile.email}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact Phone
                </label>
                <div className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-semibold">
                  {profile.phone_number || "N/A"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Account Role
                </label>
                <div className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-accent-gold text-xs font-bold uppercase tracking-wide">
                  {profile.role}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Settings */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Preferences</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-gold" />
                  <span className="text-muted-foreground font-semibold">Email Notifications</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-0.5 rounded border border-emerald-500/10">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent-gold" />
                  <span className="text-muted-foreground font-semibold">Theme Selection</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-accent-gold bg-accent-gold/5 px-2.5 py-0.5 rounded border border-accent-gold/10">
                  Adaptive
                </span>
              </div>
            </div>
          </div>

          {/* Recent Operations Log Activity */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-accent-gold" />
              <span>Recent Activity Log</span>
            </h4>
            <div className="divide-y divide-border/40">
              {mockActivity.map((act, index) => (
                <div key={index} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0 gap-4">
                  <div>
                    <div className="font-bold text-foreground">{act.action}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{act.details}</div>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
