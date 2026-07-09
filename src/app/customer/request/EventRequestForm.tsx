"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createEventRequest } from "../actions";
import { 
  Sparkles, Calendar, MapPin, Users, DollarSign, Clock, 
  FileText, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight,
  Gift, Heart, Music, Award, Users2, Shield, AlertCircle
} from "lucide-react";

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

const EVENT_TYPES = [
  { id: "Wedding", label: "Wedding Ceremony", desc: "Crafting luxury, ceremonial matrimonial experiences.", icon: Heart },
  { id: "Reception", label: "Wedding Reception", desc: "Celebrate union with dining, styling, and design.", icon: Award },
  { id: "Engagement", label: "Engagement Party", desc: "Celebrate ring exchanges with grand aesthetics.", icon: Sparkles },
  { id: "Birthday", label: "Birthday Celebration", desc: "Private birthday banquets and milestones.", icon: Gift },
  { id: "Corporate Event", label: "Corporate Event", desc: "Conferences, galas, and official milestones.", icon: Users2 },
  { id: "Anniversary", label: "Anniversary Gala", desc: "Milestone union celebrations and banquets.", icon: Heart },
  { id: "Housewarming", label: "Housewarming", desc: "Traditional home welcoming decor and layouts.", icon: MapPin },
  { id: "Baby Shower", label: "Baby Shower", desc: "Gentle celebrations with theme-based decor.", icon: Gift },
  { id: "Private Event", label: "Private Celebration", desc: "Exclusive private dinings and close circles.", icon: Music },
  { id: "Other", label: "Other Celebration", desc: "Customized orchestration by our operations team.", icon: Calendar }
];

