"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Recommendation, ServiceItem } from "@/lib/types";
import { saveRecommendation, deleteRecommendation } from "./actions";

interface Props {
  recommendations: Recommendation[];
  serviceItems: ServiceItem[];
}

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Sreemantham / Baby Shower",
  "Anniversary",
  "Housewarming",
  "Other Celebration",
];

export default function RecommendationsManager({ recommendations, serviceItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEventType, setSelectedEventType] = useState<string>("Wedding");

  const [showModal, setShowModal] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  // Form states
  const [serviceItemId, setServiceItemId] = useState("");
  const [badgeLabel, setBadgeLabel] = useState("Recommended");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredRecs = recommendations.filter((r) => r.event_type === selectedEventType);

  const openAddModal = () => {
    setEditingRec(null);
    setServiceItemId(serviceItems[0]?.id || "");
    setBadgeLabel("Recommended");
    setSortOrder(filteredRecs.length + 1);
    setIsActive(true);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (rec: Recommendation) => {
    setEditingRec(rec);
    setServiceItemId(rec.service_item_id);
    setBadgeLabel(rec.badge_label || "Recommended");
    setSortOrder(rec.sort_order);
    setIsActive(rec.is_active);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceItemId) {
      setError("Please select a catalog item");
      return;
    }

    startTransition(async () => {
      try {
        await saveRecommendation({
          id: editingRec?.id,
          eventType: selectedEventType,
          serviceItemId,
          badgeLabel: badgeLabel.trim(),
          sortOrder,
          isActive,
        });
        setShowModal(false);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to save recommendation");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this recommendation?")) return;
    startTransition(async () => {
      try {
        await deleteRecommendation(id);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Recommendations Master</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curate recommended packages and service items to showcase for each event type.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl transition text-xs shadow-md shadow-accent-gold/15 uppercase tracking-wider self-start sm:self-auto cursor-pointer"
        >
          + Add Recommendation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EVENT_TYPES.map((type) => {
          const count = recommendations.filter((r) => r.event_type === type).length;
          const isSelected = selectedEventType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedEventType(type)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-accent-gold text-black shadow-md shadow-accent-gold/20 font-bold"
                  : "bg-surface hover:bg-surface-raised border border-border text-muted-foreground"
              }`}
            >
              <span>{type}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-black/20 text-black" : "bg-background text-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommendations List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 bg-background/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recommendations for {selectedEventType} ({filteredRecs.length})
          </span>
        </div>

        {filteredRecs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No recommendations created for {selectedEventType}. Click "+ Add Recommendation" to add curated catalog items.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredRecs
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((rec) => {
                const item = serviceItems.find((i) => i.id === rec.service_item_id) || rec.service_item;
                return (
                  <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-background/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-md">
                          #{rec.sort_order}
                        </span>
                        <h4 className="font-semibold text-foreground text-sm">{item?.name || "Unknown Catalog Item"}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                          {rec.badge_label || "Recommended"}
                        </span>
                        {!rec.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item?.description} — ₹{item?.price?.toLocaleString("en-IN")} ({item?.pricing_unit || item?.pricing_type})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(rec)}
                        className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border text-foreground text-xs rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded-lg transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-lg font-bold text-foreground">
              {editingRec ? "Edit Recommendation" : `Add Recommendation for ${selectedEventType}`}
            </h3>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Select Catalog Item</label>
                <select
                  value={serviceItemId}
                  onChange={(e) => setServiceItemId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                >
                  <option value="">-- Choose Item --</option>
                  {serviceItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₹{item.price} ({item.pricing_unit || item.pricing_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Badge Label</label>
                <input
                  type="text"
                  value={badgeLabel}
                  onChange={(e) => setBadgeLabel(e.target.value)}
                  placeholder="e.g. Recommended, Popular Choice, Premium Bundle"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                  />
                </div>

                <div className="space-y-1.5 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2.5 select-none font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-border text-accent-gold focus:ring-accent-gold bg-background h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>Is Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md shadow-accent-gold/15"
                >
                  {isPending ? "Saving..." : "Save Recommendation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
