import { createClient } from "@/lib/supabase/server";
import CustomerProfileForm from "./CustomerProfileForm";

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-zinc-400">Loading user session...</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, address, role")
    .eq("id", user.id)
    .single();

  const { data: requests } = await supabase
    .from("event_requests")
    .select("status")
    .eq("customer_id", user.id);

  const activeCasesCount = (requests || []).filter(
    (r) => !["Cancelled", "Completed", "Closed"].includes(r.status)
  ).length;

  const totalCasesCount = (requests || []).length;

  const initialProfile = {
    fullName: profile?.full_name || "",
    phoneNumber: profile?.phone_number === "0000000000" ? "" : profile?.phone_number || "",
    address: profile?.address || "",
    email: user.email || "",
    role: profile?.role || "customer",
    activeCasesCount,
    totalCasesCount,
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Customer Profile Credentials</h1>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Manage your contact credentials and standard shipping/billing event address.
        </p>
      </div>

      <CustomerProfileForm initialProfile={initialProfile} />
    </div>
  );
}
