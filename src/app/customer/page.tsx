import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Direct navigation to dashboard for high availability
  redirect("/customer/dashboard");
}
