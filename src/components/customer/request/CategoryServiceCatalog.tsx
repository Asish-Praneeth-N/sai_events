"use client";

import React, { useState, useEffect, useRef } from "react";
import { Category, ServiceItem } from "@/lib/types";
import { Sparkles, Check, Plus, Minus, Layers, ArrowRight } from "lucide-react";

interface Props {
  categories: Category[];
  items: ServiceItem[];
  selectedItems: { serviceItemId: string; quantity: number }[];
  onToggleItem: (itemId: string) => void;
  onQuantityChange: (itemId: string, delta: number) => void;
  grandTotal: number;
}

export default function CategoryServiceCatalog({
  categories,
  items,
  selectedItems,
  onToggleItem,
  onQuantityChange,
  grandTotal,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef<boolean>(false);

  const MASTER_CATEGORIES = [
    {
      id: "cat-stage-decor",
      name: "Stage & Mandap Decor",
      description: "Royal stage backdrops, floral mandaps, lotus arches & luxury seating",
      keywords: ["mandap", "stage", "arch", "floral", "curtain", "sofa", "aisle", "backdrop", "canopy", "decor", "single"]
    },
    {
      id: "cat-sound-lighting",
      name: "Sound, Lighting & DJ Console",
      description: "Concert trussing, line-array acoustics, intelligent beam lights & DJ setups",
      keywords: ["truss", "box truss", "cage", "sound", "light", "dj", "beam", "audio", "speaker", "par", "led"]
    },
    {
      id: "cat-live-entertainment",
      name: "Entertainment & Live Experience",
      description: "360 photo booth, VR simulation, CO2 blasters & live performance acts",
      keywords: ["360", "vr", "photo", "pyro", "co2", "band", "singer", "performance", "anchor", "mc"]
    },
    {
      id: "cat-games-fun",
      name: "Games, Rides & Fun Stalls",
      description: "Inflatable rides, interactive arcade games, VR rides & traditional stalls",
      keywords: ["ride", "river ride", "tic tac toe", "game", "stall", "bangle", "henna", "play", "fun"]
    },
    {
      id: "cat-logistics-furniture",
      name: "Logistics & Venue Setup",
      description: "Banquet seating, VIP furniture, generator backup & LED backdrop walls",
      keywords: ["table", "chair", "generator", "power", "backup", "screen", "led wall", "setup", "logistics"]
    }
  ];

  // Resolve grouped categories smartly
  const groupedItems = React.useMemo(() => {
    // Check if we have multiple valid categories from props
    const validDbGroups = categories
      .map((cat) => ({
        category: cat,
        items: items.filter((item) => item.category_id === cat.id),
      }))
      .filter((group) => group.items.length > 0);

    if (validDbGroups.length > 1) {
      const uncategorized = items.filter((item) => !categories.some((c) => c.id === item.category_id));
      if (uncategorized.length > 0) {
        validDbGroups.push({
          category: { id: "cat-additional", name: "Additional Event Services", description: "Specialized event execution items" } as Category,
          items: uncategorized,
        });
      }
      return validDbGroups;
    }

    // Otherwise, classify items smartly using keyword matching rules
    const categoryMap: Record<string, { category: Category; items: ServiceItem[] }> = {};

    MASTER_CATEGORIES.forEach((m) => {
      categoryMap[m.id] = {
        category: { id: m.id, name: m.name, description: m.description } as Category,
        items: [],
      };
    });

    const unassignedItems: ServiceItem[] = [];

    items.forEach((item) => {
      const lowerName = (item.name || "").toLowerCase();
      const lowerDesc = (item.description || "").toLowerCase();
      const combined = `${lowerName} ${lowerDesc}`;

      let matched = false;
      for (const master of MASTER_CATEGORIES) {
        if (master.keywords.some((kw) => combined.includes(kw))) {
          categoryMap[master.id].items.push(item);
          matched = true;
          break;
        }
      }

      if (!matched) {
        unassignedItems.push(item);
      }
    });

    const result = MASTER_CATEGORIES.map((m) => categoryMap[m.id]).filter((g) => g.items.length > 0);

    if (unassignedItems.length > 0) {
      result.push({
        category: { id: "cat-additional", name: "Additional Execution Services", description: "Specialized event execution items" } as Category,
        items: unassignedItems,
      });
    }

    return result;
  }, [categories, items]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => groupedItems[0]?.category?.id || ""
  );

  // ScrollSpy Implementation with IntersectionObserver
  useEffect(() => {
    let isMounted = true;
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionElements = container.querySelectorAll<HTMLElement>("[data-category-section]");

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickScrolling.current || !isMounted) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const catId = entry.target.getAttribute("data-category-id");
          if (catId && isMounted) {
            setActiveCategoryId(catId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: container,
      rootMargin: "-10% 0px -60% 0px",
      threshold: 0.1,
    });

    sectionElements.forEach((el: Element) => observer.observe(el));

    return () => {
      isMounted = false;
      sectionElements.forEach((el: Element) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [groupedItems]);

  const scrollToCategory = (catId: string) => {
    setActiveCategoryId(catId);
    isClickScrolling.current = true;
    const targetElement = document.getElementById(`cat-section-${catId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Interactive Service Catalog</span>
          </div>
          <h3 className="text-xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
            Design, Decor & Execution Services
          </h3>
          <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light">
            Scroll or select categories on the left sidebar to explore services.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Estimated Services Total</span>
          <span className="text-xl font-bold font-mono text-[#a17a34] dark:text-[#d2b56b]">₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Main 2-Column ScrollSpy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Sticky Category Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-4 shadow-sm space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none">
          <div className="pb-2 border-b border-[#173d2c]/10 dark:border-white/[0.08] mb-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Service Categories ({groupedItems.length})
            </span>
          </div>

          <div className="space-y-1">
            {groupedItems.map((group) => {
              const cat = group.category;
              const isActive = activeCategoryId === cat.id;
              const selectedCount = group.items.filter((item) => selectedItems.some((s) => s.serviceItemId === item.id)).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full text-left px-3.5 py-3 transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
                    isActive
                      ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] border-transparent font-bold shadow-md"
                      : "bg-[#fffaf3]/60 dark:bg-white/[0.02] border-[#173d2c]/08 dark:border-white/05 text-[#173d2c]/75 dark:text-[#eee5d7]/70 hover:bg-[#efe3cc] dark:hover:bg-[#25251d]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      isActive ? "bg-[#a17a34] dark:bg-[#161812] scale-125" : "bg-[#173d2c]/30 dark:bg-white/20 group-hover:scale-110"
                    }`} />
                    <span className="text-xs font-heading tracking-wide truncate" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {cat.name}
                    </span>
                  </div>

                  {selectedCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                      isActive ? "bg-white/20 dark:bg-black/20 text-current" : "bg-[#a17a34]/15 text-[#a17a34] dark:text-[#d2b56b]"
                    }`}>
                      {selectedCount} Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Category Items Scroll Pane */}
        <main
          ref={scrollContainerRef}
          className="lg:col-span-8 space-y-10 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-none scroll-smooth"
        >
          {groupedItems.map((group) => {
            const cat = group.category;

            return (
              <section
                key={cat.id}
                id={`cat-section-${cat.id}`}
                data-category-section="true"
                data-category-id={cat.id}
                className="space-y-4 pt-2 scroll-mt-28 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-8 last:border-b-0"
              >
                {/* Category Section Header */}
                <div className="flex items-center justify-between bg-[#efe3cc]/50 dark:bg-[#25251d]/50 p-3.5 border-l-4 border-[#a17a34] dark:border-[#d2b56b]">
                  <div>
                    <h4 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {cat.name}
                    </h4>
                    {cat.description && (
                      <p className="text-[11px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light mt-0.5">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a742e] dark:text-[#d2b56b] font-mono">
                    {group.items.length} Options
                  </span>
                </div>

                {/* Items Grid for this Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.items.map((item) => {
                    const isSelected = selectedItems.some((s) => s.serviceItemId === item.id);
                    const selObj = selectedItems.find((s) => s.serviceItemId === item.id);
                    const mediaUrl = (item as any).service_item_media?.[0]?.media_url;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border transition duration-200 flex flex-col justify-between gap-3 shadow-sm ${
                          isSelected
                            ? "bg-[#fbf7f0] dark:bg-[#161813] border-[#a17a34] dark:border-[#d2b56b] ring-1 ring-[#a17a34]/30"
                            : "bg-[#fbf7f0] dark:bg-[#161813] border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Visual Cover Image */}
                        <img
                          src={
                            mediaUrl ||
                            (item.name.toLowerCase().includes("truss") ? "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("cage") ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("vr") ? "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("ride") ? "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("tac") ? "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("360") ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80" :
                             item.name.toLowerCase().includes("dj") ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80" :
                             "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80")
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover border border-[#173d2c]/10 dark:border-white/[0.08] shrink-0"
                        />
                          <div className="space-y-1">
                            <h5 className="font-normal font-heading text-base text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                              {item.name}
                            </h5>
                            <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 line-clamp-2 font-light">{item.description}</p>
                            <div className="text-xs font-mono font-bold text-[#a17a34] dark:text-[#d2b56b] pt-0.5">
                              ₹{Number(item.price).toLocaleString("en-IN")}{" "}
                              <span className="text-[10px] text-[#173d2c]/40 dark:text-white/30 font-normal">
                                / {item.pricing_unit || item.pricing_type}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => onToggleItem(item.id)}
                            className={`px-3.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] transition cursor-pointer ${
                              isSelected
                                ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812]"
                                : "border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:border-[#a17a34]/40"
                            }`}
                          >
                            {isSelected ? "✓ Selected" : "+ Add Service"}
                          </button>

                          {isSelected && (
                            <div className="flex items-center gap-2 border border-[#173d2c]/15 dark:border-white/[0.10] bg-[#f3eadf]/40 dark:bg-white/[0.02] px-2 py-1">
                              <button
                                type="button"
                                onClick={() => onQuantityChange(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-[#173d2c]/60 dark:text-[#eee5d7]/50 hover:text-[#143d2b] text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold">{selObj?.quantity || 1}</span>
                              <button
                                type="button"
                                onClick={() => onQuantityChange(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-[#173d2c]/60 dark:text-[#eee5d7]/50 hover:text-[#143d2b] text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
