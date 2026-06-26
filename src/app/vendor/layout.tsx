import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorSubHeader from "./VendorSubHeader";

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
    .select("role, full_name, business_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "vendor") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* Glassmorphic Sub Header */}
      <VendorSubHeader businessName={profile.business_name} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
