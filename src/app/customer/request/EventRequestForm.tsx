"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createEventRequest } from "../actions";
import { Category, Subcategory, ServiceItem, EventPart, Recommendation } from "@/lib/types";
import EventPartsStep from "@/components/customer/request/EventPartsStep";
import RecommendationsStep from "@/components/customer/request/RecommendationsStep";
import FoodSelectionModule from "@/components/customer/request/FoodSelectionModule";
import { 
  Sparkles, Calendar, MapPin, Users, Clock, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronRight,
  Gift, Heart, Music, Award, Users2, AlertCircle, Phone, Mail,
  Utensils, Camera, Palette, Check, ExternalLink, ShieldCheck
} from "lucide-react";

interface Props {
  categories: Category[];
  subcategories: Subcategory[];
  items: ServiceItem[];
  eventParts: EventPart[];
  recommendations: Recommendation[];
}

const EVENT_TYPES = [
  { id: "Wedding", label: "Wedding Ceremony", desc: "Crafting luxury matrimonial experiences.", icon: Heart },
  { id: "Reception", label: "Wedding Reception", desc: "Celebrate union with dining, styling, and design.", icon: Award },
  { id: "Engagement", label: "Engagement Party", desc: "Celebrate ring exchanges with grand aesthetics.", icon: Sparkles },
  { id: "Birthday", label: "Birthday Celebration", desc: "Private birthday banquets and milestones.", icon: Gift },
  { id: "Corporate", label: "Corporate Event", desc: "Conferences, galas, and official milestones.", icon: Users2 },
  { id: "Anniversary", label: "Anniversary Gala", desc: "Milestone union celebrations and banquets.", icon: Heart },
  { id: "Housewarming", label: "Housewarming", desc: "Traditional home welcoming decor and layouts.", icon: MapPin },
  { id: "Sreemantham / Baby Shower", label: "Sreemantham / Baby Shower", desc: "Traditional baby shower celebrations.", icon: Gift },
  { id: "Other Celebration", label: "Other Celebration", desc: "Customized orchestration by our team.", icon: Calendar }
];

