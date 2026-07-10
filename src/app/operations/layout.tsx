import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OperationsSidebar from "@/components/operations/OperationsSidebar";

export default async function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    console.error(`[Layout Profile Fetch Error] uid: ${user.id}, error:`, profileErr.message);
  }

  if (!profile || profile.role !== "operational_manager") {
    console.log(`[Layout Access Denied] uid: ${user.id}, role: ${profile?.role || "null"}`);
    redirect("/unauthorized");
  }

  // Fetch OM metadata
  const { data: omData } = await supabase
    .from("operational_managers")
    .select("employee_id, designation, availability_status, employment_status, assigned_regions, assigned_cities")
    .eq("id", user.id)
    .single();

  // Onboarding lock screen
  if (!omData || omData.employment_status === "Onboarding") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 select-none font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#D4AF37]/6 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full bg-zinc-900/80 border border-white/8 rounded-3xl p-8 space-y-7 shadow-2xl relative z-10 text-center animate-scale-in">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto text-[#D4AF37] shadow-md">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#D4AF37]">SAI EVENTS OPERATIONS</span>
              <h2 className="text-xl font-light text-white mt-1" style={{ fontFamily: "Playfair Display, serif" }}>
                Workspace Activation Pending
              </h2>
              <p className="text-xs text-white/40 leading-relaxed font-light mt-2 max-w-xs mx-auto">
                Your Operational Manager account is being activated by the Admin team. You will receive an email once your workspace is live.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-b border-white/8 py-5 my-2 text-xs text-left">
            <div className="flex gap-3 items-center">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold text-[9px]">✓</div>
              <span className="font-semibold text-white">Account Created</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-[9px] animate-pulse">2</div>
              <span className="font-semibold text-white">Admin Workspace Activation</span>
            </div>
            <div className="flex gap-3 items-center opacity-40">
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/20 text-white/40 flex items-center justify-center font-bold text-[9px]">3</div>
              <span className="font-semibold">Execution Center Unlocked</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-white/30 font-light leading-relaxed max-w-[280px] mx-auto">
              Contact <span className="text-[#D4AF37] font-semibold font-mono">ops@saievents.com</span> if activation is delayed beyond 24 hours.
            </p>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full py-2.5 bg-zinc-800 border border-white/10 hover:border-red-950/40 text-xs font-semibold rounded-xl text-red-400 hover:bg-red-950/10 transition cursor-pointer">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Suspended / Deactivated
  if (omData.employment_status === "Suspended" || omData.employment_status === "Deactivated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 select-none">
        <div className="max-w-sm w-full bg-red-950/20 border border-red-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-light text-white" style={{ fontFamily: "Playfair Display, serif" }}>Access Suspended</h2>
          <p className="text-xs text-white/40">Your account has been {omData.employment_status.toLowerCase()} by the Admin team. Contact your supervisor.</p>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full py-2.5 bg-zinc-800 border border-white/10 text-xs font-semibold rounded-xl text-red-400 transition cursor-pointer">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active — pending assignment count for badge
  const { count: pendingCount } = await supabase
    .from("event_assignments")
    .select("*", { count: "exact", head: true })
    .eq("assigned_operational_manager_id", user.id)
    .eq("status", "Assigned");

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "Delivered");

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      <OperationsSidebar
        fullName={profile.full_name}
        employeeId={omData.employee_id}
        designation={omData.designation}
        availabilityStatus={omData.availability_status as any}
        pendingAssignments={pendingCount || 0}
        unreadNotifications={unreadCount || 0}
      />

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
