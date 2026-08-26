import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Matchmaker from "./Matchmaker";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch event request details
  const { data: request, error: reqError } = await supabase
    .from("event_requests")
    .select(`
      *,
      profiles (
        full_name,
        phone_number,
        email,
        address
      )
    `)
    .eq("id", id)
    .single();

  if (reqError || !request) {
    notFound();
  }

  // 2. Fetch request items joined with categories
  const { data: itemsData, error: itemsError } = await supabase
    .from("request_items")
    .select(`
      id,
      quantity,
      unit_price,
      pricing_type,
      service_items (
        id,
        name,
        subcategories (
          id,
          categories (
            id,
            name
          )
        )
      )
    `)
    .eq("request_id", id);

  if (itemsError) {
    return <div className="text-red-400">Failed to load request items: {itemsError.message}</div>;
  }

  const items = itemsData || [];

  // Group items by category and collect unique category IDs
  const categoryGroupsMap: Record<string, {
    category: { id: string; name: string };
    items: any[];
  }> = {};

  items.forEach((item: any) => {
    const serviceItem = item.service_items;
    const category = serviceItem?.subcategories?.categories;
    if (!category) return;

    if (!categoryGroupsMap[category.id]) {
      categoryGroupsMap[category.id] = {
        category: { id: category.id, name: category.name },
        items: [],
      };
    }

    const unitPrice = Number(item.unit_price);
    const qty = Number(item.quantity);
    let lineTotal = 0;
    
    if (item.pricing_type === "flat") {
      lineTotal = unitPrice * qty;
    } else if (item.pricing_type === "per_plate") {
      lineTotal = unitPrice * request.guest_count * qty;
    }

    categoryGroupsMap[category.id].items.push({
      name: serviceItem.name,
      quantity: qty,
      unitPrice,
      pricingType: item.pricing_type,
      lineTotal,
    });
  });

  const categoryIds = Object.keys(categoryGroupsMap);

  // 3. Fetch mapped vendors for these categories
  let mappedVendors: any[] = [];
  if (categoryIds.length > 0) {
    const { data: vendorsData } = await supabase
      .from("vendor_category_mappings")
      .select(`
        category_id,
        profiles (
          id,
          full_name,
          phone_number,
          email,
          business_name,
          address
        )
      `)
      .in("category_id", categoryIds);
    mappedVendors = vendorsData || [];
  }

  // 4. Fetch current assignments
  const { data: assignmentsData } = await supabase
    .from("vendor_assignments")
    .select(`
      id,
      vendor_id,
      category_id,
      status,
      profiles (
        full_name,
        phone_number,
        email,
        business_name
      )
    `)
    .eq("request_id", id);
  const assignments = assignmentsData || [];

  // 6. Fetch current OM assignments (Event Assignments)
  const { data: omAssignmentsData } = await supabase
    .from("event_assignments")
    .select(`
      id,
      assigned_operational_manager_id,
      assignment_date,
      status,
      handover_notes,
      internal_notes,
      expected_completion,
      escalation_level,
      escalation_reason,
      reassignment_history,
      profiles:assigned_operational_manager_id (
        id,
        full_name,
        phone_number,
        email
      )
    `)
    .eq("event_id", id);
  const omAssignments = omAssignmentsData || [];

  // 7. Fetch available Operational Managers for assignment matching
  const { data: availableOMsData } = await supabase
    .from("operational_managers")
    .select(`
      id,
      employee_id,
      designation,
      availability_status,
      employment_status,
      current_workload,
      performance_score,
      completion_rate,
      profiles:id (
        full_name,
        phone_number,
        email
      )
    `)
    .eq("availability_status", "Available")
    .eq("employment_status", "Active");
  const availableOMs = (availableOMsData || []).map((om: any) => ({
    id: om.id,
    employee_id: om.employee_id,
    designation: om.designation,
    availability_status: om.availability_status,
    employment_status: om.employment_status,
    current_workload: om.current_workload,
    performance_score: Number(om.performance_score),
    completion_rate: Number(om.completion_rate),
    full_name: om.profiles?.full_name || "Unknown Manager",
    phone_number: om.profiles?.phone_number || "N/A",
    email: om.profiles?.email || "N/A"
  }));

  // 8. Fetch timelines log
  const { data: timelineData } = await supabase
    .from("timelines")
    .select(`
      id,
      milestone_name,
      description,
      is_internal,
      created_at,
      profiles ( full_name )
    `)
    .eq("event_id", id)
    .order("created_at", { ascending: false });
  const timelineLogs = timelineData || [];

  // 9. Fetch Hierarchical Event Functions & Price Snapshots
  const { data: eventPartsData } = await supabase
    .from("customer_event_parts")
    .select(`
      *,
      selected_package:packages(*),
      custom_services:customer_event_part_services(
        *,
        service_item:service_items(*),
        service_package:packages(*)
      ),
      catering_config:catering_configurations(*)
    `)
    .eq("request_id", id)
    .order("created_at", { ascending: true });
  const customerEventParts = eventPartsData || [];

  // 9. Structure the category groups for the Matchmaker component
  const groups = categoryIds.map((catId) => {
    const group = categoryGroupsMap[catId];
    
    // Filter mapped vendors for this category
    const catVendors = mappedVendors
      .filter((v) => v.category_id === catId && v.profiles)
      .map((v) => ({
        id: v.profiles.id,
        full_name: v.profiles.full_name,
        phone_number: v.profiles.phone_number,
        email: v.profiles.email,
        business_name: v.profiles.business_name,
        address: v.profiles.address,
      }));

    // Filter assignments for this category
    const catAssignments = assignments.filter((a) => a.category_id === catId);

    return {
      category: group.category,
      items: group.items,
      mappedVendors: catVendors,
      assignments: catAssignments as any[],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/bookings"
          className="px-3.5 py-2 bg-surface hover:bg-surface-raised text-foreground border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold rounded-xl transition-all duration-200"
        >
          ← Back to Registry
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Manage Event Case</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Case ID: <span className="font-mono">{request.id}</span> • Event: <span className="font-semibold text-foreground">{request.event_type}</span>
          </p>
        </div>
      </div>

      <Matchmaker
        requestId={request.id}
        currentStatus={request.status}
        customerProfile={{
          fullName: request.profiles?.full_name || "Unknown Customer",
          phone: request.profiles?.phone_number || "N/A",
          email: request.profiles?.email || "N/A",
          address: request.location || "N/A",
          additionalContacts: request.additional_contacts || null,
          referenceVideoUrl: request.reference_video_url || null,
          specialRequirements: request.special_requirements || null,
          referenceImages: request.reference_images || [],
        }}
        groups={groups}
        omAssignments={omAssignments as any[]}
        availableOMs={availableOMs}
        timelineLogs={timelineLogs as any[]}
        customerEventParts={customerEventParts as any[]}
      />
    </div>
  );
}
