"use client";

import React, { useState } from "react";
import { Recommendation, ServiceItem, EventPart } from "@/lib/types";
import { Sparkles, Check, Plus, ArrowRight, ShieldCheck, Tag, Award, CheckCircle2 } from "lucide-react";

export interface SubEventPackage {
  id: string;
  subEventName: string;
  packageName: string;
  badgeLabel: string;
  price: number;
  description: string;
  coverImage: string;
  includes: string[];
}

interface Props {
  eventType: string;
  recommendations: Recommendation[];
  selectedItemIds: string[];
  selectedPartIds?: string[];
  availableParts?: EventPart[];
  onToggleItem: (itemId: string) => void;
  onApplyAll: (itemIds: string[]) => void;
}

// Curated 3 Packages Per Sub-Event Default Recommendations Seed
const DEFAULT_SUB_EVENT_PACKAGES: Record<string, SubEventPackage[]> = {
  "Haldi Ceremony": [
    {
      id: "haldi-pkg-1",
      subEventName: "Haldi Ceremony",
      packageName: "Haldi Floral Splash Essential",
      badgeLabel: "Essential Vibe",
      price: 35000,
      description: "Bright marigold arch, traditional brass thali setup, haldi tubs & ambient seating",
      coverImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
      includes: ["Marigold Flower Backdrop", "Haldi Brass Vessels", "Folk Music Speaker System", "20 Floor Cushions"]
    },
    {
      id: "haldi-pkg-[#a17a34]",
      subEventName: "Haldi Ceremony",
      packageName: "Haldi Royal Marigold Deluxe",
      badgeLabel: "SAI Recommended",
      price: 65000,
      description: "Full floral canopy mandap, yellow drapes, flower shower cannon, dhol play & VIP lounge",
      coverImage: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80",
      includes: ["Floral Canopy Mandap", "Flower Shower Cannon", "Live Dhol Beats (2 Artists)", "VIP Lounge Seating"]
    },
    {
      id: "haldi-pkg-3",
      subEventName: "Haldi Ceremony",
      packageName: "Haldi Grand Extravaganza",
      badgeLabel: "Luxury Package",
      price: 115000,
      description: "Opulent garden transformation, hydraulic flower shower, DJ, live beverage counter & photography",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      includes: ["Opulent Garden Setup", "Hydraulic Flower Shower", "DJ & Sound System", "Full Day Photo/Video Team"]
    }
  ],
  "Mehendi Celebration": [
    {
      id: "mehendi-pkg-1",
      subEventName: "Mehendi Celebration",
      packageName: "Boho Mehendi Cozy Lounge",
      badgeLabel: "Cozy Boho",
      price: 40000,
      description: "Colorful dupatta canopy, low seating charpai lounge & floral photo booth",
      coverImage: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80",
      includes: ["Dupatta Canopy Lounge", "Charpai Cushion Seating", "Floral Photo Arch", "Henna Artist Desk"]
    },
    {
      id: "mehendi-pkg-2",
      subEventName: "Mehendi Celebration",
      packageName: "Rajasthani Folk Mehendi Gala",
      badgeLabel: "Popular Choice",
      price: 75000,
      description: "Rajasthani puppet decor, live bangle maker, kalbelia dancers & henna bar",
      coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
      includes: ["Rajasthani Theme Decor", "Live Bangle Maker", "Folk Dance Troupe", "6 Henna Artists"]
    },
    {
      id: "mehendi-pkg-3",
      subEventName: "Mehendi Celebration",
      packageName: "Mehendi Carnival Extravaganza",
      badgeLabel: "Premium Celebration",
      price: 135000,
      description: "Carnival food stalls, live acoustic singer, premium henna bar & LED photo booth",
      coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      includes: ["Carnival Food Counters", "Live Acoustic Singer", "Interactive Photo Booth", "8 Henna Artists"]
    }
  ],
  "Sangeet & Cocktail Night": [
    {
      id: "sangeet-pkg-1",
      subEventName: "Sangeet & Cocktail Night",
      packageName: "Sangeet Club Night Essential",
      badgeLabel: "Club Vibe",
      price: 55000,
      description: "Truss lighting, DJ console, acrylic dance floor & bar counter decor",
      coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
      includes: ["LED Truss Lighting", "DJ Console & Sound", "Acrylic Dance Floor", "Bar Counter Backdrop"]
    },
    {
      id: "sangeet-pkg-2",
      subEventName: "Sangeet & Cocktail Night",
      packageName: "Sangeet Starry Glamour Night",
      badgeLabel: "Most Preferred",
      price: 98000,
      description: "P10 LED screen backdrop, choreographer rehearsal package, cold pyros & celebrity anchor",
      coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      includes: ["P10 LED Wall Backdrop", "Choreography Rehearsals", "Cold Pyro Fountains", "Professional MC / Anchor"]
    },
    {
      id: "sangeet-pkg-3",
      subEventName: "Sangeet & Cocktail Night",
      packageName: "Sangeet & Cocktail Concert Gala",
      badgeLabel: "Ultra Deluxe",
      price: 185000,
      description: "Concert line-array sound, live fusion band, CO2 jets, VIP cocktail lounge & cinematic video",
      coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
      includes: ["Line-Array Concert Sound", "Live Fusion Band", "CO2 Blast & Pyros", "Cinematic Multi-Cam Video"]
    }
  ],
  "Grand Wedding Reception": [
    {
      id: "reception-pkg-1",
      subEventName: "Grand Wedding Reception",
      packageName: "Royal Banquet Elegance",
      badgeLabel: "Classic Royal",
      price: 75000,
      description: "Royal couple stage backdrop, velvet sofa, floral aisle entry & banquet chair covers",
      coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      includes: ["Royal Stage Backdrop", "Velvet Couple Sofa", "Floral Aisle Entry", "Banquet Seating Decor"]
    },
    {
      id: "reception-pkg-2",
      subEventName: "Grand Wedding Reception",
      packageName: "Crystal Chandelier Grand Reception",
      badgeLabel: "Top Recommendation",
      price: 145000,
      description: "Crystal chandelier ceiling canopy, mirror aisle, live string quartet & VIP buffet setup",
      coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      includes: ["Crystal Chandelier Canopy", "Mirror Aisle Walkway", "Live Symphony Quartet", "Gourmet Buffet Decor"]
    },
    {
      id: "reception-pkg-3",
      subEventName: "Grand Wedding Reception",
      packageName: "Imperial Palace Reception Gala",
      badgeLabel: "Palace Extravaganza",
      price: 250000,
      description: "3D architectural stage, orchid flower ceiling, 360 photo booth & live celebrity singer",
      coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
      includes: ["3D Palace Stage Setup", "Imported Orchid Ceiling", "360 Video Spinner", "Celebrity Singer Performance"]
    }
  ]
};

