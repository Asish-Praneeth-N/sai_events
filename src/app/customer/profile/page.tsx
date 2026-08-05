import { createClient } from "@/lib/supabase/server";
import CustomerProfileForm from "./CustomerProfileForm";
import { Sparkles } from "lucide-react";

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
    return <div className="text-[#173d2c]/50 dark:text-[#eee5d7]/40 p-8 text-center">Loading user session...</div>;
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
    <div className="relative mx-auto w-full max-w-[1480px] animate-fade-in-up space-y-8">
      {/* Decorative background watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-4 hidden select-none font-heading text-[clamp(7rem,14vw,13rem)] italic leading-none tracking-[-0.08em] text-[#173d2c]/[0.022] xl:block dark:text-white/[0.015]"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Profile
      </span>

      {/* Page Header */}
      <header className="relative z-10 border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.07]">
        <div className="max-w-[800px]">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#173d2c]/40 dark:bg-[#d2b56b]/40" />
            <Sparkles className="h-3 w-3 text-[#a17a34] dark:text-[#d2b56b]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#173d2c]/55 sm:text-[9px] dark:text-[#d9c88d]/65">
              SAI Events · Private Client Account
            </span>
          </div>

          <h1
            className="font-heading text-[clamp(2.65rem,6vw,5.2rem)] font-normal leading-[0.95] tracking-[-0.05em] text-[#143d2b] dark:text-[#f0e8db]"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Client{" "}
            <span className="italic text-[#9a742e] dark:text-[#d2b56b]">
              Credentials.
            </span>
          </h1>

          <div className="mt-5 flex max-w-[680px] items-start gap-4">
            <span className="mt-[9px] hidden h-px w-9 shrink-0 bg-[#a17a34]/50 sm:block" />
            <p className="text-[12px] font-normal leading-[1.8] text-[#17392b]/65 sm:text-[13px] dark:text-[#eee5d7]/55" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Manage your verified contact credentials, primary location coordinates, and communication preferences for your celebration planning.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="relative z-10">
        <CustomerProfileForm 
          initialProfile={initialProfile} 
          isCompletionRequired={isCompletionRequired}
        />
      </main>

      {/* Footer Editorial Strip */}
      <footer className="relative z-10 flex flex-col gap-3 border-t border-[#173d2c]/10 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
          <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-[#173d2c]/40 sm:text-[8px] dark:text-white/30">
            Your Vision · Our Craft · One Celebration
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden h-px w-8 bg-[#173d2c]/15 sm:block dark:bg-white/10" />
          <span className="font-heading text-sm italic text-[#173d2c]/60 dark:text-[#d2b56b]/75" style={{ fontFamily: '"Playfair Display", serif' }}>
            SAI Events
          </span>
        </div>
      </footer>
    </div>
  );
}
