"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createEventRequest } from "../actions";

interface Media {
  media_url: string;
}

interface ServiceItem {
  id: string;
  subcategory_id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: "flat" | "per_plate";
  service_item_media: Media[];
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface EventRequestFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  items: ServiceItem[];
}

export default function EventRequestForm({
  categories,
  subcategories,
  items,
}: EventRequestFormProps) {
  const router = useRouter();

  // 1. Form Inputs
  const [eventType, setEventType] = useState("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState<number>(100);

  // 2. Tab selection (Active Category ID)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id || ""
  );

  // 3. Selection Map: itemId -> quantity
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggles item selection
  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[itemId]) {
        delete copy[itemId];
      } else {
        copy[itemId] = 1; // default quantity
      }
      return copy;
    });
  };

  // Adjusts quantity of selected item
  const handleQuantityChange = (itemId: string, val: number) => {
    if (val <= 0) {
      handleItemToggle(itemId);
      return;
    }
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: val,
    }));
  };

  // Subcategories in the active category
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => sub.category_id === activeCategoryId);
  }, [subcategories, activeCategoryId]);

  // Service items maps subcategory -> items
  const itemsBySubcategory = useMemo(() => {
    const map: Record<string, ServiceItem[]> = {};
    items.forEach((item) => {
      if (!map[item.subcategory_id]) {
        map[item.subcategory_id] = [];
      }
      map[item.subcategory_id].push(item);
    });
    return map;
  }, [items]);

  // Real-time Budget Calculation
  const budgetDetails = useMemo(() => {
    let subtotal = 0;
    const itemList: {
      item: ServiceItem;
      qty: number;
      categoryName: string;
      lineTotal: number;
    }[] = [];

    Object.entries(selectedItems).forEach(([itemId, qty]) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const sub = subcategories.find((s) => s.id === item.subcategory_id);
      const cat = categories.find((c) => c.id === sub?.category_id);

      const unitPrice = Number(item.price);
      let lineTotal = 0;

      if (item.pricing_type === "flat") {
        lineTotal = unitPrice * qty;
      } else if (item.pricing_type === "per_plate") {
        lineTotal = unitPrice * guestCount * qty;
      }

      subtotal += lineTotal;
      itemList.push({
        item,
        qty,
        categoryName: cat?.name || "Service",
        lineTotal,
      });
    });

    return {
      total: subtotal,
      list: itemList,
    };
  }, [selectedItems, items, subcategories, categories, guestCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const itemsPayload = Object.entries(selectedItems).map(([itemId, qty]) => ({
      serviceItemId: itemId,
      quantity: qty,
    }));

    try {
      if (itemsPayload.length === 0) {
        throw new Error("Please select at least one service item from the catalog.");
      }
      if (!eventDate) {
        throw new Error("Please select a valid event date.");
      }
      if (!location.trim()) {
        throw new Error("Please specify the event location.");
      }
      if (guestCount <= 0) {
        throw new Error("Guest count must be at least 1.");
      }

      const requestId = await createEventRequest({
        eventType,
        eventDate,
        location,
        guestCount,
        items: itemsPayload,
      });

      router.push("/customer/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create event request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Parameters & Catalog (Left columns) */}
      <div className="lg:col-span-2 space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* 1. Event Setup */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-heading text-purple-600 dark:text-purple-400">1. Event Parameters</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="eventType" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Event Type
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
              >
                <option value="Wedding">Wedding Ceremony</option>
                <option value="Birthday">Birthday Party</option>
                <option value="Reception">Wedding Reception</option>
                <option value="DJ Night">DJ & Dance Event</option>
                <option value="Corporate">Corporate Conference</option>
                <option value="Social Gathering">Social Gathering</option>
                <option value="Other">Other Custom Event</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="eventDate" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Event Date
              </label>
              <input
                id="eventDate"
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="guestCount" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Estimated Guest Count
              </label>
              <input
                id="guestCount"
                type="number"
                min={1}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                placeholder="100"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Venue Location
              </label>
              <input
                id="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Grand Convention Hall, Bangalore"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 transition duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Catalog Browse */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-heading text-indigo-600 dark:text-indigo-400">2. Select Services</h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeCategoryId === cat.id
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950 border-border hover:border-zinc-300 dark:hover:border-zinc-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Catalog list in tabs */}
          <div className="space-y-8 pt-2">
            {filteredSubcategories.length === 0 ? (
              <div className="text-muted-foreground text-xs py-4">
                No items configured in this category.
              </div>
            ) : (
              filteredSubcategories.map((sub) => {
                const subItems = itemsBySubcategory[sub.id] || [];
                if (subItems.length === 0) return null;

                return (
                  <div key={sub.id} className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground border-l-2 border-purple-500 pl-3">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground pl-3 -mt-2">{sub.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subItems.map((item) => {
                        const isSelected = !!selectedItems[item.id];
                        const quantity = selectedItems[item.id] || 0;
                        const mediaUrl = item.service_item_media?.[0]?.media_url;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 gap-4 shadow-sm ${
                              isSelected
                                ? "bg-purple-500/5 border-purple-500/40"
                                : "bg-surface border-border hover:border-zinc-300 dark:hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex gap-4">
                              {mediaUrl && (
                                <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 relative border border-border">
                                  <img
                                    src={mediaUrl}
                                    alt={item.name}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              )}
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                              <div>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                  ₹{Number(item.price).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono ml-1">
                                  {item.pricing_type === "per_plate" ? "/plate" : "flat"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {isSelected ? (
                                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(item.id, quantity - 1)}
                                      className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-900 text-xs font-bold transition cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 text-xs font-bold font-mono text-foreground">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                      className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-900 text-xs font-bold transition cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleItemToggle(item.id)}
                                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow shadow-purple-500/10 cursor-pointer"
                                  >
                                    Add Setup
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Budget Visualizer Sidebar */}
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold font-heading text-purple-600 dark:text-purple-400">Estimated Budget</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {budgetDetails.list.length === 0 ? (
              <p className="text-muted-foreground text-xs py-4">No services selected. Choose items from the catalog.</p>
            ) : (
              <div className="divide-y divide-border space-y-3">
                {budgetDetails.list.map(({ item, qty, categoryName, lineTotal }) => (
                  <div key={item.id} className="pt-3 flex justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">
                        {categoryName} • {qty}x {item.pricing_type === "per_plate" ? `₹${item.price} * ${guestCount} guests` : `₹${item.price}`}
                      </div>
                    </div>
                    <div className="font-bold text-foreground flex-shrink-0 font-mono">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-2.5">
            <div className="flex justify-between items-center text-muted-foreground text-xs">
              <span>Selected Services:</span>
              <span className="font-semibold text-foreground">{budgetDetails.list.length}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground text-xs">
              <span>Guest Count Multiplier:</span>
              <span className="font-semibold text-foreground">{guestCount} plates</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Total Estimate:</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ₹{budgetDetails.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || budgetDetails.list.length === 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow shadow-purple-500/25 hover:shadow-purple-500/40 text-sm cursor-pointer"
          >
            {loading ? "Submitting Request..." : "Submit Event Request"}
          </button>
        </div>
      </div>
    </form>
  );
}
