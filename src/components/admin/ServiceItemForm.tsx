"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveServiceItem } from "@/app/admin/catalog/actions";
import { ServiceItem, Subcategory } from "@/lib/types";
import MediaUploader from "./MediaUploader";

interface ServiceItemFormProps {
  item?: (ServiceItem & { media?: string[] }) | null;
  subcategories: Subcategory[];
  onClose: () => void;
}

export default function ServiceItemForm({
  item,
  subcategories,
  onClose,
}: ServiceItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [subcategoryId, setSubcategoryId] = useState(item?.subcategory_id || "");
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price || 0);
  const [pricingType, setPricingType] = useState<"flat" | "per_plate">(item?.pricing_type || "flat");
  const [pricingUnit, setPricingUnit] = useState<"per_plate" | "per_piece" | "fixed">(item?.pricing_unit || "per_plate");
  const [foodCategory, setFoodCategory] = useState<"veg" | "non_veg" | "beverage" | "dessert" | "general">(item?.food_category || "general");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "high_tea" | "general">(item?.meal_type || "general");
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);
  const [mediaUrls, setMediaUrls] = useState<string[]>(item?.media || []);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subcategoryId) {
      setError("Please select a subcategory.");
      return;
    }
    if (price < 0) {
      setError("Price cannot be negative.");
      return;
    }

    startTransition(async () => {
      try {
        await saveServiceItem({
          id: item?.id,
          subcategory_id: subcategoryId,
          name,
          description,
          price,
          pricing_type: pricingUnit === "per_plate" ? "per_plate" : "flat",
          pricing_unit: pricingUnit,
          food_category: foodCategory,
          meal_type: mealType,
          is_available: isAvailable,
          sort_order: sortOrder,
          media_urls: mediaUrls,
        });
        onClose();
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to save service item.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto py-8 animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-4 my-auto animate-scale-in">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-lg font-bold font-heading text-foreground">
            {item ? "Edit Service Item" : "Add Service Item"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subcategory</label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item/Package Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wedding Photo Package 1, Veg Dinner Buffet"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact package list or menu options details"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground resize-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing Unit</label>
              <select
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value as any)}
                required
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
              >
                <option value="per_plate">Per Plate (x Guest Count)</option>
                <option value="per_piece">Per Piece / Unit</option>
                <option value="fixed">Fixed Price Package</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price (INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200 animate-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Food Category (If Food Item)</label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
              >
                <option value="general">General / Non-Food</option>
                <option value="veg">Vegetarian</option>
                <option value="non_veg">Non-Vegetarian</option>
                <option value="beverage">Beverage & Drinks</option>
                <option value="dessert">Sweets & Desserts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meal Type (If Food Item)</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
              >
                <option value="general">General / Any Meal</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="high_tea">High Tea / Snacks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-border text-accent-gold focus:ring-accent-gold bg-background h-4.5 w-4.5 cursor-pointer"
                />
                <span>Is Available</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Media (Max 5 items)</label>
            <MediaUploader value={mediaUrls} onChange={setMediaUrls} limit={5} />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-surface hover:bg-surface-raised text-foreground border border-border rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-accent-gold hover:brightness-110 disabled:opacity-50 text-black font-bold rounded-xl transition cursor-pointer text-xs shadow-md shadow-accent-gold/15"
            >
              {isPending ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
