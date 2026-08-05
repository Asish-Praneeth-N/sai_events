import { createClient } from "@/lib/supabase/server";
import VendorsList from "@/components/admin/VendorsList";
import {
  Activity,
  AlertCircle,
  Store,
  Users,
} from "lucide-react";

export default async function AdminVendorsPage() {
  const supabase = await createClient();

  const { data: vendorsData, error } = await supabase
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
    .eq("role", "vendor")
    .order("created_at", { ascending: false });

  /* ==========================================================================
     ERROR STATE
  ========================================================================== */

  if (error) {
    return (
      <div className="relative overflow-hidden border border-red-500/25 bg-red-500/[0.04] p-4">
        <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-red-500" />

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-red-500/20 bg-red-500/[0.06] text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>

          <div>
            <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-red-500">
              Vendor Registry Unavailable
            </span>

            <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
              Failed to load vendors:{" "}
              <span className="text-foreground">
                {error.message}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const vendors = (vendorsData || []) as any[];

  /* ==========================================================================
     OPERATIONAL COUNTS

     These are presentation-only values derived from the already-loaded data.
     No database or workflow logic is changed.
  ========================================================================== */

  const totalVendors = vendors.length;

  const pendingVendors = vendors.filter((vendor) => {
    const status = String(
      vendor.vendor_status ??
        vendor.approval_status ??
        vendor.status ??
        ""
    ).toLowerCase();

    return (
      status === "pending" ||
      status === "pending_approval" ||
      status === "under_review"
    );
  }).length;

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full space-y-5 pb-10 animate-fade-in-up">
      {/* =====================================================================
          HEADER
      ===================================================================== */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                Vendor Operations / Registry
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Vendor Management
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Review provider registrations, manage service category
              associations, approve vendor access, and maintain active
              supplier records across SAI EVENTS operations.
            </p>
          </div>

          {/* REGISTRY STATUS */}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-border bg-surface/30 px-3 py-2">
              <span
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${
                    pendingVendors > 0
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                  }
                `}
              />

              <span className="text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {pendingVendors > 0
                  ? `${pendingVendors} Awaiting Review`
                  : "Vendor Queue Clear"}
              </span>
            </div>

            <div className="flex h-8 items-center gap-2 border border-accent-gold/15 bg-accent-gold/[0.03] px-3 text-accent-gold">
              <Users className="h-3 w-3" />

              <span className="font-mono text-[6px] font-medium uppercase tracking-[0.12em]">
                {String(totalVendors).padStart(2, "0")} Vendors
              </span>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center border border-accent-gold/15 bg-accent-gold/[0.03] text-accent-gold sm:flex">
              <Store className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          VENDOR WORKSPACE

          Existing VendorsList functionality is deliberately untouched.
      ===================================================================== */}

      <VendorsList vendors={vendors} />
    </div>
  );
}