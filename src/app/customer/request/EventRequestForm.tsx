"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEventRequest, saveEventDraft, discardEventDraft } from "../actions";
import { Category, Subcategory, ServiceItem, EventPart, Recommendation } from "@/lib/types";
import EventPartsStep from "@/components/customer/request/EventPartsStep";
import RecommendationsStep from "@/components/customer/request/RecommendationsStep";
import FoodSelectionModule from "@/components/customer/request/FoodSelectionModule";
import { 
  Sparkles, Calendar, MapPin, Users, Clock, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronRight,
  Gift, Heart, Music, Award, Users2, AlertCircle, Phone, Mail,
  Utensils, Camera, Palette, Check, ExternalLink, ShieldCheck,
  Video, RefreshCw, Trash2, Tag, DollarSign, Navigation
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  phoneCountryCode: string;
  whatsappNumber: string;
  whatsappCountryCode: string;
}

interface Props {
  categories: Category[];
  subcategories: Subcategory[];
  items: ServiceItem[];
  eventParts: EventPart[];
  recommendations: Recommendation[];
  packages?: any[];
  userProfile?: UserProfile | null;
  existingDraft?: any;
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

const EVENT_FOR_OPTIONS = [
  "Self",
  "Family Member",
  "Relative",
  "Friend",
  "Company / Organization",
  "Other"
];

const BUDGET_RANGES = [
  "Up to ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000 – ₹10,00,000",
  "₹10,00,000+",
  "Custom Budget"
];

import { ALL_COUNTRY_CODES } from "@/lib/countryCodes";

export default function EventRequestForm({
  categories,
  subcategories,
  items,
  eventParts,
  recommendations,
  userProfile,
  existingDraft,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft Banner State
  const [activeDraft, setActiveDraft] = useState<any>(existingDraft || null);
  const [draftId, setDraftId] = useState<string | undefined>(existingDraft?.id || undefined);

  // Step 1: Details Form
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(userProfile?.phoneCountryCode || "+91");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [whatsappNumber, setWhatsappNumber] = useState(userProfile?.whatsappNumber || "");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(userProfile?.whatsappCountryCode || "+91");

  const [eventType, setEventType] = useState("Wedding");
  const [eventFor, setEventFor] = useState("Self");
  const [celebrantName, setCelebrantName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [durationHours, setDurationHours] = useState<number>(4);
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [minGuestCount, setMinGuestCount] = useState<number>(100);
  const [maxGuestCount, setMaxGuestCount] = useState<number>(200);
  const [budgetRange, setBudgetRange] = useState<string>("₹2,00,000 – ₹5,00,000");
  const [customBudget, setCustomBudget] = useState<number | undefined>(undefined);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [referenceVideoUrl, setReferenceVideoUrl] = useState("");

  // Interactive Map Venue Picker Modal States
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [mapLat, setMapLat] = useState<number>(17.38504);
  const [mapLng, setMapLng] = useState<number>(78.48667);
  const [selectedMapAddress, setSelectedMapAddress] = useState<string>("");
  const [mapLocating, setMapLocating] = useState(false);

  // Step 2: Event Parts
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  // Step 3 & 4 & 5: Service Selections
  const [selectedItems, setSelectedItems] = useState<{ serviceItemId: string; quantity: number }[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(categories[0]?.name || "All");

  // Success Confirmation State
  const [submittedRefNumber, setSubmittedRefNumber] = useState<string | null>(null);

  // Today Date for Min Date constraint
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Handle Resume Draft
  const handleResumeDraft = () => {
    if (!activeDraft) return;
    setDraftId(activeDraft.id);
    setEventType(activeDraft.event_type || "Wedding");
    setEventFor(activeDraft.event_for || "Self");
    setCelebrantName(activeDraft.celebrant_name || "");
    setEventDate(activeDraft.event_date || "");
    setEventTime(activeDraft.event_time || "");
    setDurationHours(activeDraft.duration_hours || 4);
    setVenueAddress(activeDraft.venue_address || activeDraft.location || "");
    setMinGuestCount(activeDraft.min_guest_count || 100);
    setMaxGuestCount(activeDraft.max_guest_count || 200);
    setBudgetRange(activeDraft.budget_range || "₹2,00,000 – ₹5,00,000");
    setCustomBudget(activeDraft.custom_budget || undefined);
    setSpecialRequirements(activeDraft.special_requirements || "");
    setReferenceVideoUrl(activeDraft.reference_video_url || "");
    setActiveDraft(null); // Hide banner
  };

  // Handle Discard Draft
  const handleDiscardDraft = async () => {
    if (!activeDraft) return;
    try {
      await discardEventDraft(activeDraft.id);
      setActiveDraft(null);
    } catch (err: any) {
      setError("Failed to discard draft.");
    }
  };

  // 1. Detect user GPS location for venue
  const handleDetectVenueLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setMapLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapLat(lat);
        setMapLng(lng);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setSelectedMapAddress(data.display_name);
              setVenueAddress(data.display_name);
            } else {
              const fallback = `Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
              setSelectedMapAddress(fallback);
              setVenueAddress(fallback);
            }
          }
        } catch (_) {
          const fallback = `Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
          setSelectedMapAddress(fallback);
          setVenueAddress(fallback);
        } finally {
          setMapLocating(false);
        }
      },
      (err) => {
        setMapLocating(false);
        setError(`Unable to detect location: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 2. Search address using OpenStreetMap Nominatim
  const handleSearchVenueAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    setMapSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setMapSearchResults(data || []);
      }
    } catch (_) {
    } finally {
      setMapSearching(false);
    }
  };

  // 3. Select result from map search list
  const handleSelectMapSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapLat(lat);
    setMapLng(lng);
    setSelectedMapAddress(result.display_name);
  };

  // 4. Confirm Map Location
  const handleConfirmMapLocation = () => {
    if (selectedMapAddress) {
      setVenueAddress(selectedMapAddress);
    }
    setShowMapModal(false);
  };

  // Filter food items vs non-food items
  const foodCategoryObj = categories.find((c) => c.name.toLowerCase().includes("food") || c.name.toLowerCase().includes("catering"));
  const foodSubcategoryIds = subcategories.filter((s) => s.category_id === foodCategoryObj?.id).map((s) => s.id);
  const foodItems = items.filter((i) => foodSubcategoryIds.includes(i.subcategory_id) || i.food_category !== "general");
  const nonFoodItems = items.filter((i) => !foodItems.includes(i));

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
    const effGuestCount = maxGuestCount || minGuestCount || 100;
    selectedItems.forEach((sel) => {
      const item = items.find((i) => i.id === sel.serviceItemId);
      if (item) {
        const unitPrice = Number(item.price);
        const unit = item.pricing_unit || (item.pricing_type === "per_plate" ? "per_plate" : "fixed");
        if (unit === "per_plate") {
          sum += unitPrice * effGuestCount * sel.quantity;
        } else {
          sum += unitPrice * sel.quantity;
        }
      }
    });
    return sum;
  }, [selectedItems, items, maxGuestCount, minGuestCount]);

  // Stage 1 Save & Next
  const handleStage1SaveAndNext = async () => {
    setError(null);

    if (!fullName.trim()) return setError("Full Name is required.");
    if (!phoneNumber.trim() || phoneNumber.length < 10) return setError("Please enter a valid Phone Number.");
    if (!eventDate) return setError("Event Date is required.");
    if (eventDate < todayDate) return setError("Past dates cannot be selected for an event.");
    if (!eventTime) return setError("Start Time is required.");
    if (!venueAddress.trim()) return setError("Venue Address is required.");
    if (minGuestCount <= 0 || maxGuestCount <= 0) return setError("Guest counts must be positive numbers.");
    if (minGuestCount > maxGuestCount) return setError("Minimum guests cannot be greater than maximum guests.");

    if (referenceVideoUrl && !/^https?:\/\//i.test(referenceVideoUrl.trim())) {
      return setError("Please provide a valid HTTP or HTTPS Reference Video Link URL.");
    }

    setSavingDraft(true);
    try {
      const res = await saveEventDraft({
        draftId,
        eventType,
        eventFor,
        celebrantName,
        eventDate,
        eventTime,
        durationHours,
        venueName,
        venueAddress,
        minGuestCount,
        maxGuestCount,
        budgetRange,
        customBudget,
        specialRequirements,
        referenceVideoUrl,
        whatsappNumber,
      });

      if (res.draftId) {
        setDraftId(res.draftId);
      }
      setStep(2); // Proceed to Stage 2: Event Parts
    } catch (err: any) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
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
        requestId: draftId,
        eventType,
        eventDate,
        location: venueAddress,
        guestCount: maxGuestCount || minGuestCount,
        whatsappNumber,
        eventFor,
        celebrantName,
        eventTime,
        durationHours,
        venueAddress,
        minGuestCount,
        maxGuestCount,
        budgetRange,
        customBudget,
        specialRequirements,
        referenceVideoUrl,
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
      <div className="max-w-2xl mx-auto bg-surface border border-accent-gold/40 rounded-3xl p-8 sm:p-10 space-y-6 text-center animate-scale-in shadow-2xl relative overflow-hidden select-none">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-accent-gold">Request Successfully Registered</span>
          <h2 className="text-3xl font-light font-heading text-foreground">Namaste, {fullName}!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto font-light">
            Your event request for <strong className="text-foreground font-semibold">{eventType}</strong> has been submitted to SAI EVENTS.
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
              <span className="text-muted-foreground">Event Date & Time:</span>
              <span className="font-semibold text-foreground">{eventDate} {eventTime && `at ${eventTime}`} ({durationHours} Hrs)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">{venueAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests Range & Total:</span>
              <span className="font-semibold text-foreground">{minGuestCount}–{maxGuestCount} Guests · <span className="text-accent-gold font-mono">₹{grandTotal.toLocaleString("en-IN")}</span></span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Our Senior Event Coordinator will contact you on <strong className="text-foreground">{phoneCountryCode} {phoneNumber}</strong> to review your planning parameters and assign execution teams.
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
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* ── Active Draft Resumption Banner ── */}
      {activeDraft && step === 1 && (
        <div className="p-5 rounded-3xl bg-surface border border-accent-gold/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center text-accent-gold shrink-0 mt-0.5">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold text-accent-gold tracking-widest block">Unfinished Draft Found</span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">
                Continue Planning Your {activeDraft.event_type} Event?
              </h4>
              <p className="text-xs text-muted-foreground font-light mt-0.5">
                Last updated on {formatDate(activeDraft.updated_at || activeDraft.created_at)} · Progress: Step 1 of 5
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-4 py-2 bg-surface-raised border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </button>
            <button
              type="button"
              onClick={handleResumeDraft}
              className="px-5 py-2 bg-accent-gold text-black font-bold text-xs rounded-xl shadow transition hover:brightness-110 cursor-pointer"
            >
              Continue Draft
            </button>
          </div>
        </div>
      )}

      {/* Step Tracker Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-border/40 pb-5 overflow-x-auto scrollbar-none">
        {[
          { num: 1, label: "Event Details" },
          { num: 2, label: "Sub-Events" },
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

      {/* ── STEP 1: EVENT & CONTACT DETAILS FORM ── */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in-up">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-accent-gold">Stage One</span>
            <h2 className="text-2xl font-light font-heading text-foreground">Stage 1: Event & Contact Details</h2>
            <p className="text-xs text-muted-foreground font-light">
              Contact credentials are pre-filled from your profile. Specify your event parameters below.
            </p>
          </div>

          <div className="space-y-6 text-xs">

            {/* Section A: Contact Details (Prefilled from Profile) */}
            <div className="p-4 rounded-2xl bg-surface-raised border border-border/80 space-y-4">
              <h3 className="text-[10.5px] uppercase tracking-wider font-extrabold text-accent-gold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent-gold" /> Contact Details (Profile Prefill)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={fullName}
                    className="w-full px-3.5 py-2.5 bg-background/50 border border-border/60 rounded-xl text-muted-foreground opacity-80 cursor-not-allowed text-xs font-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 bg-background/50 border border-border/60 rounded-xl text-muted-foreground opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Phone Number</label>
                  <input
                    type="text"
                    disabled
                    value={`${phoneCountryCode} ${phoneNumber}`}
                    className="w-full px-3.5 py-2.5 bg-background/50 border border-border/60 rounded-xl text-muted-foreground opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">WhatsApp Number</label>
                  <input
                    type="text"
                    disabled
                    value={`${whatsappCountryCode} ${whatsappNumber}`}
                    className="w-full px-3.5 py-2.5 bg-background/50 border border-border/60 rounded-xl text-muted-foreground opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Event Information */}
            <div className="space-y-4">
              <h3 className="text-[10.5px] uppercase tracking-wider font-extrabold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Event Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Event Type */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground cursor-pointer text-xs"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-surface text-foreground">{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Event For */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Event For *</label>
                  <select
                    value={eventFor}
                    onChange={(e) => setEventFor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground cursor-pointer text-xs"
                  >
                    {EVENT_FOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-surface text-foreground">{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Celebrant / Event Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Celebrant / Couple / Event Name *</label>
                  <input
                    type="text"
                    required
                    value={celebrantName}
                    onChange={(e) => setCelebrantName(e.target.value)}
                    placeholder="e.g. Rahul & Sneha's Wedding / Aarav's 1st Birthday"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground placeholder:text-muted-foreground/60 text-xs font-light"
                  />
                </div>

                {/* Event Date (min = today) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Event Date * (Today or Future)</label>
                  <input
                    type="date"
                    required
                    min={todayDate}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs [color-scheme:dark]"
                  />
                </div>

                {/* Start Time & Duration */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Start Time & Duration *</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs [color-scheme:dark]"
                    />
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-1/2 px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs cursor-pointer"
                    >
                      <option value={2} className="bg-surface">2 Hours</option>
                      <option value={4} className="bg-surface">4 Hours</option>
                      <option value={6} className="bg-surface">6 Hours</option>
                      <option value={8} className="bg-surface">Full Day (8 Hrs)</option>
                      <option value={12} className="bg-surface">Multi-Day / 12+ Hrs</option>
                    </select>
                  </div>
                </div>

                {/* Venue Name & Address with Map Action Buttons */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">
                      Venue Name & Full Address *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDetectVenueLocation}
                        disabled={mapLocating}
                        className="text-[10px] text-accent-gold hover:underline flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
                      >
                        <Navigation className="w-3 h-3 text-accent-gold" />
                        {mapLocating ? "Detecting..." : "Use Current GPS"}
                      </button>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (venueAddress) setSelectedMapAddress(venueAddress);
                          setShowMapModal(true);
                        }}
                        className="text-[10px] text-accent-gold hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-accent-gold" />
                        Select on Map
                      </button>
                    </div>
                  </div>

                  <textarea
                    required
                    rows={2}
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Taj Krishna Banquets, Road No 1, Banjara Hills, Hyderabad"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground placeholder:text-muted-foreground/60 text-xs font-light resize-none leading-relaxed"
                  />
                </div>

                {/* Guest Count Range */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Minimum Guests *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={minGuestCount}
                    onChange={(e) => setMinGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Maximum Guests *</label>
                  <input
                    type="number"
                    min={minGuestCount}
                    required
                    value={maxGuestCount}
                    onChange={(e) => setMaxGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs font-mono"
                  />
                </div>

                {/* Target Budget Range */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Target Budget Range (INR) *</label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground cursor-pointer text-xs"
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b} className="bg-surface text-foreground">{b}</option>
                    ))}
                  </select>
                </div>

                {budgetRange === "Custom Budget" && (
                  <div className="space-y-1.5 sm:col-span-2 animate-fade-in">
                    <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Custom Budget Amount (INR) *</label>
                    <input
                      type="number"
                      value={customBudget || ""}
                      onChange={(e) => setCustomBudget(Number(e.target.value) || undefined)}
                      placeholder="e.g. 1500000"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground text-xs font-mono"
                    />
                  </div>
                )}

                {/* Special Requirements */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px]">Special Requirements / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="Describe theme expectations, VIP arrangements, accessibility requirements, etc."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground placeholder:text-muted-foreground/60 text-xs font-light resize-none leading-relaxed"
                  />
                </div>

                {/* Reference Video Link */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-muted-foreground uppercase text-[9.5px] flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-accent-gold" /> Reference Video Link (YouTube / Vimeo / Web URL)
                  </label>
                  <input
                    type="url"
                    value={referenceVideoUrl}
                    onChange={(e) => setReferenceVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=example"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground placeholder:text-muted-foreground/60 text-xs font-mono"
                  />
                </div>

              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={savingDraft}
              onClick={handleStage1SaveAndNext}
              className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:brightness-110 disabled:opacity-50 text-black font-bold rounded-xl transition shadow text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span>{savingDraft ? "Saving Draft..." : "Save & Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: SUB-EVENTS / EVENT PARTS ── */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in-up">
          <EventPartsStep
            eventType={eventType}
            availableParts={eventParts}
            selectedPartIds={selectedPartIds}
            onChange={setSelectedPartIds}
          />

          <div className="flex justify-between items-center max-w-4xl mx-auto pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 bg-surface border border-border hover:bg-surface-raised text-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-7 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: RECOMMENDATIONS ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in-up">
          <RecommendationsStep
            eventType={eventType}
            recommendations={recommendations}
            selectedItemIds={selectedItems.map((i) => i.serviceItemId)}
            onToggleItem={handleToggleItem}
            onApplyAll={handleApplyRecommendations}
          />

          <div className="flex justify-between items-center max-w-4xl mx-auto pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 bg-surface border border-border hover:bg-surface-raised text-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sub-Events
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-7 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: NON-FOOD SERVICES SELECTION ── */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface border border-border rounded-2xl p-4.5">
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">Design, Decor & Execution Services</h3>
              <p className="text-xs text-muted-foreground font-light">Select Verified Services for your {eventType}.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Estimated Services Total</span>
              <span className="text-lg font-bold font-mono text-accent-gold">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nonFoodItems.map((item) => {
              const isSelected = selectedItems.some((s) => s.serviceItemId === item.id);
              const selObj = selectedItems.find((s) => s.serviceItemId === item.id);
              const mediaUrl = (item as any).service_item_media?.[0]?.media_url;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    isSelected ? "bg-accent-gold/10 border-accent-gold" : "bg-surface border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-accent-gold shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-light">{item.description}</p>
                      <div className="text-xs font-mono font-bold text-accent-gold pt-0.5">
                        ₹{Number(item.price).toLocaleString("en-IN")} <span className="text-[10px] text-muted-foreground font-normal">/ {item.pricing_unit || item.pricing_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                        isSelected ? "bg-accent-gold text-black" : "bg-surface-raised border border-border text-foreground hover:border-accent-gold/40"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Service"}
                    </button>
                    {isSelected && (
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold">{selObj?.quantity || 1}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs font-bold"
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

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 bg-surface border border-border hover:bg-surface-raised text-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-7 py-3 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Food Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: FOOD ENGINE & SUBMIT ── */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
          <FoodSelectionModule
            foodItems={foodItems}
            guestCount={maxGuestCount || minGuestCount}
            selectedItems={selectedItems}
            onQuantityChange={handleQuantityChange}
            onSetQuantity={(id, qty) => {
              setSelectedItems((prev) => {
                const filtered = prev.filter((i) => i.serviceItemId !== id);
                if (qty > 0) return [...filtered, { serviceItemId: id, quantity: qty }];
                return filtered;
              });
            }}
          />

          <div className="p-6 rounded-3xl bg-surface border border-accent-gold/40 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest block">Final Estimated Investment</span>
              <div className="text-3xl font-light font-heading text-foreground mt-0.5">
                ₹{grandTotal.toLocaleString("en-IN")} <span className="text-xs text-muted-foreground font-normal">INR</span>
              </div>
              <p className="text-xs text-muted-foreground font-light mt-1">
                Includes verified service items, catering estimates, and operational coordination.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-3 bg-surface-raised border border-border hover:border-border/80 text-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:brightness-110 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-accent-gold/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Submitting Request..." : "Submit Event Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE MAP VENUE SELECTION MODAL ── */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-border/40 pb-4">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-accent-gold tracking-widest block">Interactive Venue Locator</span>
                <h3 className="text-lg font-bold text-foreground font-heading mt-0.5">Select Event Location on Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-mono font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchVenueAddress} className="flex gap-2">
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search venue name, landmark, street, or city (e.g. Banjara Hills)..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-gold/40"
              />
              <button
                type="submit"
                disabled={mapSearching}
                className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {mapSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {mapSearchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-xl bg-background divide-y divide-border/40 text-xs">
                {mapSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMapSearchResult(res)}
                    className="w-full text-left p-3 hover:bg-surface-raised transition text-foreground font-light flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span className="truncate">{res.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Embedded OpenStreetMap Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-background h-64 w-full">
              <iframe
                title="Venue Map Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.008},${mapLat - 0.008},${mapLng + 0.008},${mapLat + 0.008}&layer=mapnik&marker=${mapLat},${mapLng}`}
                className="w-full h-full filter brightness-90 contrast-105"
              />
              
              {/* Floating Quick GPS Button on Map */}
              <button
                type="button"
                onClick={handleDetectVenueLocation}
                className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-md border border-border text-foreground hover:text-accent-gold px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-accent-gold" /> Use My Location
              </button>
            </div>

            {/* Selected Location Text Area */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] uppercase font-bold text-accent-gold tracking-wider block">Selected Venue Address:</label>
              <textarea
                rows={2}
                value={selectedMapAddress || venueAddress}
                onChange={(e) => setSelectedMapAddress(e.target.value)}
                placeholder="Selected location address will appear here..."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground font-light resize-none focus:outline-none"
              />
            </div>

            {/* Popular Fast Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Popular Venue Areas:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Banjara Hills, Hyderabad",
                  "Jubilee Hills Banquets, Hyderabad",
                  "Hitec City Convention Center, Hyderabad",
                  "Indiranagar, Bengaluru",
                  "Juhu Beach Banquets, Mumbai"
                ].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedMapAddress(loc);
                      setVenueAddress(loc);
                    }}
                    className="px-2.5 py-1 bg-background border border-border hover:border-accent-gold/40 text-muted-foreground hover:text-foreground text-[10px] rounded-lg transition cursor-pointer"
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 bg-surface-raised border border-border text-muted-foreground font-bold text-xs rounded-xl hover:text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-6 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
              >
                Confirm Venue Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
