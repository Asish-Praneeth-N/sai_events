import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Send, CheckCircle2, Clock, XOctagon, Eye } from "lucide-react";
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
      <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
        Failed to load vendor invitations: {error.message}
      </div>
    );
  }

  const invitations = (assignmentsData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-light font-heading text-foreground">Vendor Invitations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor dispatch statuses of lead invitations sent to suppliers. Finalize vendor selections once accepted.
        </p>
      </div>

      <VendorInvitationsClient initialInvitations={invitations} />
    </div>
  );
}
