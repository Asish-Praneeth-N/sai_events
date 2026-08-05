"use client";

import React from "react";
import { EventPart } from "@/lib/types";
import { Check, Sparkles } from "lucide-react";

interface Props {
  eventType: string;
  availableParts: EventPart[];
  selectedPartIds: string[];
  onChange: (partIds: string[]) => void;
}

export default function EventPartsStep({ eventType, availableParts, selectedPartIds, onChange }: Props) {
  const parts = availableParts.filter((p) => p.event_type === eventType && p.is_active);

  const togglePart = (id: string) => {
    if (selectedPartIds.includes(id)) onChange(selectedPartIds.filter((pId) => pId !== id));
    else onChange([...selectedPartIds, id]);
  };

  const selectAll = () => onChange(parts.map((p) => p.id));
  const clearAll = () => onChange([]);

  return (
    <section className="animate-fade-in-up space-y-6">
      <div className="border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.08]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#a17a34]/50" />
              <Sparkles className="h-3.5 w-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#173d2c]/55 dark:text-[#d9c88d]/70">Curate the celebration</span>
            </div>
            <h3 className="font-heading text-2xl font-normal tracking-[-0.025em] text-[#143d2b] sm:text-3xl dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Select Sub-Events <span className="italic text-[#9a742e] dark:text-[#d2b56b]">& Event Parts</span>
            </h3>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55">
              Which ceremonies or occasions are part of your {eventType}? Select all that apply.
            </p>
          </div>

          <div className="flex items-center border border-[#173d2c]/12 bg-[#fffaf3]/70 p-1 dark:border-white/10 dark:bg-white/[0.025]">
            <button type="button" onClick={selectAll} className="px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#143d2b] transition hover:bg-[#143d2b] hover:text-[#fffaf1] dark:text-[#eee5d7] dark:hover:bg-[#d2b56b] dark:hover:text-[#161812]">Select All</button>
            <span className="h-6 w-px bg-[#173d2c]/10 dark:bg-white/10" />
            <button type="button" onClick={clearAll} className="px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#173d2c]/45 transition hover:text-[#9a742e] dark:text-white/40 dark:hover:text-[#d2b56b]">Clear</button>
          </div>
        </div>
      </div>

      <div>
        {parts.length === 0 ? (
          <div className="border border-dashed border-[#173d2c]/15 bg-[#fffaf3]/55 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <p className="font-heading text-lg italic text-[#173d2c]/65 dark:text-[#eee5d7]/60" style={{ fontFamily: '"Playfair Display", serif' }}>No specific sub-events listed for {eventType}.</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#173d2c]/40 dark:text-white/30">You can proceed to recommendations and service selections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-[#173d2c]/10 bg-[#173d2c]/10 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/[0.08] dark:bg-white/[0.08]">
            {parts.sort((a, b) => a.sort_order - b.sort_order).map((part, index) => {
              const isSelected = selectedPartIds.includes(part.id);
              return (
                <button
                  type="button"
                  key={part.id}
                  onClick={() => togglePart(part.id)}
                  aria-pressed={isSelected}
                  className={`group relative min-h-[150px] p-5 text-left transition-all duration-300 sm:p-6 ${isSelected ? "bg-[#efe3cc] dark:bg-[#25251d]" : "bg-[#f7f0e6] hover:bg-[#fffaf3] dark:bg-[#191b17] dark:hover:bg-[#1f211c]"}`}
                >
                  {isSelected && <span className="absolute inset-x-0 top-0 h-[2px] bg-[#a17a34] dark:bg-[#d2b56b]" />}
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-heading text-sm italic text-[#a17a34]/75 dark:text-[#d2b56b]/75" style={{ fontFamily: '"Playfair Display", serif' }}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={`flex h-6 w-6 items-center justify-center border transition-all ${isSelected ? "border-[#a17a34] bg-[#a17a34] text-[#fffaf1] dark:border-[#d2b56b] dark:bg-[#d2b56b] dark:text-[#161812]" : "border-[#173d2c]/20 text-transparent group-hover:border-[#a17a34]/60 dark:border-white/15"}`}>
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>{part.name}</h4>
                      {part.description && <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#17392b]/55 dark:text-[#eee5d7]/45">{part.description}</p>}
                    </div>
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