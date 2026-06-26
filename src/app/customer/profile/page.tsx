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
    .select("full_name, phone_number, address")
    .eq("id", user.id)
    .single();

  const initialProfile = {
    fullName: profile?.full_name || "",
    phoneNumber: profile?.phone_number === "0000000000" ? "" : profile?.phone_number || "",
    address: profile?.address || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">My Customer Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your contact credentials and standard shipping/billing event address.
        </p>
      </div>

      <CustomerProfileForm initialProfile={initialProfile} />
    </div>
  );
}
