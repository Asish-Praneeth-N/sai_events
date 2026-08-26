"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ServiceItem } from "@/lib/types";
import { Utensils, Sun, Moon, Sparkles, Plus, Minus, Coffee, Flame, IceCream, Layers, Filter } from "lucide-react";

interface SelectedItem { serviceItemId: string; quantity: number; }
interface Props {
  guestCount: number;
  foodItems: ServiceItem[];
  selectedItems: SelectedItem[];
  onQuantityChange: (serviceItemId: string, delta: number) => void;
  onSetQuantity: (serviceItemId: string, quantity: number) => void;
}

interface MealCategoryDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const MEAL_CATEGORIES: MealCategoryDef[] = [
  { id: "breakfast", name: "Breakfast Spreads", description: "Fresh morning breakfasts, ghee dosas & traditional sweets", icon: <Sun className="w-3.5 h-3.5" /> },
  { id: "high_tea", name: "High Tea & Snacks", description: "Evening tea, live chaat counters & charcoal grilled kebabs", icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: "lunch", name: "Lunch Feast", description: "Fragrant biryanis, gravies, rotis & traditional curries", icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: "cocktail", name: "Cocktail Starters", description: "Gourmet Galouti kebabs, tandoori tiger prawns & finger bites", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "dinner", name: "Grand Dinner Banquet", description: "Royal dinner spreads, dal makhani, Mughlai gravies & naan", icon: <Moon className="w-3.5 h-3.5" /> },
  { id: "dessert", name: "Desserts & Sweets", description: "Live saffron jalebi, rabri & artisanal gelato ice-cream", icon: <IceCream className="w-3.5 h-3.5" /> },
];

const FOOD_IMAGE_MAP: Record<string, string> = {
  "00000000-0000-4000-8000-000000000101": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000102": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000103": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000104": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000105": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000106": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000107": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000108": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000109": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000110": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000111": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
  "00000000-0000-4000-8000-000000000112": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",

  "breakfast": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  "high_tea": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "lunch": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  "cocktail": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "dinner": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  "dessert": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "default_veg": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  "default_non_veg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_CATERING_ITEMS: ServiceItem[] = [
  // BREAKFAST
  {
    id: "00000000-0000-4000-8000-000000000101",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "South Indian Royal Breakfast Spread",
    description: "Steaming mini idlis, medu vada, ghee masala dosa counter, sambar & 3 artisanal chutneys",
    price: 350,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "breakfast",
    is_available: true,
    sort_order: 1
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "North Indian Halwa Poori & Amritsari Chole",
    description: "Crispy poori, bedmi aloo, amritsari chole, kesar suji halwa & kulhad lassi",
    price: 380,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "breakfast",
    is_available: true,
    sort_order: 2
  },

  // HIGH TEA & EVENING SNACKS
  {
    id: "00000000-0000-4000-8000-000000000103",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Live Street Chaat & Pani Puri Counter",
    description: "6 flavors of pani, dahi puri, raj kachori, bhel, papdi chaat & aloo tikki live station",
    price: 250,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "high_tea",
    is_available: true,
    sort_order: 3
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Amritsari Fish Tikka & Chicken Malai Seekh",
    description: "Charcoal grilled amritsari fish fingers, chicken malai seekh kabab & mint chutney",
    price: 450,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "non_veg",
    meal_type: "high_tea",
    is_available: true,
    sort_order: 4
  },

  // LUNCH FEAST
  {
    id: "00000000-0000-4000-8000-000000000105",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Royal Hyderabadi Dum Veg Biryani & Paneer Butter Masala",
    description: "Fragrant basmati dum biryani, mirchi ka salan, paneer butter masala, butter naan & raita",
    price: 550,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "lunch",
    is_available: true,
    sort_order: 5
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Authentic Hyderabadi Mutton & Chicken Dum Biryani",
    description: "Slow-cooked saffron mutton dum biryani, chicken roasted gravy, mirchi ka salan & raita",
    price: 750,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "non_veg",
    meal_type: "lunch",
    is_available: true,
    sort_order: 6
  },

  // COCKTAIL STARTERS
  {
    id: "00000000-0000-4000-8000-000000000107",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Gourmet Mushroom Galouti & Dahi Ke Kebab",
    description: "Melt-in-mouth spiced mushroom galouti on mini parathas & crispy dahi kebabs",
    price: 320,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "cocktail",
    is_available: true,
    sort_order: 7
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Tandoori Tiger Prawns & Mutton Boti Kebabs",
    description: "Jumbo tiger prawns in yellow chilli marination & smoky tandoori mutton boti kebabs",
    price: 650,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "non_veg",
    meal_type: "cocktail",
    is_available: true,
    sort_order: 8
  },

  // GRAND DINNER
  {
    id: "00000000-0000-4000-8000-000000000109",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Imperial Veg Dinner Banquet",
    description: "Dal Makhani, Kadhai Paneer, Subz Handi, Stuffed Kulcha, Jeera Rice, Rumali Roti & Salad Bar",
    price: 680,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "dinner",
    is_available: true,
    sort_order: 9
  },
  {
    id: "00000000-0000-4000-8000-000000000110",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Royal Mughlai Non-Veg Dinner Feast",
    description: "Butter Chicken, Mutton Rogan Josh, Fish Curry, Assorted Tandoori Rotis, Naan & Pulao",
    price: 880,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "non_veg",
    meal_type: "dinner",
    is_available: true,
    sort_order: 10
  },

  // DESSERTS & SWEETS
  {
    id: "00000000-0000-4000-8000-000000000111",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Live Jalebi & Rabri Counter",
    description: "Crispy saffron jalebis prepared live, served with chilled condensed milk rabri",
    price: 220,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "dessert",
    is_available: true,
    sort_order: 11
  },
  {
    id: "00000000-0000-4000-8000-000000000112",
    subcategory_id: "00000000-0000-4000-8000-000000000001",
    name: "Gourmet Gelato Ice-Cream & Gulab Jamun",
    description: "Hot gulab jamun with artisanal gelato, sundae toppings & waffle cone counter",
    price: 280,
    pricing_type: "per_plate",
    pricing_unit: "per_plate",
    food_category: "veg",
    meal_type: "dessert",
    is_available: true,
    sort_order: 12
  }
] as unknown as ServiceItem[];

