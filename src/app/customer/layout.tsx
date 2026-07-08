import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerLayout({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "customer") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-all duration-300">
      {/* Sub Header */}
      <div className="bg-surface/75 border-b border-border/80 backdrop-blur-xl sticky top-16 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Customer Portal
            </span>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="/customer/dashboard"
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Overview
            </a>
            <a
              href="/customer/request"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Plan Event
            </a>
            <a
              href="/customer/profile"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              My Profile
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
