import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OMProfile from "@/components/operations/OMProfile";

export default async function OperationsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, email, address")
    .eq("id", user.id)
    .single();

  // Fetch OM metadata
  const { data: omData } = await supabase
    .from("operational_managers")
    .select("employee_id, designation, availability_status, employment_status, assigned_regions, assigned_cities, performance_score, completion_rate, current_workload, joining_date")
    .eq("id", user.id)
    .single();

  if (!profile || !omData) {
    redirect("/unauthorized");
  }

  const initialProfile = {
    fullName: profile.full_name || "",
    phoneNumber: profile.phone_number === "0000000000" ? "" : profile.phone_number || "",
    address: profile.address || "",
    email: profile.email || "",
    availabilityStatus: (omData.availability_status as any) || "Available",
  };

  return <OMProfile initialProfile={initialProfile} omData={omData as any} />;
}
