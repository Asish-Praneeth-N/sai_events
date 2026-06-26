import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSubHeader from "./AdminSubHeader";

export const metadata: Metadata = {
  title: "Sai Events Admin Portal",
};

export default async function AdminLayout({
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* Sub Header for Admin Panel */}
      <AdminSubHeader />

      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
