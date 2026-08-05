import { createClient } from "@/lib/supabase/server";
import { Activity, AlertCircle, Send } from "lucide-react";
import VendorInvitationsClient from "./VendorInvitationsClient";

export default async function AdminVendorInvitationsPage() {
  const supabase = await createClient();

  const { data: assignmentsData, error } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      request_id,
      status,
      created_at,
      updated_at,
      category_id,
      categories (
        name
      ),
      profiles (
        id,
        full_name,
        business_name
      ),
      event_requests (
        event_type,
        event_date
      )
    `)
    .order("updated_at", { ascending: false });

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
              Invitation Registry Unavailable
            </span>

            <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
              Failed to load vendor invitations:{" "}
              <span className="text-foreground">
                {error.message}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const invitations = (assignmentsData || []) as any[];

  const pendingCount = invitations.filter(
    (invitation) =>
      invitation.status === "Pending" ||
      invitation.status === "Sent"
  ).length;

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
                Vendor Operations / Dispatch
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Vendor Invitations
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Monitor supplier invitation responses, review accepted
              proposals, and finalize vendor assignments for active
              Event Cases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border bg-surface/30 px-3 py-2">
              <span
                className={`
                  h-1.5 w-1.5 rounded-full

                  ${pendingCount > 0
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                  }
                `}
              />

              <span className="text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} Awaiting Response`
                  : "Dispatch Queue Clear"}
              </span>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center border border-accent-gold/15 bg-accent-gold/[0.03] text-accent-gold sm:flex">
              <Send className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          INVITATIONS WORKSPACE
      ===================================================================== */}

      <VendorInvitationsClient
        initialInvitations={invitations}
      />
    </div>
  );
}