"use client";

import React, { useState } from "react";
import { EventPart } from "@/lib/types";
import { Check, Sparkles, MapPin, Calendar, Clock, Utensils, Music, Camera, Palette, UserCheck, Flame, Sliders } from "lucide-react";

export interface SubEventDetails {
  partId: string;
  partName: string;
  venueLocation: string;
  eventDate?: string;
  startTime?: string;
  requiredServices: string[];
}

interface Props {
  eventType: string;
  availableParts: EventPart[];
  selectedPartIds: string[];
  onChange: (partIds: string[]) => void;
  subEventDetails?: Record<string, SubEventDetails>;
  onSubEventDetailsChange?: (details: Record<string, SubEventDetails>) => void;
}

const SERVICE_REQUIREMENT_OPTIONS = [
  { id: "Food & Catering", label: "Food & Catering", icon: Utensils },
  { id: "Sound & DJ", label: "Sound & DJ", icon: Music },
  { id: "Dance & Choreography", label: "Dance & Choreography", icon: Flame },
  { id: "Decor & Stage Setup", label: "Decor & Stage", icon: Palette },
  { id: "Photography & Videography", label: "Photography", icon: Camera },
  { id: "Anchoring / MC", label: "Anchoring / MC", icon: UserCheck },
  { id: "Makeup & Styling", label: "Makeup & Styling", icon: Sliders },
  { id: "Pyrotechnics", label: "Pyrotechnics / Cold Fire", icon: Sparkles },
];

const DEFAULT_SUB_EVENT_IMAGES: Record<string, string> = {
  "Haldi Ceremony": "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
  "Mehendi Celebration": "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80",
  "Sangeet & Cocktail Night": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  "Pellikuthuru / Pellikoduku": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  "Muhurtham & Varmala": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
  "Grand Wedding Reception": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  "Keynote & Product Launch": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
  "Gala Dinner & Awards Night": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  "Exhibition & Dealer Meet": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  "Themed Party & Cake Cutting": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
  "DJ Dance Night": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  "Golden Milestone Celebration": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  "Griha Pravesh Puja": "https://images.unsplash.com/photo-1545232979-fbf4dce9d533?auto=format&fit=crop&w=800&q=80",
  "Rooftop Get-Together": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
};

