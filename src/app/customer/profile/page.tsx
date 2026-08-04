import { createClient } from "@/lib/supabase/server";
import CustomerProfileForm from "./CustomerProfileForm";

export default async function CustomerProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ completion?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isCompletionRequired = resolvedParams.completion === "required";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-zinc-400">Loading user session...</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, phone_country_code, whatsapp_country_code, whatsapp_number, whatsapp_same_as_phone, address, location_lat, location_lng, profile_completed, role")
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
    fullName: profile?.full_name && profile.full_name !== "Unnamed User" ? profile.full_name : "",
    phoneNumber: profile?.phone_number === "0000000000" ? "" : profile?.phone_number || "",
    phoneCountryCode: profile?.phone_country_code || "+91",
    whatsappCountryCode: profile?.whatsapp_country_code || "+91",
    whatsappNumber: profile?.whatsapp_number || (profile?.phone_number === "0000000000" ? "" : profile?.phone_number || ""),
    whatsappSameAsPhone: profile?.whatsapp_same_as_phone ?? true,
    address: profile?.address || "",
    locationLat: profile?.location_lat ? Number(profile.location_lat) : undefined,
    locationLng: profile?.location_lng ? Number(profile.location_lng) : undefined,
    email: user.email || "",
    role: profile?.role || "customer",
    profileCompleted: Boolean(profile?.profile_completed),
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

      <CustomerProfileForm 
        initialProfile={initialProfile} 
        isCompletionRequired={isCompletionRequired}
      />
    </div>
  );
}