export default function EventRequestForm({
  categories,
  subcategories,
  items,
}: EventRequestFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 State: Event Type
  const [eventType, setEventType] = useState("Wedding");

  // Step 2 State: Basic Info
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [guestCount, setGuestCount] = useState<number>(100);
  const [description, setDescription] = useState("");

  // Step 3 State: Catalog service item selection (itemId -> quantity)
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "");

  // Helper arrays & maps
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => sub.category_id === activeCategoryId);
  }, [subcategories, activeCategoryId]);

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

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[itemId]) {
        delete copy[itemId];
      } else {
        copy[itemId] = 1;
      }
      return copy;
    });
  };

  const handleQuantityChange = (itemId: string, val: number) => {
    if (val <= 0) {
      handleItemToggle(itemId);
      return;
    }
    setSelectedItems((prev) => ({ ...prev, [itemId]: val }));
  };

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      if (!eventName.trim()) return setError("Please enter an event name.");
      if (!eventDate) return setError("Please select an event date.");
      if (!venue.trim()) return setError("Please specify the venue address.");
      if (!city.trim()) return setError("Please specify the city.");
      if (guestCount <= 0) return setError("Expected guests must be greater than zero.");
    }
    if (step === 3) {
      if (Object.keys(selectedItems).length === 0) {
        return setError("Please select at least one service item from the catalog.");
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const itemsPayload = Object.entries(selectedItems).map(([itemId, qty]) => ({
      serviceItemId: itemId,
      quantity: qty,
    }));

    try {
      const locationString = `${venue}, ${city}`;
      await createEventRequest({
        eventType,
        eventDate,
        location: locationString,
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
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between max-w-xl mx-auto border-b border-border/40 pb-6">
        {[
          { num: 1, label: "Archetype" },
          { num: 2, label: "Details" },
          { num: 3, label: "Services" },
          { num: 4, label: "Proposal" }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${
              step === s.num
                ? "bg-accent-gold text-black shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                : step > s.num
                ? "bg-accent-gold/20 text-accent-gold"
                : "bg-surface border border-border text-muted-foreground"
            }`}>
              {s.num}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:inline ${
              step === s.num ? "text-foreground" : "text-muted-foreground/60"
            }`}>
              {s.label}
            </span>
            {s.num < 4 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 ml-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2.5 max-w-xl mx-auto animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 1: SELECT EVENT ARCHETYPE
      ────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="text-center max-w-md mx-auto space-y-1.5">
            <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">Step One</span>
            <h2 className="text-2xl font-light font-heading text-foreground">Select Event Archetype</h2>
            <p className="text-[10.5px] text-muted-foreground leading-relaxed font-light">
              Every occasion is uniquely curated. Select the archetype of the celebration you want us to coordinate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4.5">
            {EVENT_TYPES.map((type) => {
              const IconComp = type.icon;
              const isSelected = eventType === type.id;

              return (
                <div
                  key={type.id}
                  onClick={() => setEventType(type.id)}
                  className={`p-5.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[155px] text-left relative overflow-hidden ${
                    isSelected
                      ? "bg-surface-raised border-[#D4AF37]/50 shadow-md"
                      : "bg-surface border-border/80 hover:border-accent-gold/25"
                  } hover-lift`}
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
                    isSelected ? "bg-accent-gold/10 border-accent-gold/20 text-accent-gold" : "bg-background border-border text-muted-foreground"
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground font-heading">{type.label}</h3>
                    <p className="text-[9px] text-muted-foreground mt-1 font-light leading-normal line-clamp-2">
                      {type.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute right-3.5 top-3.5">
                      <CheckCircle2 className="w-4 h-4 text-accent-gold fill-accent-gold/10" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={nextStep}
              className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-[0.18em] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              Continue Parameters <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 2: DEFINE PARAMETERS
      ────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-surface border border-border/80 rounded-3xl p-8 space-y-8 animate-fade-in-up shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">Step Two</span>
            <h2 className="text-2xl font-light font-heading text-foreground">Event Parameters</h2>
            <p className="text-[10.5px] text-muted-foreground font-light leading-relaxed">
              Define timelines, expected guests parameters, and location specifics for the {eventType}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Event Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Asish & Praneeth Ceremony"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Event Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Expected Guest Count</label>
              <input
                type="number"
                min={1}
                required
                placeholder="150"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Venue Name & Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Radisson Blu Temple Bay"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Hyderabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider">Special Requirements / Philosophy Notes</label>
              <textarea
                rows={3}
                placeholder="Write specific styling, palette selections, staging constraints, or culinary notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-light text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-5 border-t border-border/40">
            <button
              onClick={prevStep}
              className="px-5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={nextStep}
              className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              Select Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 3: SERVICES CATALOG & MOBILE STICKY BUDGET SUMMARY
      ────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-24 lg:pb-0 animate-fade-in-up">
          {/* Service items catalog (8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-border/80 rounded-3xl p-6.5 space-y-6">
            <div className="space-y-1.5">
              <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">Step Three</span>
              <h2 className="text-2xl font-light font-heading text-foreground">Select Services Checklist</h2>
              <p className="text-[10.5px] text-muted-foreground font-light leading-relaxed">
                Add desired decor, styling, staging, or catering service options. All selections are managed entirely under SAI EVENTS.
              </p>
            </div>

            {/* Category Tabs — Horizontal scrolling on mobile without wrapping */}
            <div className="flex flex-row overflow-x-auto gap-2 border-b border-border/45 pb-4 no-scrollbar scrollbar-none whitespace-nowrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-xl border transition-all duration-200 cursor-pointer uppercase tracking-wider shrink-0 ${
                    activeCategoryId === cat.id
                      ? "bg-accent-gold border-accent-gold text-black shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Catalog Subcategories & items list */}
            <div className="space-y-8 pt-2">
              {filteredSubcategories.length === 0 ? (
                <div className="text-muted-foreground text-xs py-8 text-center font-light border border-dashed border-border rounded-2xl">
                  No options configured under this workspace category yet.
                </div>
              ) : (
                filteredSubcategories.map((sub) => {
                  const subItems = itemsBySubcategory[sub.id] || [];
                  if (subItems.length === 0) return null;

                  return (
                    <div key={sub.id} className="space-y-4.5 text-xs">
                      <h3 className="text-xs font-bold text-foreground border-l-2 border-accent-gold pl-3.5 uppercase tracking-wider">
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p className="text-[10.5px] text-muted-foreground pl-3.5 -mt-2 leading-relaxed font-light">{sub.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subItems.map((item) => {
                          const isSelected = !!selectedItems[item.id];
                          const quantity = selectedItems[item.id] || 0;
                          const mediaUrl = item.service_item_media?.[0]?.media_url;

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 gap-4 shadow-sm ${
                                isSelected
                                  ? "bg-accent-gold/[0.03] border-accent-gold/30"
                                  : "bg-background border-border hover:border-accent-gold/15"
                              } hover-lift`}
                            >
                              <div className="flex gap-4">
                                {mediaUrl && (
                                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-background relative border border-border/80">
                                    <img
                                      src={mediaUrl}
                                      alt={item.name}
                                      className="object-cover h-full w-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                  </div>
                                )}
                                <div className="space-y-1 min-w-0">
                                  <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-light">
                                    {item.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1 font-mono text-[10px]">
                                <div>
                                  <span className="text-xs font-bold text-accent-gold">
                                    ₹{Number(item.price).toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[8.5px] text-muted-foreground/80 ml-1">
                                    {item.pricing_type === "per_plate" ? "/plate" : "flat"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {isSelected ? (
                                    <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(item.id, quantity - 1)}
                                        className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-surface-raised font-bold transition cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="px-2.5 font-bold text-foreground">
                                        {quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                        className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-surface-raised font-bold transition cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleItemToggle(item.id)}
                                      className="px-3.5 py-1.5 bg-accent-gold hover:bg-amber-500 text-black text-[9.5px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                                    >
                                      Add Service
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

            <div className="flex justify-between items-center pt-5 border-t border-border/40">
              <button
                onClick={prevStep}
                className="px-5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
              >
                Continue Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Running budget summary (4 cols) — Sticky sidebar panel on desktop */}
          <div className="hidden lg:block lg:col-span-4 p-6.5 bg-surface border border-border/80 rounded-3xl space-y-6 sticky top-24 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimate Summary</h3>
            
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {budgetDetails.list.length === 0 ? (
                <p className="text-muted-foreground font-light py-4 text-center">No options selected from the catalog checklist.</p>
              ) : (
                <div className="divide-y divide-border/40 space-y-2.5">
                  {budgetDetails.list.map(({ item, qty, lineTotal }) => (
                    <div key={item.id} className="pt-2.5 flex justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground truncate max-w-[130px]">{item.name}</div>
                        <div className="text-muted-foreground text-[8.5px] mt-0.5">
                          {qty}x · {item.pricing_type === "per_plate" ? `₹${item.price} * ${guestCount}` : `₹${item.price}`}
                        </div>
                      </div>
                      <div className="font-bold text-foreground font-mono flex-shrink-0">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between items-center text-[10px]">
                <span>Selected Items:</span>
                <span className="font-semibold text-foreground">{budgetDetails.list.length} Services</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/40 pt-3.5">
                <span className="text-[9.5px] font-bold text-foreground uppercase tracking-widest">Est. Total Budget:</span>
                <span className="text-lg font-bold text-accent-gold font-mono">
                  ₹{budgetDetails.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Fixed bottom sticky bar on mobile viewports — provides high-end UX */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-md border-t border-border/80 px-5 py-4 flex items-center justify-between z-30 shadow-lg">
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest block">Est. Total Budget</span>
              <span className="text-base font-bold text-accent-gold font-mono">
                ₹{budgetDetails.total.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={nextStep}
              className="px-5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/10 cursor-pointer"
            >
              Review Proposal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────
          STEP 4: SUMMARY & EXECUTIVE PROPOSAL REVIEW
      ────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="max-w-3xl mx-auto bg-surface border border-[#D4AF37]/35 rounded-3xl p-8 md:p-10 space-y-8 animate-fade-in-up shadow-lg relative overflow-hidden">
          {/* Subtle gold decoration bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold" />

          <div className="text-center space-y-1.5 max-w-md mx-auto">
            <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold block">Proposal Review</span>
            <h2 className="text-2xl font-light font-heading text-foreground">Executive Event Proposal</h2>
            <p className="text-[10.5px] text-muted-foreground font-light leading-relaxed">
              Review parameters and services selection. Upon submission, our operations team registers your coordinator assignment.
            </p>
          </div>

          {/* Proposal Parameters Sheet */}
          <div className="p-6 rounded-2xl bg-background/50 border border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-1 border-l border-accent-gold/20 pl-3">
              <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Occasion Type</span>
              <span className="text-foreground font-bold text-sm block">{eventType}</span>
              <span className="text-muted-foreground font-light block">{eventName}</span>
            </div>

            <div className="space-y-1 border-l border-accent-gold/20 pl-3">
              <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Timelines & Location</span>
              <span className="text-foreground font-semibold block">{eventDate}</span>
              <span className="text-muted-foreground font-light block truncate">{venue}, {city}</span>
            </div>

            <div className="space-y-1 border-l border-accent-gold/20 pl-3">
              <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Attending Guests</span>
              <span className="text-foreground font-mono font-semibold block">{guestCount} People</span>
            </div>

            <div className="space-y-1 border-l border-[#D4AF37]/40 pl-3">
              <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Invoiced Budget</span>
              <span className="text-accent-gold font-bold text-sm font-mono block">
                ₹{budgetDetails.total.toLocaleString("en-IN")}
              </span>
            </div>

            {description && (
              <div className="space-y-1 sm:col-span-2 border-l border-accent-gold/20 pl-3">
                <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Special Instructions</span>
                <p className="text-muted-foreground font-light">{description}</p>
              </div>
            )}
          </div>

          {/* Selected services summary */}
          <div className="space-y-3.5">
            <h3 className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
              Included Services Specifications
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {budgetDetails.list.map(({ item, qty, categoryName, lineTotal }) => (
                <div key={item.id} className="p-3.5 bg-background/30 border border-border/60 hover:border-accent-gold/15 rounded-xl flex justify-between items-center text-xs gap-3">
                  <div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                    <span className="text-[8.5px] uppercase tracking-wider text-accent-gold mt-1 block font-semibold">
                      {categoryName} Workspace · Managed by SAI EVENTS
                    </span>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-[9.5px] text-muted-foreground block">qty: {qty}</span>
                    <span className="font-bold text-foreground block">₹{lineTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning banner */}
          <div className="p-4.5 bg-background/30 border border-border/60 rounded-2xl flex items-start gap-3.5">
            <Shield className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
            <div className="text-[10px] text-muted-foreground leading-relaxed font-light">
              <span className="font-bold text-foreground block uppercase tracking-wider mb-0.5">Concierge Guarantee Statement</span>
              SAI EVENTS acts as the sole contractor. We fully abstract individual provider negotiations, staging, and schedules, delivering a single unified celebration experience.
            </div>
          </div>

          <div className="flex justify-between items-center pt-5 border-t border-border/40">
            <button
              onClick={prevStep}
              className="px-5 py-2.5 border border-border hover:bg-surface-raised rounded-xl text-[10px] font-bold uppercase tracking-wider text-foreground transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || budgetDetails.list.length === 0}
              className="px-7 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-xs font-bold uppercase tracking-[0.18em] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-accent-gold/15"
            >
              {loading ? "Registering Case..." : "Authorize Proposal"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
