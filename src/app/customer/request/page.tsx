import { Fragment } from "react";
import { Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { EventPart, Recommendation } from "@/lib/types";

import EventRequestForm from "./EventRequestForm";

export default async function PlanEventPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================================================================
  // 1. USER PROFILE + ACTIVE DRAFT
  // ============================================================================

  let userProfile = null;
  let existingDraft = null;

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select(
        "full_name, email, phone_number, phone_country_code, whatsapp_number, whatsapp_country_code"
      )
      .eq("id", user.id)
      .single();

    userProfile = prof
      ? {
          fullName:
            prof.full_name && prof.full_name !== "Unnamed User"
              ? prof.full_name
              : "",
          email: prof.email || user.email || "",
          phoneNumber:
            prof.phone_number === "0000000000"
              ? ""
              : prof.phone_number || "",
          phoneCountryCode: prof.phone_country_code || "+91",
          whatsappNumber:
            prof.whatsapp_number ||
            (prof.phone_number === "0000000000"
              ? ""
              : prof.phone_number || ""),
          whatsappCountryCode: prof.whatsapp_country_code || "+91",
        }
      : {
          fullName: "",
          email: user.email || "",
          phoneNumber: "",
          phoneCountryCode: "+91",
          whatsappNumber: "",
          whatsappCountryCode: "+91",
        };

    // ==========================================================================
    // 2. FETCH EXISTING ACTIVE DRAFT
    // ==========================================================================

    try {
      const { data: draft } = await supabase
        .from("event_requests")
        .select("*")
        .eq("customer_id", user.id)
        .eq("is_draft", true)
        .eq("draft_status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      existingDraft = draft || null;
    } catch (_) {}
  }

  // ============================================================================
  // 3. FETCH ACTIVE CATEGORIES
  // ============================================================================

  const { data: categoriesData } = await supabase
    .from("categories")
    .select(
      "id, name, description, is_active, sort_order, created_at, updated_at"
    )
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // 4. FETCH ACTIVE SUBCATEGORIES
  // ============================================================================

  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select(
      "id, category_id, name, description, is_active, sort_order, created_at, updated_at"
    )
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // 5. FETCH ACTIVE SERVICE ITEMS + MEDIA
  // ============================================================================

  const { data: itemsData } = await supabase
    .from("service_items")
    .select(`
      *,
      service_item_media (
        media_url
      )
    `)
    .is("deleted_at", null)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // 6. FETCH ACTIVE EVENT PARTS
  // ============================================================================

  const { data: eventPartsData } = await supabase
    .from("event_parts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // 7. FETCH ACTIVE RECOMMENDATIONS
  // ============================================================================

  const { data: recommendationsData } = await supabase
    .from("recommendations")
    .select(`
      *,
      service_item:service_items (*)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // 8. FETCH ACTIVE MASTER PACKAGES
  // ============================================================================

  const { data: packagesData } = await supabase
    .from("packages")
    .select(`
      *,
      included_services:package_services(*),
      gallery_media:package_media(*)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // ============================================================================
  // NORMALIZE DATA
  // ============================================================================

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  const items = (itemsData || []).map((item: any) => ({
    ...item,
    price: Number(item.price),
    service_item_media: item.service_item_media || [],
  })) as any[];

  const eventParts = (eventPartsData || []) as EventPart[];

  const recommendations =
    (recommendationsData || []) as Recommendation[];

  const packages = (packagesData || []) as any[];

  // ============================================================================
  // PAGE
  // ============================================================================

  return (
    <div className="relative mx-auto w-full max-w-[1480px] animate-fade-in-up space-y-8">
      {/* Decorative background watermark */}
        {/* ================================================================== */}
        {/* EDITORIAL GUIDE LINES                                              */}
        {/* ================================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[4.5%]
            top-0

            hidden
            w-px

            bg-[#173d2c]/[0.07]

            xl:block

            dark:bg-white/[0.04]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-[4.5%]
            top-0

            hidden
            w-px

            bg-[#173d2c]/[0.07]

            xl:block

            dark:bg-white/[0.04]
          "
        />

        {/* ================================================================== */}
        {/* DECORATIVE BACKGROUND TYPOGRAPHY                                   */}
        {/* ================================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-8
            top-4

            hidden
            select-none

            font-heading
            text-[clamp(7rem,14vw,13rem)]
            italic
            leading-none
            tracking-[-0.08em]

            text-[#173d2c]/[0.022]

            xl:block

            dark:text-white/[0.015]
          "
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Plan
        </span>

        {/* ================================================================== */}
        {/* PAGE HEADER                                                        */}
        {/* ================================================================== */}

        <header
          className="
            relative
            z-10

            border-b
            border-[#173d2c]/10

            px-5
            pb-7
            pt-7

            sm:px-8
            sm:pb-8
            sm:pt-8

            md:px-[6%]
            md:pb-10
            md:pt-10

            lg:px-[7%]

            dark:border-white/[0.07]
          "
        >
          <div
            className="
              flex
              flex-col
              gap-7

              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            {/* ============================================================ */}
            {/* HEADER COPY                                                  */}
            {/* ============================================================ */}

            <div className="max-w-[760px]">
              {/* ---------------------------------------------------------- */}
              {/* EYEBROW                                                    */}
              {/* ---------------------------------------------------------- */}

              <div className="mb-4 flex items-center gap-3">
                <span
                  className="
                    h-px
                    w-8

                    bg-[#173d2c]/40

                    dark:bg-[#d2b56b]/40
                  "
                />

                <Sparkles
                  className="
                    h-3
                    w-3

                    text-[#a17a34]

                    dark:text-[#d2b56b]
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.3em]

                    text-[#173d2c]/55

                    sm:text-[9px]

                    dark:text-[#d9c88d]/65
                  "
                >
                  SAI Events · Planning Studio
                </span>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* MAIN HEADING                                                */}
              {/* ---------------------------------------------------------- */}

              <h1
                className="
                  font-heading

                  text-[clamp(2.65rem,6vw,5.6rem)]
                  font-normal
                  leading-[0.95]
                  tracking-[-0.05em]

                  text-[#143d2b]

                  dark:text-[#f0e8db]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Event Planning

                <span
                  className="
                    ml-[0.18em]

                    italic

                    text-[#9a742e]

                    dark:text-[#d2b56b]
                  "
                >
                  Studio
                </span>
              </h1>

              {/* ---------------------------------------------------------- */}
              {/* DESCRIPTION                                                 */}
              {/* ---------------------------------------------------------- */}

              <div
                className="
                  mt-5
                  flex
                  max-w-[650px]
                  items-start
                  gap-4
                "
              >
                <span
                  className="
                    mt-[9px]

                    hidden
                    h-px
                    w-9
                    shrink-0

                    bg-[#a17a34]/50

                    sm:block
                  "
                />

                <p
                  className="
                    text-[12px]
                    font-normal
                    leading-[1.8]

                    text-[#17392b]/65

                    sm:text-[13px]

                    dark:text-[#eee5d7]/55
                  "
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Define your celebration, select its meaningful moments,
                  explore thoughtfully curated recommendations, and shape every
                  service around your vision.
                </p>
              </div>
            </div>

            {/* ============================================================ */}
            {/* EDITORIAL SIDE MARKER                                        */}
            {/* ============================================================ */}

            <div
              className="
                hidden
                shrink-0
                items-end
                gap-4

                lg:flex
              "
            >
              <div className="text-right">
                <span
                  className="
                    block

                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.25em]

                    text-[#173d2c]/35

                    dark:text-white/25
                  "
                >
                  Planning Journey
                </span>

                <span
                  className="
                    mt-1
                    block

                    font-heading
                    text-xl
                    italic

                    text-[#a17a34]

                    dark:text-[#d2b56b]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  Designed around you
                </span>
              </div>

              <span
                className="
                  mb-1
                  h-10
                  w-px

                  bg-[#173d2c]/15

                  dark:bg-white/10
                "
              />

              <span
                className="
                  mb-1
                  h-2
                  w-2
                  rotate-45

                  border
                  border-[#a17a34]/60
                "
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* PLANNING JOURNEY LABELS                                          */}
          {/* ================================================================ */}

          <div
            className="
              mt-7

              flex
              flex-wrap
              items-center

              gap-x-5
              gap-y-2

              border-t
              border-[#173d2c]/10

              pt-4

              dark:border-white/[0.06]
            "
          >
            {[
              "Event Details",
              "Sub-Events",
              "Recommendations",
              "Services",
              "Catering",
            ].map((label, index) => (
              <Fragment key={label}>
                <span
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#173d2c]/40

                    sm:text-[8px]

                    dark:text-white/30
                  "
                >
                  {String(index + 1).padStart(2, "0")} · {label}
                </span>

                {index < 4 && (
                  <span
                    aria-hidden="true"
                    className="
                      h-1
                      w-1
                      rotate-45

                      bg-[#a17a34]/45
                    "
                  />
                )}
              </Fragment>
            ))}
          </div>
        </header>

        {/* ================================================================== */}
        {/* EVENT REQUEST FORM                                                 */}
        {/* ================================================================== */}

        <main
          className="
            relative
            z-10

            px-4
            py-7

            sm:px-6
            sm:py-9

            md:px-[6%]
            md:py-10

            lg:px-[7%]
            lg:py-12
          "
        >
          <EventRequestForm
            categories={categories}
            subcategories={subcategories}
            items={items}
            eventParts={eventParts}
            recommendations={recommendations}
            packages={packages}
            userProfile={userProfile}
            existingDraft={existingDraft}
          />
        </main>

        {/* ================================================================== */}
        {/* BOTTOM EDITORIAL STRIP                                             */}
        {/* ================================================================== */}

        <footer
          className="
            relative
            z-10

            flex
            flex-col
            gap-3

            border-t
            border-[#173d2c]/10

            px-5
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-8

            md:px-[6%]

            lg:px-[7%]

            dark:border-white/[0.06]
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                h-1
                w-1
                rotate-45

                bg-[#a17a34]
              "
            />

            <span
              className="
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.24em]

                text-[#173d2c]/40

                sm:text-[8px]

                dark:text-white/30
              "
            >
              Your Vision · Our Craft · One Celebration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="
                hidden
                h-px
                w-8

                bg-[#173d2c]/15

                sm:block

                dark:bg-white/10
              "
            />

            <span
              className="
                font-heading
                text-sm
                italic

                text-[#173d2c]/60

                dark:text-[#d2b56b]/75
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              SAI Events
            </span>
          </div>
        </footer>
    </div>
  );
}