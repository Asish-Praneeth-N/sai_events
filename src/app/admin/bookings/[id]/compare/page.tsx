import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import CompareClient from "./CompareClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorComparisonPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch event request details
  const { data: request, error: reqError } = await supabase
    .from("event_requests")
    .select(`
      *,
      profiles ( full_name, phone_number, email, address )
    `)
    .eq("id", id)
    .single();

  if (reqError || !request) {
    notFound();
  }

  // 2. Fetch all vendor quotations for this event request
  const { data: quotationsData } = await supabase
    .from("vendor_quotations")
    .select(`
      *,
      vendor_profile:profiles!vendor_quotations_vendor_id_fkey (
        id,
        full_name,
        phone_number,
        email,
        business_name,
        address,
        primary_city,
        service_radius_km,
        years_of_experience,
        availability_status,
        max_daily_capacity
      ),
      items:vendor_quotation_items (
        id,
        service_item_id,
        item_price,
        quantity,
        subtotal,
        service_item:service_items ( name )
      )
    `)
    .eq("request_id", id);

  // 3. Fetch all vendor assignments for fallback
  const { data: assignmentsData } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      vendor_id,
      category_id,
      status,
      created_at,
      categories ( name ),
      vendor_profile:profiles (
        id,
        full_name,
        phone_number,
        email,
        business_name,
        address,
        primary_city,
        service_radius_km,
        years_of_experience,
        availability_status
      )
    `)
    .eq("request_id", id);

  const quotations = (quotationsData || []) as any[];
  const assignments = (assignmentsData || []) as any[];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/bookings/${id}`}
          className="px-3.5 py-2 bg-surface hover:bg-surface-raised text-foreground border border-border text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          ← Back to Event Case #{id.substring(0, 8)}
        </Link>
      </div>

      <div className="border-b border-border/50 pb-4">
        <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest">Usability Studio</span>
        <h1 className="text-2xl font-light font-heading text-foreground mt-0.5">Unified Vendor Quotations Comparison</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Side-by-side quotation comparison for <strong className="text-foreground">{request.event_type}</strong> in <strong className="text-foreground">{request.location}</strong> on <strong className="text-accent-gold">{request.event_date}</strong>.
        </p>
      </div>

      <CompareClient
        requestId={id}
        request={request}
        quotations={quotations}
        assignments={assignments}
      />
    </div>
  );
}
