import { createClient } from "@/lib/supabase/server";
import { EventPart } from "@/lib/types";
import EventPartsManager from "./EventPartsManager";

export default async function AdminEventPartsPage() {
  const supabase = await createClient();

  const { data: partsData } = await supabase
    .from("event_parts")
    .select("*")
    .order("sort_order", { ascending: true });

  const parts = (partsData || []) as EventPart[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EventPartsManager parts={parts} />
    </div>
  );
}
