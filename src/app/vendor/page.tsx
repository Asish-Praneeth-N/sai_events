import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VendorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, phone_number")
    .eq("id", user.id)
    .single();

  // Redirect to profile onboarding if details are missing
  if (!profile?.business_name || !profile?.phone_number || profile.phone_number === "0000000000") {
    redirect("/vendor/profile");
  }

  redirect("/vendor/inbox");
}