export default function EventRequestForm({
  categories,
  subcategories,
  items,
  eventParts,
  recommendations,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Confirmation State
  const [submittedRefNumber, setSubmittedRefNumber] = useState<string | null>(null);

  // Step 1: Details Form
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [eventFor, setEventFor] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [durationHours, setDurationHours] = useState<number>(4);
  const [venueAddress, setVenueAddress] = useState("");
  const [venueMapUrl, setVenueMapUrl] = useState("");
  const [guestCount, setGuestCount] = useState<number>(100);
  const [targetBudget, setTargetBudget] = useState<number | undefined>(undefined);
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Step 2: Event Parts
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  // Step 3 & 4 & 5: Service Selections (itemId -> quantity)
  const [selectedItems, setSelectedItems] = useState<{ serviceItemId: string; quantity: number }[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(categories[0]?.name || "All");

  // Filter food items vs non-food items
  const foodCategoryObj = categories.find((c) => c.name.toLowerCase().includes("food") || c.name.toLowerCase().includes("catering"));
  const foodSubcategoryIds = subcategories.filter((s) => s.category_id === foodCategoryObj?.id).map((s) => s.id);
  
  const foodItems = items.filter((i) => foodSubcategoryIds.includes(i.subcategory_id) || i.food_category !== "general");
  const nonFoodItems = items.filter((i) => !foodItems.includes(i));

  // Handle item quantities
  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.serviceItemId === itemId);
      if (!existing) {
        if (delta > 0) return [...prev, { serviceItemId: itemId, quantity: delta }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.serviceItemId !== itemId);
      }
      return prev.map((i) => (i.serviceItemId === itemId ? { ...i, quantity: newQty } : i));
    });
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.serviceItemId === itemId);
      if (exists) {
        return prev.filter((i) => i.serviceItemId !== itemId);
      }
      return [...prev, { serviceItemId: itemId, quantity: 1 }];
    });
  };

  const handleApplyRecommendations = (itemIds: string[]) => {
    setSelectedItems((prev) => {
      const remainingNonRec = prev.filter((i) => !itemIds.includes(i.serviceItemId));
      const recPayload = itemIds.map((id) => {
        const existing = prev.find((p) => p.serviceItemId === id);
        return { serviceItemId: id, quantity: existing ? existing.quantity : 1 };
      });
      return [...remainingNonRec, ...recPayload];
    });
  };

  // Real-time Total Budget Calculation
  const grandTotal = useMemo(() => {
    let sum = 0;
    selectedItems.forEach((sel) => {
      const item = items.find((i) => i.id === sel.serviceItemId);
      if (item) {
        const unitPrice = Number(item.price);
        const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
        if (unit === "per_plate") {
          sum += unitPrice * guestCount * sel.quantity;
        } else {
          sum += unitPrice * sel.quantity;
        }
      }
    });
    return sum;
  }, [selectedItems, items, guestCount]);

  // Step Validation
  const validateAndNext = () => {
    setError(null);

    if (step === 1) {
      if (!fullName.trim()) return setError("Full Name is required.");
      if (!phoneNumber.trim() || phoneNumber.length < 10) return setError("Please enter a valid Phone Number.");
      if (!eventDate) return setError("Event Date is required.");
      if (!venueAddress.trim()) return setError("Venue Address is required.");
      if (guestCount <= 0) return setError("Guest Count must be greater than zero.");
    }

    setStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (selectedItems.length === 0) {
      setError("Please select at least one service item or package.");
      setLoading(false);
      return;
    }

    try {
      const result = await createEventRequest({
        eventType,
        eventDate,
        location: venueAddress,
        guestCount,
        whatsappNumber,
        eventFor,
        eventTime,
        durationHours,
        venueAddress,
        targetBudget,
        specialRequirements,
        eventPartIds: selectedPartIds,
        items: selectedItems,
      });

      setSubmittedRefNumber(result.referenceNumber);
      setStep(6); // Move to Success Screen
    } catch (err: any) {
      setError(err.message || "Failed to create event request.");
    } finally {
      setLoading(false);
    }
  };

  // If Success Screen (Step 6)
  if (step === 6 && submittedRefNumber) {
    return (
      <div className="max-w-2xl mx-auto bg-surface border border-accent-gold/40 rounded-3xl p-8 sm:p-10 space-y-6 text-center animate-scale-in shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-accent-gold">Request Successfully Registered</span>
          <h2 className="text-3xl font-light font-heading text-foreground">Namaste, {fullName}!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Your event request for <strong className="text-foreground font-semibold">{eventType}</strong> has been registered under SAI EVENTS Concierge.
          </p>
        </div>

        {/* Reference & SLA Box */}
        <div className="p-6 rounded-2xl bg-background border border-border space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Reference Booking Number</span>
              <div className="text-xl font-bold font-mono text-accent-gold">{submittedRefNumber}</div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Estimated Response Time</span>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-accent-gold" /> Within 2 Business Hours
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event Date:</span>
              <span className="font-semibold text-foreground">{eventDate} {eventTime && `at ${eventTime}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">{venueAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests & Budget:</span>
              <span className="font-semibold text-foreground">{guestCount} Guests · <span className="text-accent-gold font-mono">₹{grandTotal.toLocaleString("en-IN")}</span></span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our Senior Event Coordinator will contact you on <strong className="text-foreground">{phoneNumber}</strong> to finalize execution details and vendor assignments.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/customer/dashboard")}
            className="px-6 py-3.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-accent-gold/15 cursor-pointer"
          >
            Go to My Events Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* Step Tracker Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-border/40 pb-5 overflow-x-auto scrollbar-none">
        {[
          { num: 1, label: "Details" },
          { num: 2, label: "Parts" },
          { num: 3, label: "Recommendations" },
          { num: 4, label: "Services" },
          { num: 5, label: "Food Engine" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                step === s.num
                  ? "bg-accent-gold text-black shadow-md shadow-accent-gold/20"
                  : step > s.num
                  ? "bg-accent-gold/20 text-accent-gold"
                  : "bg-surface border border-border text-muted-foreground"
              }`}
            >
              {s.num}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:inline ${step === s.num ? "text-foreground" : "text-muted-foreground/60"}`}>
              {s.label}
            </span>
            {s.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 max-w-2xl mx-auto animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── STEP 1: DETAILS FORM ── */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in-up">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-accent-gold">Step One</span>
            <h2 className="text-2xl font-light font-heading text-foreground">Event & Contact Details</h2>
            <p className="text-xs text-muted-foreground">Provide basic contact information and event specifications.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Contact Fields */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Your Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Asish Praneeth"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Phone Number *</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. asish@example.com"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            {/* Event Specs */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Event Type *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Event For (Celebrant Name)</label>
              <input
                type="text"
                value={eventFor}
                onChange={(e) => setEventFor(e.target.value)}
                placeholder="e.g. Groom & Bride / Birthday Celebrant"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Event Date *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Start Time & Duration</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                />
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                >
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={8}>Full Day (8+ Hrs)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-semibold text-muted-foreground uppercase">Venue Address & Location *</label>
              <input
                type="text"
                required
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g. Novotel Convention Centre, Hitec City, Hyderabad"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Expected Guest Count *</label>
              <input
                type="number"
                min={1}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground font-sans font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Target Budget (Optional)</label>
              <input
                type="number"
                value={targetBudget || ""}
                onChange={(e) => setTargetBudget(Number(e.target.value) || undefined)}
                placeholder="e.g. 500000"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground font-sans font-medium placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-semibold text-muted-foreground uppercase">Special Requirements / Notes</label>
              <textarea
                rows={2}
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Provide theme preferences, color palettes, or specific arrangements..."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/40">
            <button
              onClick={validateAndNext}
              className="px-6 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              Continue to Event Parts <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: EVENT PARTS MULTI-SELECTION ── */}
      {step === 2 && (
        <div className="space-y-6">
          <EventPartsStep
            eventType={eventType}
            availableParts={eventParts}
            selectedPartIds={selectedPartIds}
            onChange={setSelectedPartIds}
          />
          <div className="flex justify-between items-center pt-4 border-t border-border/40 max-w-4xl mx-auto">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={validateAndNext}
              className="px-6 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Continue to Recommendations <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: OUR RECOMMENDATIONS ── */}
      {step === 3 && (
        <div className="space-y-6">
          <RecommendationsStep
            eventType={eventType}
            recommendations={recommendations}
            selectedItemIds={selectedItems.map((i) => i.serviceItemId)}
            onToggleItem={handleToggleItem}
            onApplyAll={handleApplyRecommendations}
          />
          <div className="flex justify-between items-center pt-4 border-t border-border/40 max-w-4xl mx-auto">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={validateAndNext}
              className="px-6 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Continue to Custom Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: CATEGORIZED SERVICE SELECTION ── */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground">Custom Service Selection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse catalog categories and select customized services.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-xl text-xs font-semibold">
              <span className="text-muted-foreground">Total Budget:</span>
              <span className="text-accent-gold font-bold font-heading text-sm">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = activeCategoryTab === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "bg-accent-gold text-black shadow-md shadow-accent-gold/20"
                      : "bg-surface hover:bg-surface-raised border border-border text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Items Grid for active category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonFoodItems
              .filter((item) => {
                if (activeCategoryTab === "All") return true;
                const sub = subcategories.find((s) => s.id === item.subcategory_id);
                const cat = categories.find((c) => c.id === sub?.category_id);
                return cat?.name === activeCategoryTab;
              })
              .map((item) => {
                const isSelected = selectedItems.some((i) => i.serviceItemId === item.id);
                const qty = selectedItems.find((i) => i.serviceItemId === item.id)?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected ? "bg-accent-gold/10 border-accent-gold shadow-md" : "bg-surface border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-accent-gold">₹{item.price?.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({item.pricing_unit === "per_plate" ? "Per Plate" : item.pricing_unit === "per_piece" ? "Per Piece" : "Fixed"})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected ? "bg-accent-gold text-black" : "bg-background border border-border text-foreground hover:bg-surface-raised"
                        }`}
                      >
                        {isSelected ? "Selected" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={validateAndNext}
              className="px-6 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Continue to Food & Catering Engine <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: FOOD & CATERING ENGINE ── */}
      {step === 5 && (
        <div className="space-y-6">
          <FoodSelectionModule
            guestCount={guestCount}
            foodItems={foodItems}
            selectedItems={selectedItems}
            onQuantityChange={handleQuantityChange}
            onSetQuantity={(id, q) => {
              setSelectedItems((prev) => {
                const filtered = prev.filter((i) => i.serviceItemId !== id);
                if (q > 0) return [...filtered, { serviceItemId: id, quantity: q }];
                return filtered;
              });
            }}
          />

          <div className="flex justify-between items-center pt-4 border-t border-border/40 max-w-4xl mx-auto">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl shadow-accent-gold/20"
            >
              {loading ? "Registering Event Case..." : "Submit Event Request"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
