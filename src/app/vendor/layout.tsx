import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorSidebar from "@/components/vendor/VendorSidebar";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, business_name, status, availability_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "vendor") {
    redirect("/unauthorized");
  }

  // If status is Pending or Rejected, show onboarding lock screen
  if (profile.status === "Pending" || profile.status === "Rejected") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 select-none font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#D4AF37]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full bg-surface border border-border/80 rounded-3xl p-8 space-y-7 shadow-2xl relative z-10 text-center animate-scale-in">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mx-auto text-accent-gold shadow-md">
              <svg className="w-8 h-8 animate-pulse text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-accent-gold">SAI EVENTS CALIBRATION</span>
              <h2 className="text-xl font-light font-heading text-white mt-1">Verification In Progress</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-light mt-2 max-w-xs mx-auto">
                Your vendor profile for <span className="text-white font-semibold">{profile.business_name || "N/A"}</span> is pending review.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-b border-border/40 py-5 my-2 text-xs text-left">
            <div className="flex gap-3 items-center">
              <div className="w-5 h-5 rounded-full bg-accent-gold text-black flex items-center justify-center font-bold text-[9px]">✓</div>
              <span className="font-semibold text-white">Application Received</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-5 h-5 rounded-full bg-zinc-900 border border-[#D4AF37] text-accent-gold flex items-center justify-center font-bold text-[9px] animate-pulse">2</div>
              <span className="font-semibold text-white">Credentials & Service Audit</span>
            </div>
            <div className="flex gap-3 items-center opacity-40">
              <div className="w-5 h-5 rounded-full bg-zinc-900 border border-border text-muted-foreground flex items-center justify-center font-bold text-[9px]">3</div>
              <span className="font-semibold">Business Workspace Activated</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto">
              Our vetting team responds within 24 hours. Contact us at <span className="text-accent-gold font-semibold font-mono">calibrate@saievents.com</span>
            </p>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full py-2.5 bg-background border border-border hover:border-red-950/20 text-xs font-semibold rounded-xl text-red-400 hover:bg-red-950/10 transition cursor-pointer">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Fetch pending invitation count for sidebar badge
  const { count: pendingCount } = await supabase
    .from("vendor_assignments")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user.id)
    .eq("status", "Pending");

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <VendorSidebar
        businessName={profile.business_name}
        fullName={profile.full_name}
        status={profile.status}
        availabilityStatus={(profile.availability_status as "Available" | "Busy" | "Leave") || "Available"}
        pendingCount={pendingCount || 0}
      />

      {/* Main content area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top-bar spacer */}
        <div className="lg:hidden h-14 shrink-0" />

        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
          {children}
        </div>

        {/* Mobile bottom-nav spacer */}
        <div className="lg:hidden h-16 shrink-0" />
      </main>
    </div>
  );
}
