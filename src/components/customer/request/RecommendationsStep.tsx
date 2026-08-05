"use client";

import React from "react";
import { Recommendation, ServiceItem } from "@/lib/types";
import { Sparkles, Check, Plus, ArrowRight } from "lucide-react";

interface Props {
  eventType: string;
  recommendations: Recommendation[];
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onApplyAll: (itemIds: string[]) => void;
}

export default function RecommendationsStep({ eventType, recommendations, selectedItemIds, onToggleItem, onApplyAll }: Props) {
  const recs = recommendations.filter((r) => r.event_type === eventType && r.is_active && r.service_item);
  const allRecItemIds = recs.map((r) => r.service_item_id);
  const isAllSelected = allRecItemIds.length > 0 && allRecItemIds.every((id) => selectedItemIds.includes(id));

  const handleApplyAll = () => {
    if (isAllSelected) onApplyAll(selectedItemIds.filter((id) => !allRecItemIds.includes(id)));
    else onApplyAll(Array.from(new Set([...selectedItemIds, ...allRecItemIds])));
  };

  return (
    <section className="animate-fade-in-up space-y-6">
      <div className="border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.08]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3"><span className="h-px w-8 bg-[#a17a34]/50" /><Sparkles className="h-3.5 w-3.5 text-[#a17a34] dark:text-[#d2b56b]" /><span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#173d2c]/55 dark:text-[#d9c88d]/70">Selected by SAI Events</span></div>
            <h3 className="font-heading text-2xl font-normal tracking-[-0.025em] text-[#143d2b] sm:text-3xl dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>Our <span className="italic text-[#9a742e] dark:text-[#d2b56b]">Recommendations</span></h3>
            <p className="mt-2 text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55">Curated premium packages recommended by our event experts for {eventType}.</p>
          </div>
          {recs.length > 0 && (
            <button type="button" onClick={handleApplyAll} className={`group flex items-center justify-center gap-2 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] transition ${isAllSelected ? "border border-[#173d2c]/15 text-[#143d2b] hover:border-[#a17a34]/50 dark:border-white/15 dark:text-[#eee5d7]" : "bg-[#143d2b] text-[#fffaf1] shadow-[0_10px_28px_rgba(20,61,43,0.14)] dark:bg-[#d2b56b] dark:text-[#161812]"}`}>
              {isAllSelected ? "Remove All Recommendations" : "Add All Recommended Bundles"}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>

      <div>
        {recs.length === 0 ? (
          <div className="border border-dashed border-[#173d2c]/15 bg-[#fffaf3]/55 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <p className="font-heading text-lg italic text-[#173d2c]/65 dark:text-[#eee5d7]/60" style={{ fontFamily: '"Playfair Display", serif' }}>No specific recommendations configured for {eventType}.</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#173d2c]/40 dark:text-white/30">Proceed to custom service selection below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-[#173d2c]/10 bg-[#173d2c]/10 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/[0.08] dark:bg-white/[0.08]">
            {recs.sort((a, b) => a.sort_order - b.sort_order).map((rec, index) => {
              const item = rec.service_item as ServiceItem;
              if (!item) return null;
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <button type="button" key={rec.id} onClick={() => onToggleItem(item.id)} aria-pressed={isSelected} className={`group relative flex min-h-[260px] flex-col justify-between p-5 text-left transition-all duration-300 sm:p-6 ${isSelected ? "bg-[#efe3cc] dark:bg-[#25251d]" : "bg-[#f7f0e6] hover:bg-[#fffaf3] dark:bg-[#191b17] dark:hover:bg-[#1f211c]"}`}>
                  {isSelected && <span className="absolute inset-x-0 top-0 h-[2px] bg-[#a17a34] dark:bg-[#d2b56b]" />}
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2"><span className="font-heading text-sm italic text-[#a17a34]/70 dark:text-[#d2b56b]/75" style={{ fontFamily: '"Playfair Display", serif' }}>{String(index + 1).padStart(2, "0")}</span><span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#a17a34] dark:text-[#d2b56b]">{rec.badge_label || "Recommended"}</span></div>
                      <span className={`flex h-7 w-7 items-center justify-center border transition ${isSelected ? "border-[#a17a34] bg-[#a17a34] text-white dark:border-[#d2b56b] dark:bg-[#d2b56b] dark:text-[#161812]" : "border-[#173d2c]/15 text-[#173d2c]/40 group-hover:border-[#a17a34]/60 dark:border-white/15 dark:text-white/35"}`}>{isSelected ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Plus className="h-4 w-4" />}</span>
                    </div>
                    <h4 className="font-heading text-xl font-normal text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h4>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#17392b]/55 dark:text-[#eee5d7]/45">{item.description}</p>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#173d2c]/10 pt-4 dark:border-white/[0.08]">
                    <div><span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/40 dark:text-white/30">Estimated Rate</span><span className="font-heading text-xl text-[#9a742e] dark:text-[#d2b56b]" style={{ fontFamily: '"Playfair Display", serif' }}>₹{item.price?.toLocaleString("en-IN")}</span><span className="ml-1 text-[9px] text-[#173d2c]/40 dark:text-white/30">({item.pricing_unit === "per_plate" ? "Per Plate" : item.pricing_unit === "per_piece" ? "Per Piece" : "Fixed Package"})</span></div>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.16em] ${isSelected ? "text-[#9a742e] dark:text-[#d2b56b]" : "text-[#173d2c]/35 dark:text-white/25"}`}>{isSelected ? "Selected" : "Click to Add"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}