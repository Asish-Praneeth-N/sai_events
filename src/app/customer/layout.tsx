import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomerLayoutClient from "@/components/customer/CustomerLayoutClient";

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
    .select("role, full_name, email, phone_number, profile_completed")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "customer") {
    redirect("/unauthorized");
  }

  return (
    <CustomerLayoutClient 
      customerName={profile?.full_name || "Client Partner"} 
      customerEmail={profile?.email || user.email || ""}
    >
      {children}
    </CustomerLayoutClient>
  );
}