export default function EventPartsStep({
  eventType,
  availableParts,
  selectedPartIds,
  onChange,
  subEventDetails = {},
  onSubEventDetailsChange,
}: Props) {
  const parts = React.useMemo(() => {
    const rawParts = availableParts.filter(
      (p) => p.event_type?.toLowerCase() === eventType?.toLowerCase() && p.is_active
    );

    // Map to identify root ceremony key (e.g. 'haldi', 'mehendi', 'sangeet', 'reception', 'muhurtham')
    const getRootKey = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes("haldi")) return "haldi";
      if (lower.includes("mehendi") || lower.includes("mehndi")) return "mehendi";
      if (lower.includes("sangeet")) return "sangeet";
      if (lower.includes("reception")) return "reception";
      if (lower.includes("muhurtham") || lower.includes("varmala")) return "muhurtham";
      if (lower.includes("pellikuthuru") || lower.includes("pellikoduku")) return "pellikuthuru";
      if (lower.includes("engagement")) return "engagement";
      if (lower.includes("keynote") || lower.includes("launch")) return "keynote";
      if (lower.includes("gala")) return "gala";
      if (lower.includes("puja") || lower.includes("pooja")) return "puja";
      return lower.trim();
    };

    const bestMap = new Map<string, EventPart>();

    for (const part of rawParts) {
      const rootKey = getRootKey(part.name);
      const existing = bestMap.get(rootKey);

      if (!existing) {
        bestMap.set(rootKey, part);
      } else {
        // Prefer item with cover_image_url or longer descriptive name
        if ((part.cover_image_url && !existing.cover_image_url) || part.name.length > existing.name.length) {
          bestMap.set(rootKey, part);
        }
      }
    }

    return Array.from(bestMap.values());
  }, [availableParts, eventType]);

  const [expandedPartId, setExpandedPartId] = useState<string | null>(
    selectedPartIds.length > 0 ? selectedPartIds[selectedPartIds.length - 1] : null
  );

  const togglePart = (part: EventPart) => {
    const isSelected = selectedPartIds.includes(part.id);
    let updatedIds: string[];
    if (isSelected) {
      updatedIds = selectedPartIds.filter((pId) => pId !== part.id);
      if (expandedPartId === part.id) {
        const remaining = updatedIds;
        setExpandedPartId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
      }
    } else {
      updatedIds = [...selectedPartIds, part.id];
      // Focus drawer on newly selected card exclusively
      setExpandedPartId(part.id);
    }
    onChange(updatedIds);

    if (onSubEventDetailsChange && !isSelected) {
      if (!subEventDetails[part.id]) {
        onSubEventDetailsChange({
          ...subEventDetails,
          [part.id]: {
            partId: part.id,
            partName: part.name,
            venueLocation: "",
            requiredServices: ["Decor & Stage Setup", "Food & Catering"],
          },
        });
      }
    }
  };

  const updateSubEventLocation = (partId: string, location: string) => {
    if (!onSubEventDetailsChange) return;
    const current = subEventDetails[partId] || {
      partId,
      partName: parts.find((p) => p.id === partId)?.name || "Sub Event",
      venueLocation: "",
      requiredServices: [],
    };
    onSubEventDetailsChange({
      ...subEventDetails,
      [partId]: { ...current, venueLocation: location },
    });
  };

  const toggleSubEventService = (partId: string, serviceId: string) => {
    if (!onSubEventDetailsChange) return;
    const current = subEventDetails[partId] || {
      partId,
      partName: parts.find((p) => p.id === partId)?.name || "Sub Event",
      venueLocation: "",
      requiredServices: [],
    };
    const services = current.requiredServices || [];
    const updatedServices = services.includes(serviceId)
      ? services.filter((s) => s !== serviceId)
      : [...services, serviceId];

    onSubEventDetailsChange({
      ...subEventDetails,
      [partId]: { ...current, requiredServices: updatedServices },
    });
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
              Select Sub-Events <span className="italic text-[#9a742e] dark:text-[#d2b56b]">& Function Locations</span>
            </h3>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55">
              Select ceremonies for your <strong>{eventType}</strong>. For each selected sub-event, specify its venue location and required service modules.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parts.sort((a, b) => a.sort_order - b.sort_order).map((part, index) => {
              const isSelected = selectedPartIds.includes(part.id);
              const imageUrl = part.cover_image_url || DEFAULT_SUB_EVENT_IMAGES[part.name] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";
              const currentDetails = subEventDetails[part.id] || { venueLocation: "", requiredServices: [] };

              return (
                <div
                  key={part.id}
                  className={`border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-[#a17a34] bg-[#fbf7f0] dark:bg-[#191b17] shadow-lg ring-1 ring-[#a17a34]/30"
                      : "border-[#173d2c]/12 bg-[#fffaf3]/80 hover:border-[#a17a34]/50 dark:border-white/10 dark:bg-[#121410]"
                  }`}
                >
                  {/* Card Header & Visual Image Thumbnail (Mandatory) */}
                  <div
                    onClick={() => togglePart(part)}
                    className="relative h-44 cursor-pointer overflow-hidden group select-none"
                  >
                    <img
                      src={imageUrl}
                      alt={part.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white font-heading italic text-xs font-bold border border-white/20" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Function #{String(index + 1).padStart(2, "0")}
                      </span>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-[#a17a34] text-black border-[#a17a34] shadow-md"
                          : "bg-black/40 text-white border-white/30 group-hover:border-white"
                      }`}>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
                      <h4 className="font-heading text-xl text-white font-normal drop-shadow-sm" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {part.name}
                      </h4>
                      {part.description && (
                        <p className="text-[11px] text-white/80 line-clamp-1 font-light">
                          {part.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Configuration Drawer Header Toggle */}
                  {isSelected && (
                    <div className="px-4 py-2 bg-[#173d2c]/5 dark:bg-white/[0.02] border-t border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPartId(expandedPartId === part.id ? null : part.id);
                        }}
                        className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a17a34] dark:text-[#d2b56b] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{expandedPartId === part.id ? "Hide Location & Modules ▲" : "Configure Location & Modules ▼"}</span>
                      </button>
                      <span className="text-[9px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono font-semibold">
                        {currentDetails.venueLocation ? "✓ Configured" : "Location Required"}
                      </span>
                    </div>
                  )}

                  {/* Per-Sub-Event Configuration Drawer (Opens exclusively for active card) */}
                  {isSelected && expandedPartId === part.id && (
                    <div className="p-5 space-y-4 border-t border-[#a17a34]/30 bg-[#f8f2e9]/70 dark:bg-black/20 animate-fade-in">
                      {/* Venue Location for this Sub-Event */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-[#143d2b] dark:text-[#f0e8db] uppercase text-[9.5px] tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                          <span>Venue / Location for {part.name} *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={currentDetails.venueLocation || ""}
                          onChange={(e) => updateSubEventLocation(part.id, e.target.value)}
                          placeholder={`e.g. Home Lawn / Hotel Banquet / ${eventType} Hall`}
                          className="w-full px-3 py-2 border border-[#a17a34]/40 bg-[#fffaf3] dark:border-white/10 dark:bg-[#11130f] text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono focus:outline-none focus:border-[#a17a34]"
                        />
                      </div>

                      {/* Required Services Selection for this Sub-Event */}
                      <div className="space-y-2">
                        <label className="block font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50 uppercase text-[9.5px] tracking-wider">
                          Select Required Modules for {part.name}:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SERVICE_REQUIREMENT_OPTIONS.map((srv) => {
                            const isSrvChecked = (currentDetails.requiredServices || []).includes(srv.id);
                            const Icon = srv.icon;
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => toggleSubEventService(part.id, srv.id)}
                                className={`px-2.5 py-1.5 border text-[10px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                  isSrvChecked
                                    ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] border-transparent font-bold"
                                    : "bg-[#fffaf3] dark:bg-white/[0.03] border-[#173d2c]/15 text-[#173d2c]/70 dark:text-[#eee5d7]/60 hover:border-[#a17a34]"
                                }`}
                              >
                                <Icon className="w-3 h-3 shrink-0" />
                                <span className="truncate">{srv.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}