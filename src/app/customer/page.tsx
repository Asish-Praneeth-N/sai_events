import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_number, address")
    .eq("id", user.id)
    .single();

  if (!profile?.phone_number || profile.phone_number === "0000000000" || !profile?.address) {
    redirect("/customer/profile");
  }

  redirect("/customer/dashboard");
}
