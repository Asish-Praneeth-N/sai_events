"use client";

import React from "react";
import { Recommendation, ServiceItem } from "@/lib/types";
import { Sparkles, Check, Plus } from "lucide-react";

interface Props {
  eventType: string;
  recommendations: Recommendation[];
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onApplyAll: (itemIds: string[]) => void;
}

export default function RecommendationsStep({
  eventType,
  recommendations,
  selectedItemIds,
  onToggleItem,
  onApplyAll,
}: Props) {
  const recs = recommendations.filter((r) => r.event_type === eventType && r.is_active && r.service_item);

  const allRecItemIds = recs.map((r) => r.service_item_id);
  const isAllSelected = allRecItemIds.length > 0 && allRecItemIds.every((id) => selectedItemIds.includes(id));

  const handleApplyAll = () => {
    if (isAllSelected) {
      // Unselect all recommendations
      onApplyAll(selectedItemIds.filter((id) => !allRecItemIds.includes(id)));
    } else {
      // Select all recommendations
      const combined = Array.from(new Set([...selectedItemIds, ...allRecItemIds]));
      onApplyAll(combined);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            <h3 className="text-xl font-bold font-heading text-foreground">Our Recommendations</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curated premium packages recommended by our event experts for {eventType}.
          </p>
        </div>

        {recs.length > 0 && (
          <button
            type="button"
            onClick={handleApplyAll}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
              isAllSelected
                ? "bg-surface-raised border border-border text-foreground"
                : "bg-accent-gold text-black hover:brightness-110 shadow-accent-gold/20"
            }`}
          >
            {isAllSelected ? "Remove All Recommendations" : "Add All Recommended Bundles"}
          </button>
        )}
      </div>

      {recs.length === 0 ? (
        <div className="p-8 bg-surface border border-border rounded-2xl text-center text-muted-foreground text-xs">
          No specific recommendations configured for {eventType}. Proceed to custom service selection below.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recs
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((rec) => {
              const item = rec.service_item as ServiceItem;
              if (!item) return null;

              const isSelected = selectedItemIds.includes(item.id);

              return (
                <div
                  key={rec.id}
                  onClick={() => onToggleItem(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "bg-accent-gold/10 border-accent-gold shadow-lg shadow-accent-gold/5"
                      : "bg-surface hover:bg-surface-raised border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                        {rec.badge_label || "Recommended"}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-accent-gold border-accent-gold text-black" : "border-border bg-background"
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Estimated Rate</span>
                      <span className="text-base font-bold text-accent-gold font-heading">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                        ({item.pricing_unit === "per_plate" ? "Per Plate" : item.pricing_unit === "per_piece" ? "Per Piece" : "Fixed Package"})
                      </span>
                    </div>

                    <span className={`text-xs font-bold ${isSelected ? "text-accent-gold" : "text-muted-foreground"}`}>
                      {isSelected ? "Selected" : "Click to Add"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