export default function FoodSelectionModule({ guestCount, foodItems, selectedItems, onQuantityChange, onSetQuantity }: Props) {
  const [activeMealType, setActiveMealType] = useState<string>("breakfast");
  const [activeDietFilter, setActiveDietFilter] = useState<string>("all");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef<boolean>(false);

  const resolvedFoodItems = useMemo(() => {
    // Filter out uninformative placeholder names like "select any 3 items", "select any flaver", "chatnys", etc.
    const validPropsItems = (foodItems || []).filter((item) => {
      const lower = (item.name || "").toLowerCase();
      const descLower = (item.description || "").toLowerCase();
      const isJunk =
        lower.includes("select any") ||
        lower.includes("items") ||
        lower.includes("flaver") ||
        lower.includes("deserts") ||
        lower.includes("chatnys") ||
        lower.includes("karapodi") ||
        lower.includes("basic") ||
        descLower.includes("select any");
      return !isJunk && lower.trim().length > 3;
    });

    const existingIds = new Set(validPropsItems.map((i) => i.id));
    const merged = [...validPropsItems];
    DEFAULT_CATERING_ITEMS.forEach((item) => {
      if (!existingIds.has(item.id)) merged.push(item);
    });
    return merged;
  }, [foodItems]);

  const getItemQuantity = (id: string) => selectedItems.find((i) => i.serviceItemId === id)?.quantity || 0;
  const calculateItemTotal = (item: ServiceItem, quantity: number) => {
    if (quantity <= 0) return 0;
    const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
    if (unit === "per_plate") return item.price * guestCount * quantity;
    return item.price * quantity;
  };

  // Group items by meal category
  const groupedMealSections = useMemo(() => {
    return MEAL_CATEGORIES.map((cat) => {
      const items = resolvedFoodItems.filter((item) => {
        const itemMeal = item.meal_type || "breakfast";
        if (itemMeal !== cat.id) return false;
        if (activeDietFilter !== "all" && item.food_category !== activeDietFilter) return false;
        return true;
      });
      return { category: cat, items };
    });
  }, [resolvedFoodItems, activeDietFilter]);

  // ScrollSpy IntersectionObserver implementation
  useEffect(() => {
    let isMounted = true;
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionElements = container.querySelectorAll<HTMLElement>("[data-meal-section]");

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickScrolling.current || !isMounted) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const mealId = entry.target.getAttribute("data-meal-id");
          if (mealId && isMounted) {
            setActiveMealType(mealId);
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
  }, [groupedMealSections]);

  const scrollToMealSection = (mealId: string) => {
    setActiveMealType(mealId);
    isClickScrolling.current = true;

    const targetEl = document.getElementById(`meal-section-${mealId}`);
    if (targetEl && scrollContainerRef.current) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  let grandFoodTotal = 0;
  let vegCount = 0;
  let nonVegCount = 0;
  selectedItems.forEach((sel) => {
    const item = resolvedFoodItems.find((f) => f.id === sel.serviceItemId);
    if (item && sel.quantity > 0) {
      grandFoodTotal += calculateItemTotal(item, sel.quantity);
      if (item.food_category === "veg") vegCount += sel.quantity;
      if (item.food_category === "non_veg") nonVegCount += sel.quantity;
    }
  });

  const filterClass = (active: boolean) =>
    `flex shrink-0 items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition cursor-pointer ${
      active
        ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-sm"
        : "text-[#173d2c]/50 hover:text-[#143d2b] dark:text-white/40 dark:hover:text-[#eee5d7]"
    }`;

  return (
    <section className="animate-fade-in-up space-y-6">
      {/* Top Header & Catering Metrics */}
      <div className="border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.08]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#173d2c]/55 dark:text-[#d9c88d]/70">
                Gourmet Culinary Feasts
              </span>
            </div>
            <h3 className="font-heading text-2xl font-normal tracking-[-0.025em] text-[#143d2b] sm:text-3xl dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Food & <span className="italic text-[#9a742e] dark:text-[#d2b56b]">Catering Engine</span>
            </h3>
            <p className="mt-2 text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55 font-light">
              Scroll or select meal categories on the left sidebar to explore gourmet spreads for <strong className="font-semibold text-[#9a742e] dark:text-[#d2b56b]">{guestCount} guests</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-[#173d2c]/10 bg-[#fffaf3]/55 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="px-4 py-3">
              <span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">🌱 Pure Veg</span>
              <span className="mt-1 block font-heading text-lg italic text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>{vegCount}</span>
            </div>
            <div className="border-x border-[#173d2c]/10 px-4 py-3 dark:border-white/[0.08]">
              <span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">🍗 Non-Veg</span>
              <span className="mt-1 block font-heading text-lg italic text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>{nonVegCount}</span>
            </div>
            <div className="px-4 py-3">
              <span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-[#173d2c]/40 dark:text-white/30">Catering Total</span>
              <span className="mt-1 block whitespace-nowrap font-heading text-lg text-[#9a742e] dark:text-[#d2b56b]" style={{ fontFamily: '"Playfair Display", serif' }}>₹{grandFoodTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column ScrollSpy Grid matching Execution Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Sticky Category Sidebar (Hidden Scrollbar) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-4 shadow-sm space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none">
          <div className="pb-2 border-b border-[#173d2c]/10 dark:border-white/[0.08] flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a742e] dark:text-[#d2b56b] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Meal Services ({MEAL_CATEGORIES.length})
            </span>
          </div>

          {/* Meal Category Buttons */}
          <div className="space-y-1">
            {groupedMealSections.map((group) => {
              const cat = group.category;
              const isActive = activeMealType === cat.id;
              const selectedCount = group.items.filter((item) => selectedItems.some((s) => s.serviceItemId === item.id && s.quantity > 0)).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToMealSection(cat.id)}
                  className={`w-full text-left px-3.5 py-3 transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
                    isActive
                      ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] border-transparent font-bold shadow-md"
                      : "bg-[#fffaf3]/60 dark:bg-white/[0.02] border-[#173d2c]/08 dark:border-white/05 text-[#173d2c]/75 dark:text-[#eee5d7]/70 hover:bg-[#efe3cc] dark:hover:bg-[#25251d]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      isActive ? "bg-[#a17a34] dark:bg-[#161812] scale-125" : "bg-[#173d2c]/30 dark:bg-white/20 group-hover:scale-110"
                    }`} />
                    <div className="truncate">
                      <span className="text-xs font-heading tracking-wide block truncate" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {cat.name}
                      </span>
                    </div>
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

          {/* Dietary Preference Filter Toggle */}
          <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] space-y-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#173d2c]/40 dark:text-white/30 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#a17a34]" /> Dietary Filter
            </span>
            <div className="flex border border-[#173d2c]/10 bg-[#fffaf3]/55 p-1 dark:border-white/10 dark:bg-white/[0.02]">
              <button type="button" onClick={() => setActiveDietFilter("all")} className={`flex-1 ${filterClass(activeDietFilter === "all")}`}>All</button>
              <button type="button" onClick={() => setActiveDietFilter("veg")} className={`flex-1 ${filterClass(activeDietFilter === "veg")}`}>🌱 Veg</button>
              <button type="button" onClick={() => setActiveDietFilter("non_veg")} className={`flex-1 ${filterClass(activeDietFilter === "non_veg")}`}>🍗 Non-Veg</button>
            </div>
          </div>
        </aside>

        {/* Right Category Items Scroll Pane (Hidden Scrollbar) */}
        <main
          ref={scrollContainerRef}
          className="lg:col-span-8 space-y-10 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-none scroll-smooth"
        >
          {groupedMealSections.map((group) => {
            const cat = group.category;

            return (
              <section
                key={cat.id}
                id={`meal-section-${cat.id}`}
                data-meal-section="true"
                data-meal-id={cat.id}
                className="space-y-4 pt-2 scroll-mt-28 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-8 last:border-b-0"
              >
                {/* Category Section Header */}
                <div className="flex items-center justify-between bg-[#efe3cc]/50 dark:bg-[#25251d]/50 p-3.5 border-l-4 border-[#a17a34] dark:border-[#d2b56b]">
                  <div>
                    <h4 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a742e] dark:text-[#d2b56b] font-mono">
                    {group.items.length} Spreads
                  </span>
                </div>

                {/* Items Grid for this Meal Category */}
                {group.items.length === 0 ? (
                  <div className="border border-dashed border-[#173d2c]/15 bg-[#fffaf3]/55 p-6 text-center text-xs text-[#173d2c]/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40">
                    No menu items match the selected dietary filter for {cat.name}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {group.items.map((item) => {
                      const qty = getItemQuantity(item.id);
                      const totalCost = calculateItemTotal(item, qty);
                      const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
                      const isVeg = item.food_category === "veg";

                      // Resolve visual food cover image
                      const imageUrl =
                        FOOD_IMAGE_MAP[item.id] ||
                        (item.meal_type && FOOD_IMAGE_MAP[item.meal_type]) ||
                        (isVeg ? FOOD_IMAGE_MAP.default_veg : FOOD_IMAGE_MAP.default_non_veg);

                      return (
                        <article
                          key={item.id}
                          className={`border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                            qty > 0
                              ? "border-[#a17a34] bg-[#fbf7f0] dark:bg-[#191b17] shadow-lg ring-1 ring-[#a17a34]/30"
                              : "border-[#173d2c]/12 bg-[#fffaf3]/80 hover:border-[#a17a34]/50 dark:border-white/10 dark:bg-[#121410]"
                          }`}
                        >
                          {/* Food Item Image Cover Banner */}
                          <div className="relative h-40 overflow-hidden group select-none">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                              {/* Standard Veg/Non-Veg Symbol Badge */}
                              {isVeg ? (
                                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> 🌱 Pure Veg
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-red-400 font-mono text-[9px] font-bold border border-red-500/40 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-red-500" /> 🍗 Non-Veg
                                </span>
                              )}

                              <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white font-mono text-[8px] font-bold uppercase tracking-wider border border-white/20">
                                {unit === "per_plate" ? "Per Plate" : unit === "per_piece" ? "Per Piece" : "Fixed"}
                              </span>
                            </div>

                            <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 space-y-0.5">
                              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#d2b56b]">
                                {cat.name}
                              </span>
                              <h4 className="font-heading text-lg text-white font-normal drop-shadow-sm leading-snug" style={{ fontFamily: '"Playfair Display", serif' }}>
                                {item.name}
                              </h4>
                            </div>
                          </div>

                          {/* Card Content & Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <p className="text-xs text-[#173d2c]/70 dark:text-[#eee5d7]/60 font-light leading-relaxed line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex items-end justify-between gap-3 border-t border-[#173d2c]/10 pt-3 dark:border-white/[0.08]">
                              <div>
                                <span className="font-heading text-lg text-[#9a742e] dark:text-[#d2b56b]" style={{ fontFamily: '"Playfair Display", serif' }}>
                                  ₹{item.price?.toLocaleString("en-IN")}
                                </span>
                                <span className="ml-1 text-[9px] text-[#173d2c]/50 dark:text-white/40">
                                  {unit === "per_plate" ? `/ plate × ${guestCount}` : unit === "per_piece" ? "/ piece" : " fixed"}
                                </span>
                                {qty > 0 && (
                                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#143d2b] dark:text-[#eee5d7]">
                                    Line Total <span className="text-[#9a742e] dark:text-[#d2b56b]">₹{totalCost.toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center border border-[#173d2c]/15 bg-[#fffaf3] p-0.5 dark:border-white/10 dark:bg-black/20">
                                <button
                                  type="button"
                                  onClick={() => onQuantityChange(item.id, -1)}
                                  disabled={qty <= 0}
                                  className="flex h-7 w-7 items-center justify-center text-[#173d2c]/60 transition hover:bg-[#143d2b] hover:text-white disabled:cursor-not-allowed disabled:opacity-25 dark:text-white/50 dark:hover:bg-[#d2b56b] dark:hover:text-[#161812]"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center font-heading text-xs font-bold text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onQuantityChange(item.id, 1)}
                                  className="flex h-7 w-7 items-center justify-center bg-[#143d2b] text-white transition hover:opacity-90 dark:bg-[#d2b56b] dark:text-[#161812]"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </main>
      </div>
    </section>
  );
}