export default function RecommendationsStep({
  eventType,
  recommendations,
  selectedItemIds,
  selectedPartIds = [],
  availableParts = [],
  onToggleItem,
  onApplyAll,
}: Props) {
  const [selectedSubEventPkgs, setSelectedSubEventPkgs] = useState<Record<string, string>>({});

  // Resolve active selected parts with smart fallbacks
  const activeSelectedParts = React.useMemo(() => {
    let partsForType = availableParts.filter(
      (p) => p.event_type?.toLowerCase() === eventType?.toLowerCase() && p.is_active
    );

    // Deduplicate by root ceremony key
    const getRootKey = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes("haldi")) return "haldi";
      if (lower.includes("mehendi") || lower.includes("mehndi")) return "mehendi";
      if (lower.includes("sangeet")) return "sangeet";
      if (lower.includes("reception")) return "reception";
      if (lower.includes("muhurtham") || lower.includes("varmala")) return "muhurtham";
      if (lower.includes("pellikuthuru") || lower.includes("pellikoduku")) return "pellikuthuru";
      if (lower.includes("engagement")) return "engagement";
      return lower.trim();
    };

    const bestMap = new Map<string, EventPart>();
    for (const p of partsForType) {
      const key = getRootKey(p.name);
      if (!bestMap.has(key)) bestMap.set(key, p);
    }

    let resolved = Array.from(bestMap.values());

    // If customer selected specific sub-events in Step 2, filter by selected IDs
    if (selectedPartIds && selectedPartIds.length > 0) {
      const selectedSubset = resolved.filter((p) => selectedPartIds.includes(p.id));
      if (selectedSubset.length > 0) return selectedSubset;
    }

    // Default fallback: Always display recommendations for main sub-events if no specific selection was made
    return resolved.length > 0
      ? resolved
      : [
          { id: "def-haldi", event_type: eventType, name: "Haldi Ceremony", description: "", sort_order: 1, is_active: true } as EventPart,
          { id: "def-mehendi", event_type: eventType, name: "Mehendi Celebration", description: "", sort_order: 2, is_active: true } as EventPart,
          { id: "def-sangeet", event_type: eventType, name: "Sangeet & Cocktail Night", description: "", sort_order: 3, is_active: true } as EventPart,
          { id: "def-reception", event_type: eventType, name: "Grand Wedding Reception", description: "", sort_order: 4, is_active: true } as EventPart,
        ];
  }, [availableParts, eventType, selectedPartIds]);

  const toggleSubPkg = (subEventName: string, pkgId: string) => {
    setSelectedSubEventPkgs((prev) => ({
      ...prev,
      [subEventName]: prev[subEventName] === pkgId ? "" : pkgId,
    }));
  };

  const recs = recommendations.filter((r) => r.event_type === eventType && r.is_active && r.service_item);
  const allRecItemIds = recs.map((r) => r.service_item_id);
  const isAllSelected = allRecItemIds.length > 0 && allRecItemIds.every((id) => selectedItemIds.includes(id));

  return (
    <section className="animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.08]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#a17a34]/50" />
              <Sparkles className="h-3.5 w-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#173d2c]/55 dark:text-[#d9c88d]/70">
                Curated Expert Bundles
              </span>
            </div>
            <h3 className="font-heading text-2xl font-normal tracking-[-0.025em] text-[#143d2b] sm:text-3xl dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Sub-Event <span className="italic text-[#9a742e] dark:text-[#d2b56b]">Recommended Packages</span>
            </h3>
            <p className="mt-2 text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55">
              Review 3 curated packages per selected ceremony for your {eventType}. Select a package tier for each function or proceed to custom services.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION A: 3 PACKAGES PER SELECTED SUB-EVENT ── */}
      {activeSelectedParts.length > 0 ? (
        <div className="space-y-10">
          {activeSelectedParts.map((part) => {
            const subName = part.name;
            const packages = DEFAULT_SUB_EVENT_PACKAGES[subName] || [
              {
                id: `${part.id}-pkg-1`,
                subEventName: subName,
                packageName: `${subName} Essential Package`,
                badgeLabel: "Essential",
                price: 35000,
                description: `Standard traditional staging, decor backdrop & lighting for ${subName}.`,
                coverImage: part.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
                includes: ["Backdrop Setup", "Function Seating", "Basic Lighting", "Sound System"]
              },
              {
                id: `${part.id}-pkg-2`,
                subEventName: subName,
                packageName: `${subName} Royal Deluxe Package`,
                badgeLabel: "SAI Recommended",
                price: 68000,
                description: `Royal floral mandap, entrance arch, sound & LED lighting for ${subName}.`,
                coverImage: part.cover_image_url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
                includes: ["Royal Mandap / Stage", "Floral Entrance Arch", "Professional Sound & DJ", "VIP Lounge"]
              },
              {
                id: `${part.id}-pkg-3`,
                subEventName: subName,
                packageName: `${subName} Grand Extravaganza Package`,
                badgeLabel: "Luxury Tier",
                price: 125000,
                description: `Luxury venue transformation, pyros, live music, full photo/video team for ${subName}.`,
                coverImage: part.cover_image_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
                includes: ["Full Venue Decor", "Pyrotechnics & Cold Pyro", "Live Performance Team", "Full Photo/Video Team"]
              }
            ];

            const activeChosenId = selectedSubEventPkgs[subName];

            return (
              <div key={part.id} className="space-y-4 border-b border-[#173d2c]/10 pb-8 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#a17a34] dark:bg-[#d2b56b]" />
                  <h4 className="text-lg font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                    Recommendations for <span className="font-semibold text-[#9a742e] dark:text-[#d2b56b]">{subName}</span>
                  </h4>
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
                    (3 Curated Tiers Available)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg) => {
                    const isChosen = activeChosenId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        className={`p-5 border transition-all duration-300 flex flex-col justify-between shadow-sm relative overflow-hidden ${
                          isChosen
                            ? "bg-[#efe3cc] dark:bg-[#25251d] border-[#a17a34] dark:border-[#d2b56b] ring-2 ring-[#a17a34]/30"
                            : "bg-[#f7f0e6] dark:bg-[#191b17] border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="relative h-32 overflow-hidden -mx-5 -mt-5 mb-4 group">
                            <img src={pkg.coverImage} alt={pkg.packageName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#a17a34] text-black text-[8px] font-bold uppercase tracking-widest">
                              {pkg.badgeLabel}
                            </span>
                            <span className="absolute bottom-2 right-2.5 font-mono text-sm font-bold text-white bg-black/70 px-2 py-0.5">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <h5 className="font-heading text-base text-[#143d2b] dark:text-[#f0e8db] font-normal leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {pkg.packageName}
                          </h5>

                          <p className="text-[11px] text-[#173d2c]/65 dark:text-[#eee5d7]/55 leading-relaxed font-light">
                            {pkg.description}
                          </p>

                          <div className="pt-2 space-y-1">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-[#9a742e] dark:text-[#d2b56b] block">Package Inclusions:</span>
                            <div className="space-y-1">
                              {pkg.includes.map((inc, iIdx) => (
                                <div key={iIdx} className="flex items-center gap-1.5 text-[10px] text-[#173d2c]/75 dark:text-[#eee5d7]/70 font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                                  <span>{inc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => toggleSubPkg(subName, pkg.id)}
                            className={`w-full py-2.5 text-[8.5px] font-bold uppercase tracking-[0.2em] transition cursor-pointer flex items-center justify-center gap-2 ${
                              isChosen
                                ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812]"
                                : "border border-[#173d2c]/20 text-[#173d2c] dark:border-white/20 dark:text-[#f0e8db] hover:bg-[#143d2b] hover:text-white dark:hover:bg-[#d2b56b] dark:hover:text-black"
                            }`}
                          >
                            <span>{isChosen ? "Selected Package Tier" : "Select This Package"}</span>
                            {isChosen && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback standard recommendations if no sub-events selected */
        <div>
          {recs.length === 0 ? (
            <div className="border border-dashed border-[#173d2c]/15 bg-[#fffaf3]/55 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <p className="font-heading text-lg italic text-[#173d2c]/65 dark:text-[#eee5d7]/60" style={{ fontFamily: '"Playfair Display", serif' }}>
                No specific recommendations configured for {eventType}.
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#173d2c]/40 dark:text-white/30">
                Proceed to custom service selection below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recs.map((rec, index) => {
                const item = rec.service_item as ServiceItem;
                if (!item) return null;
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <button
                    type="button"
                    key={rec.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`group relative flex min-h-[240px] flex-col justify-between p-5 text-left transition-all duration-300 ${
                      isSelected
                        ? "bg-[#efe3cc] dark:bg-[#25251d] border border-[#a17a34]"
                        : "bg-[#f7f0e6] hover:bg-[#fffaf3] dark:bg-[#191b17] dark:hover:bg-[#1f211c] border border-[#173d2c]/10"
                    }`}
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#a17a34] dark:text-[#d2b56b]">
                          {rec.badge_label || "Recommended"}
                        </span>
                        <span className={`flex h-6 w-6 items-center justify-center border ${isSelected ? "bg-[#a17a34] text-white" : "border-[#173d2c]/20"}`}>
                          {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                      <h4 className="font-heading text-lg text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-[#17392b]/55 dark:text-[#eee5d7]/45 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#173d2c]/10 flex justify-between items-center">
                      <span className="font-mono text-sm font-bold text-[#9a742e]">₹{item.price?.toLocaleString("en-IN")}</span>
                      <span className="text-[9px] uppercase font-bold">{isSelected ? "Selected" : "Add"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}