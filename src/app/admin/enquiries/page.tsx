import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EnquiriesClient from "./EnquiriesClient";

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Check admin authorization
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/unauthorized");
  }

  let enquiries: any[] = [];
  let tableMissing = false;

  try {
    const { data, error } = await supabase
      .from("guest_enquiries")
      .select(`
        *,
        profiles:linked_user_id (
          full_name,
          role,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        tableMissing = true;
      } else {
        throw error;
      }
    } else {
      enquiries = data || [];
    }
  } catch (err: any) {
    console.error("Error fetching guest enquiries:", err);
    tableMissing = true;
  }

  return (
    <EnquiriesClient
      initialEnquiries={enquiries}
      tableMissing={tableMissing}
    />
  );
}
