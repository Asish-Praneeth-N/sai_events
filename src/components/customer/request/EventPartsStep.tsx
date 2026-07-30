"use client";

import React from "react";
import { EventPart } from "@/lib/types";
import { Check } from "lucide-react";

interface Props {
  eventType: string;
  availableParts: EventPart[];
  selectedPartIds: string[];
  onChange: (partIds: string[]) => void;
}

export default function EventPartsStep({
  eventType,
  availableParts,
  selectedPartIds,
  onChange,
}: Props) {
  const parts = availableParts.filter((p) => p.event_type === eventType && p.is_active);

  const togglePart = (id: string) => {
    if (selectedPartIds.includes(id)) {
      onChange(selectedPartIds.filter((pId) => pId !== id));
    } else {
      onChange([...selectedPartIds, id]);
    }
  };

  const selectAll = () => {
    onChange(parts.map((p) => p.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-foreground">Select Sub-Events / Event Parts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Which ceremonies or occasions are part of your {eventType}? Select all that apply.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border text-foreground text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border text-muted-foreground hover:text-foreground text-xs rounded-lg transition cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {parts.length === 0 ? (
        <div className="p-8 bg-surface border border-border rounded-2xl text-center text-muted-foreground text-xs">
          No specific sub-events listed for {eventType}. You can proceed to recommendations and service selections.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {parts
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((part) => {
              const isSelected = selectedPartIds.includes(part.id);
              return (
                <div
                  key={part.id}
                  onClick={() => togglePart(part.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-accent-gold/10 border-accent-gold shadow-lg shadow-accent-gold/5"
                      : "bg-surface hover:bg-surface-raised border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-sm text-foreground">{part.name}</h4>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected ? "bg-accent-gold border-accent-gold text-black" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  {part.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{part.description}</p>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
