"use client";

import React, { useState } from "react";
import { ServiceItem } from "@/lib/types";
import { Utensils, Coffee, Sun, Moon, Sparkles, Plus, Minus, Check } from "lucide-react";

interface SelectedItem {
  serviceItemId: string;
  quantity: number;
}

interface Props {
  guestCount: number;
  foodItems: ServiceItem[];
  selectedItems: SelectedItem[];
  onQuantityChange: (serviceItemId: string, delta: number) => void;
  onSetQuantity: (serviceItemId: string, quantity: number) => void;
}

export default function FoodSelectionModule({
  guestCount,
  foodItems,
  selectedItems,
  onQuantityChange,
  onSetQuantity,
}: Props) {
  const [activeMealType, setActiveMealType] = useState<string>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const getItemQuantity = (id: string) => {
    return selectedItems.find((i) => i.serviceItemId === id)?.quantity || 0;
  };

  const calculateItemTotal = (item: ServiceItem, quantity: number) => {
    if (quantity <= 0) return 0;
    const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
    if (unit === "per_plate") {
      return item.price * guestCount * quantity;
    }
    return item.price * quantity;
  };

  const filteredItems = foodItems.filter((item) => {
    if (activeMealType !== "all" && item.meal_type !== "general" && item.meal_type !== activeMealType) {
      return false;
    }
    if (activeCategoryFilter !== "all" && item.food_category !== activeCategoryFilter) {
      return false;
    }
    return true;
  });

  // Calculate totals
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header & Breakdown Bar */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground">Food & Catering Menu Engine</h3>
              <p className="text-xs text-muted-foreground">
                Customize menu items across meals. Guest Count: <span className="text-accent-gold font-bold">{guestCount} Guests</span>
              </p>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl px-4 py-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Veg Items</span>
              <span className="text-emerald-400 font-bold">{vegCount} Selected</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Non-Veg Items</span>
              <span className="text-red-400 font-bold">{nonVegCount} Selected</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Catering Total</span>
              <span className="text-accent-gold font-bold font-heading text-sm">₹{grandFoodTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          {/* Meal Filters */}
          <div className="flex items-center gap-1.5 bg-background p-1 border border-border rounded-xl text-xs overflow-x-auto max-w-full scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveMealType("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeMealType === "all" ? "bg-accent-gold text-black font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Meals
            </button>
            <button
              type="button"
              onClick={() => setActiveMealType("breakfast")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeMealType === "breakfast" ? "bg-accent-gold text-black font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Breakfast
            </button>
            <button
              type="button"
              onClick={() => setActiveMealType("lunch")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeMealType === "lunch" ? "bg-accent-gold text-black font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> Lunch
            </button>
            <button
              type="button"
              onClick={() => setActiveMealType("dinner")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeMealType === "dinner" ? "bg-accent-gold text-black font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dinner
            </button>
          </div>

          {/* Veg/Non-Veg Category Filters */}
          <div className="flex items-center gap-1.5 bg-background p-1 border border-border rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeCategoryFilter === "all" ? "bg-surface-raised text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              All Diets
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter("veg")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategoryFilter === "veg" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold" : "text-muted-foreground"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter("non_veg")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategoryFilter === "non_veg" ? "bg-red-500/20 text-red-400 border border-red-500/30 font-bold" : "text-muted-foreground"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-8 bg-surface border border-border rounded-2xl text-center text-muted-foreground text-xs">
          No menu items match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const qty = getItemQuantity(item.id);
            const totalCost = calculateItemTotal(item, qty);
            const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  qty > 0 ? "bg-accent-gold/5 border-accent-gold/50 shadow-sm" : "bg-surface border-border"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.food_category === "veg" && (
                        <span className="w-3.5 h-3.5 border border-emerald-500 flex items-center justify-center p-0.5 rounded-sm" title="Veg">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.food_category === "non_veg" && (
                        <span className="w-3.5 h-3.5 border border-red-500 flex items-center justify-center p-0.5 rounded-sm" title="Non-Veg">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                    </div>

                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                      {unit === "per_plate" ? "Per Plate" : unit === "per_piece" ? "Per Piece" : "Fixed"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent-gold font-heading">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      {unit === "per_plate" ? `/ plate x ${guestCount}` : unit === "per_piece" ? "/ piece" : " fixed"}
                    </span>

                    {qty > 0 && (
                      <div className="text-[11px] font-bold text-foreground mt-0.5">
                        Total: <span className="text-accent-gold">₹{totalCost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, -1)}
                      disabled={qty <= 0}
                      className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-raised disabled:opacity-40 flex items-center justify-center text-foreground transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-6 text-center font-bold text-xs text-foreground">{qty}</span>

                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-accent-gold hover:brightness-110 flex items-center justify-center text-black font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
