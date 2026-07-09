import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSubHeader from "./AdminSubHeader";

export const metadata: Metadata = {
  title: "Sai Events — Admin Console",
  description: "Internal management portal for Sai Events administrators.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-[#090909] text-[#F7F3EC] flex flex-col font-sans">
      {/* Admin Navigation */}
      <AdminSubHeader />

      {/* Page content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Subtle ambient glow at bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
