"use client";

import React, { useState } from "react";
import { ServiceItem } from "@/lib/types";
import { Utensils, Sun, Moon, Sparkles, Plus, Minus } from "lucide-react";

interface SelectedItem { serviceItemId: string; quantity: number; }
interface Props {
  guestCount: number;
  foodItems: ServiceItem[];
  selectedItems: SelectedItem[];
  onQuantityChange: (serviceItemId: string, delta: number) => void;
  onSetQuantity: (serviceItemId: string, quantity: number) => void;
}

export default function FoodSelectionModule({ guestCount, foodItems, selectedItems, onQuantityChange, onSetQuantity }: Props) {
  const [activeMealType, setActiveMealType] = useState<string>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const getItemQuantity = (id: string) => selectedItems.find((i) => i.serviceItemId === id)?.quantity || 0;
  const calculateItemTotal = (item: ServiceItem, quantity: number) => {
    if (quantity <= 0) return 0;
    const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
    if (unit === "per_plate") return item.price * guestCount * quantity;
    return item.price * quantity;
  };

  const filteredItems = foodItems.filter((item) => {
    if (activeMealType !== "all" && item.meal_type !== "general" && item.meal_type !== activeMealType) return false;
    if (activeCategoryFilter !== "all" && item.food_category !== activeCategoryFilter) return false;
    return true;
  });

  let grandFoodTotal = 0;
  let vegCount = 0;
  let nonVegCount = 0;
  selectedItems.forEach((sel) => {
    const item = foodItems.find((f) => f.id === sel.serviceItemId);
    if (item && sel.quantity > 0) {
      grandFoodTotal += calculateItemTotal(item, sel.quantity);
      if (item.food_category === "veg") vegCount += sel.quantity;
      if (item.food_category === "non_veg") nonVegCount += sel.quantity;
    }
  });

  const filterClass = (active: boolean) => `flex shrink-0 items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition ${active ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812]" : "text-[#173d2c]/50 hover:text-[#143d2b] dark:text-white/40 dark:hover:text-[#eee5d7]"}`;

  return (
    <section className="animate-fade-in-up space-y-6">
      <div className="border-b border-[#173d2c]/10 pb-6 dark:border-white/[0.08]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3"><span className="h-px w-8 bg-[#a17a34]/50" /><Utensils className="h-3.5 w-3.5 text-[#a17a34] dark:text-[#d2b56b]" /><span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#173d2c]/55 dark:text-[#d9c88d]/70">The dining edit</span></div>
            <h3 className="font-heading text-2xl font-normal tracking-[-0.025em] text-[#143d2b] sm:text-3xl dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>Food <span className="italic text-[#9a742e] dark:text-[#d2b56b]">& Catering</span></h3>
            <p className="mt-2 text-xs leading-6 text-[#17392b]/60 dark:text-[#eee5d7]/55">Customize menu items across meals for <strong className="font-semibold text-[#9a742e] dark:text-[#d2b56b]">{guestCount} guests</strong>.</p>
          </div>

          <div className="grid grid-cols-3 border border-[#173d2c]/10 bg-[#fffaf3]/55 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="px-4 py-3"><span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-[#173d2c]/40 dark:text-white/30">Veg Items</span><span className="mt-1 block font-heading text-lg italic text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>{vegCount}</span></div>
            <div className="border-x border-[#173d2c]/10 px-4 py-3 dark:border-white/[0.08]"><span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-[#173d2c]/40 dark:text-white/30">Non-Veg</span><span className="mt-1 block font-heading text-lg italic text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>{nonVegCount}</span></div>
            <div className="px-4 py-3"><span className="block text-[7px] font-bold uppercase tracking-[0.18em] text-[#173d2c]/40 dark:text-white/30">Catering Total</span><span className="mt-1 block whitespace-nowrap font-heading text-lg text-[#9a742e] dark:text-[#d2b56b]" style={{ fontFamily: '"Playfair Display", serif' }}>₹{grandFoodTotal.toLocaleString("en-IN")}</span></div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[#173d2c]/10 pt-4 sm:flex-row sm:flex-wrap dark:border-white/[0.08]">
          <div className="flex max-w-full overflow-x-auto border border-[#173d2c]/10 bg-[#fffaf3]/55 p-1 dark:border-white/10 dark:bg-white/[0.02]">
            <button type="button" onClick={() => setActiveMealType("all")} className={filterClass(activeMealType === "all")}>All Meals</button>
            <button type="button" onClick={() => setActiveMealType("breakfast")} className={filterClass(activeMealType === "breakfast")}><Sun className="h-3 w-3" />Breakfast</button>
            <button type="button" onClick={() => setActiveMealType("lunch")} className={filterClass(activeMealType === "lunch")}><Utensils className="h-3 w-3" />Lunch</button>
            <button type="button" onClick={() => setActiveMealType("dinner")} className={filterClass(activeMealType === "dinner")}><Moon className="h-3 w-3" />Dinner</button>
          </div>
          <div className="flex max-w-full overflow-x-auto border border-[#173d2c]/10 bg-[#fffaf3]/55 p-1 dark:border-white/10 dark:bg-white/[0.02]">
            <button type="button" onClick={() => setActiveCategoryFilter("all")} className={filterClass(activeCategoryFilter === "all")}>All Diets</button>
            <button type="button" onClick={() => setActiveCategoryFilter("veg")} className={filterClass(activeCategoryFilter === "veg")}><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />Veg</button>
            <button type="button" onClick={() => setActiveCategoryFilter("non_veg")} className={filterClass(activeCategoryFilter === "non_veg")}><span className="h-1.5 w-1.5 rounded-full bg-red-700" />Non-Veg</button>
          </div>
        </div>
      </div>

      <div>
        {filteredItems.length === 0 ? (
          <div className="border border-dashed border-[#173d2c]/15 bg-[#fffaf3]/55 px-6 py-12 text-center text-xs text-[#173d2c]/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40">No menu items match the selected filter criteria.</div>
        ) : (
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-[#173d2c]/10 bg-[#173d2c]/10 md:grid-cols-2 dark:border-white/[0.08] dark:bg-white/[0.08]">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              const totalCost = calculateItemTotal(item, qty);
              const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
              return (
                <article key={item.id} className={`relative flex min-h-[190px] flex-col justify-between p-5 transition sm:p-6 ${qty > 0 ? "bg-[#efe3cc] dark:bg-[#25251d]" : "bg-[#f7f0e6] hover:bg-[#fffaf3] dark:bg-[#191b17] dark:hover:bg-[#1f211c]"}`}>
                  {qty > 0 && <span className="absolute inset-x-0 top-0 h-[2px] bg-[#a17a34] dark:bg-[#d2b56b]" />}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        {item.food_category === "veg" && <span className="flex h-3.5 w-3.5 items-center justify-center border border-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /></span>}
                        {item.food_category === "non_veg" && <span className="flex h-3.5 w-3.5 items-center justify-center border border-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-700" /></span>}
                        <h4 className="font-heading text-lg font-normal text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h4>
                      </div>
                      <span className="shrink-0 border border-[#173d2c]/10 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[#173d2c]/40 dark:border-white/10 dark:text-white/30">{unit === "per_plate" ? "Per Plate" : unit === "per_piece" ? "Per Piece" : "Fixed"}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#17392b]/50 dark:text-[#eee5d7]/40">{item.description}</p>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#173d2c]/10 pt-4 dark:border-white/[0.08]">
                    <div><span className="font-heading text-lg text-[#9a742e] dark:text-[#d2b56b]" style={{ fontFamily: '"Playfair Display", serif' }}>₹{item.price?.toLocaleString("en-IN")}</span><span className="ml-1 text-[9px] text-[#173d2c]/40 dark:text-white/30">{unit === "per_plate" ? `/ plate × ${guestCount}` : unit === "per_piece" ? "/ piece" : " fixed"}</span>{qty > 0 && <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#173d2c]/55 dark:text-[#eee5d7]/50">Total <span className="text-[#9a742e] dark:text-[#d2b56b]">₹{totalCost.toLocaleString("en-IN")}</span></div>}</div>
                    <div className="flex items-center border border-[#173d2c]/12 bg-[#fffaf3]/65 p-1 dark:border-white/10 dark:bg-black/10">
                      <button type="button" onClick={() => onQuantityChange(item.id, -1)} disabled={qty <= 0} className="flex h-8 w-8 items-center justify-center text-[#173d2c]/60 transition hover:bg-[#143d2b] hover:text-white disabled:cursor-not-allowed disabled:opacity-25 dark:text-white/50 dark:hover:bg-[#d2b56b] dark:hover:text-[#161812]"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center font-heading text-sm text-[#143d2b] dark:text-[#eee5d7]" style={{ fontFamily: '"Playfair Display", serif' }}>{qty}</span>
                      <button type="button" onClick={() => onQuantityChange(item.id, 1)} className="flex h-8 w-8 items-center justify-center bg-[#143d2b] text-white transition hover:opacity-90 dark:bg-[#d2b56b] dark:text-[#161812]"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}