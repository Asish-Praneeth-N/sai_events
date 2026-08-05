import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VendorDetailsCard from "@/components/admin/VendorDetailsCard";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Store,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminVendorDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /* ==========================================================================
     VENDOR
  ========================================================================== */

  const { data: vendor, error } = await supabase
    .from("profiles")
    .select(`
      *,
      vendor_category_mappings (
        category_id,
        categories (
          name
        )
      )
    `)
    .eq("id", id)
    .eq("role", "vendor")
    .single();

  if (error || !vendor) {
    notFound();
  }

  /* ==========================================================================
     CUSTOM SERVICES
  ========================================================================== */

  let customServices: any[] = [];

  try {
    const { data: servicesData } = await supabase
      .from("vendor_custom_services")
      .select(`
        id,
        category_name,
        subcategory_name,
        service_name,
        custom_price,
        vendor_custom_service_media (
          media_url
        )
      `)
      .eq("vendor_id", id);

    if (servicesData) {
      customServices = servicesData;
    }
  } catch (err) {
    console.warn(
      "vendor_custom_services not migrated:",
      err
    );
  }

  /* ==========================================================================
     DISPLAY VALUES
  ========================================================================== */

  const vendorName =
    vendor.business_name ||
    vendor.full_name ||
    "Vendor";

  const categoryCount =
    vendor.vendor_category_mappings?.length || 0;

  const serviceCount = customServices.length;

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full space-y-5 pb-10 animate-fade-in-up">
      {/* =====================================================================
          NAVIGATION
      ===================================================================== */}

      <div className="flex items-center justify-between border-b border-border pb-3">
        <Link
          href="/admin/vendors"
          className="
            group inline-flex
            h-8 items-center gap-2

            border border-border
            bg-background/20
            px-3

            text-[6px] font-bold
            uppercase tracking-[0.14em]
            text-muted-foreground

            transition-all

            hover:border-accent-gold/30
            hover:bg-accent-gold/[0.04]
            hover:text-accent-gold
          "
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />

          Vendor Registry
        </Link>

        <span className="hidden font-mono text-[6px] uppercase tracking-[0.12em] text-muted-foreground/35 sm:block">
          ID {vendor.id?.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* =====================================================================
          HEADER
      ===================================================================== */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                Vendor Operations / Provider Record
              </span>
            </div>

            <h1
              className="max-w-3xl truncate text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {vendorName}
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Review provider information, service coverage,
              operational access, category assignments, and custom
              service configuration.
            </p>
          </div>

          {/* RECORD SUMMARY */}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-8 items-center gap-2 border border-border bg-surface/30 px-3">
              <BriefcaseBusiness className="h-3 w-3 text-accent-gold" />

              <span className="text-[6px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {categoryCount}{" "}
                {categoryCount === 1
                  ? "Category"
                  : "Categories"}
              </span>
            </div>

            <div className="flex h-8 items-center gap-2 border border-border bg-surface/30 px-3">
              <Store className="h-3 w-3 text-accent-gold" />

              <span className="text-[6px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {serviceCount}{" "}
                {serviceCount === 1
                  ? "Custom Service"
                  : "Custom Services"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          VENDOR OPERATIONS

          VendorDetailsCard continues owning all existing business logic.
      ===================================================================== */}

      <VendorDetailsCard
        vendor={vendor as any}
        customServices={customServices}
      />
    </div>
  );
}