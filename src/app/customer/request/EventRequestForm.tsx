"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createEventRequest, saveEventDraft, discardEventDraft } from "../actions";
import { Category, Subcategory, ServiceItem, EventPart, Recommendation } from "@/lib/types";
import EventPartsStep from "@/components/customer/request/EventPartsStep";
import RecommendationsStep from "@/components/customer/request/RecommendationsStep";
import CategoryServiceCatalog from "@/components/customer/request/CategoryServiceCatalog";
import FoodSelectionModule from "@/components/customer/request/FoodSelectionModule";
import { 
  Sparkles, Calendar, MapPin, Users, Clock, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronRight,
  Gift, Heart, Music, Award, Users2, AlertCircle, Phone, Mail,
  Utensils, Camera, Palette, Check, ExternalLink, ShieldCheck,
  Video, RefreshCw, Trash2, Tag, DollarSign, Navigation, Plus, UserPlus,
  FolderHeart, Image as ImageIcon, X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getStoredCustomerMedia } from "@/components/customer/CustomerMediaStudio";

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
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [timeHour, setTimeHour] = useState("10");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timePeriod, setTimePeriod] = useState("AM");
  const [durationHours, setDurationHours] = useState<number>(4);
  const [durationSelection, setDurationSelection] = useState<string>("4");
  const [customDurationValue, setCustomDurationValue] = useState<string>("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [minGuestCount, setMinGuestCount] = useState<number>(100);
  const [maxGuestCount, setMaxGuestCount] = useState<number>(200);
  const [budgetRange, setBudgetRange] = useState<string>("₹2,00,000 – ₹5,00,000");
  const [customBudget, setCustomBudget] = useState<number | undefined>(undefined);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [referenceVideoUrl, setReferenceVideoUrl] = useState("");

  // Reference Images State (Up to 10 max attached images)
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [showMediaPickerModal, setShowMediaPickerModal] = useState<boolean>(false);

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - referenceImages.length;
    if (remainingSlots <= 0) {
      alert("Maximum 10 reference images allowed.");
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const res = evt.target.result as string;
          setReferenceImages((prev) => {
            if (prev.length >= 10) return prev;
            if (prev.includes(res)) return prev;
            return [...prev, res];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Ref for auto-focusing time field after date selection
  const timeHourRef = useRef<HTMLSelectElement>(null);

  // Additional Contacts State (Up to 3 optional secondary contact persons)
  const [additionalContacts, setAdditionalContacts] = useState<{ name: string; phone: string; relation?: string }[]>([]);

  // Synchronize 12-hour time selectors into eventTime state safely
  useEffect(() => {
    let isMounted = true;
    if (timeHour && timeMinute && timePeriod && isMounted) {
      setEventTime(`${timeHour}:${timeMinute} ${timePeriod}`);
    }
    return () => {
      isMounted = false;
    };
  }, [timeHour, timeMinute, timePeriod]);

  // Interactive Map Venue Picker Modal States
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [mapLat, setMapLat] = useState<number>(17.38504);
  const [mapLng, setMapLng] = useState<number>(78.48667);
  const [selectedMapAddress, setSelectedMapAddress] = useState<string>("");
  const [mapLocating, setMapLocating] = useState(false);

  // Step 2: Event Parts & Sub-Event Configurations
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [subEventDetails, setSubEventDetails] = useState<Record<string, any>>({});

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
    const dHours = activeDraft.duration_hours || 4;
    setDurationHours(dHours);
    if ([2, 4, 6, 8, 12].includes(dHours)) {
      setDurationSelection(dHours.toString());
      setCustomDurationValue("");
    } else {
      setDurationSelection("custom");
      setCustomDurationValue(dHours.toString());
    }
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
      const validContacts = additionalContacts.filter(c => c.name.trim() && c.phone.trim());
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
        additionalContacts: validContacts,
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
      const validContacts = additionalContacts.filter(c => c.name.trim() && c.phone.trim());

      const eventPartsConfig = selectedPartIds.map((pId) => {
        const partObj = eventParts.find((p) => p.id === pId);
        const detail = subEventDetails[pId] || { venueLocation: "", requiredServices: [] };
        return {
          eventPartId: pId,
          eventPartName: partObj?.name || "Sub Event",
          eventDate: eventDate,
          venueAddress: detail.venueLocation || venueAddress,
          venueLocation: detail.venueLocation || venueAddress,
          requiredServices: detail.requiredServices || ["Decor & Stage Setup", "Food & Catering"],
          planningMode: "CUSTOM",
        };
      });

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
        additionalContacts: validContacts,
        eventPartIds: selectedPartIds,
        eventPartsConfig,
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
      <div className="max-w-2xl mx-auto border border-[#a17a34]/35 bg-[#f7f0e6] dark:border-[#d2b56b]/25 dark:bg-[#191b17] p-8 sm:p-10 space-y-6 text-center animate-scale-in shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#143d2b] via-[#a17a34] to-[#143d2b] dark:from-[#d2b56b] dark:via-[#8f7338] dark:to-[#d2b56b]" />

        <div className="w-16 h-16 rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#a17a34] dark:text-[#d2b56b]">Request Successfully Registered</span>
          <h2 className="text-3xl font-light font-heading text-[#143d2b] dark:text-[#f0e8db]">Namaste, {fullName}!</h2>
          <p className="text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/45 leading-relaxed max-w-lg mx-auto font-light">
            Your event request for <strong className="text-foreground font-semibold">{eventType}</strong> has been submitted to SAI EVENTS.
          </p>
        </div>

        {/* Reference & SLA Box */}
        <div className="p-6 rounded-none bg-background border border-[#173d2c]/10 dark:border-white/[0.08] space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#173d2c]/10 dark:border-white/[0.08]/50 pb-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45">Reference Booking Number</span>
              <div className="text-xl font-bold font-mono text-[#a17a34] dark:text-[#d2b56b]">{submittedRefNumber}</div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45">Estimated Response Time</span>
              <div className="text-xs font-bold text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" /> Within 2 Business Hours
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event Date & Time:</span>
              <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">{eventDate} {eventTime && `at ${eventTime}`} ({durationHours} Hrs)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db] truncate max-w-[220px]">{venueAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests Range & Total:</span>
              <span className="font-semibold text-[#143d2b] dark:text-[#f0e8db]">{minGuestCount}–{maxGuestCount} Guests · <span className="text-accent-gold font-mono">₹{grandTotal.toLocaleString("en-IN")}</span></span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#a17a34]/[0.06] border border-[#a17a34] dark:border-[#d2b56b]/20 rounded-none flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-[#a17a34] dark:text-[#d2b56b] shrink-0 mt-0.5" />
          <p className="text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/45 leading-relaxed font-light">
            Our Senior Event Coordinator will contact you on <strong className="text-foreground">{phoneCountryCode} {phoneNumber}</strong> to review your planning parameters and assign execution teams.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/customer/dashboard")}
            className="px-6 py-3.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-none text-xs uppercase tracking-wider transition shadow-md shadow-[#a17a34]/10 cursor-pointer"
          >
            Go to My Events Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 sm:px-2">
      
      {/* ── Active Draft Resumption Banner ── */}
      {activeDraft && step === 1 && (
        <div className="p-5 bg-[#fbf7f0] dark:bg-[#161813] border border-[#a17a34]/40 dark:border-[#d2b56b]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 bg-[#a17a34]/10 border border-[#a17a34]/30 flex items-center justify-center text-[#a17a34] dark:text-[#d2b56b] shrink-0 mt-0.5">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[8px] uppercase font-bold text-[#a17a34] dark:text-[#d2b56b] tracking-[0.24em] block">Unfinished Draft Found</span>
              <h4 className="text-base font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>
                Continue Planning Your {activeDraft.event_type} Event?
              </h4>
              <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light mt-0.5">
                Last updated on {formatDate(activeDraft.updated_at || activeDraft.created_at)} · Progress: Step 1 of 5
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-4 py-2.5 border border-[#173d2c]/15 text-[#173d2c]/60 hover:text-red-500 hover:border-red-500/30 text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Discard
            </button>
            <button
              type="button"
              onClick={handleResumeDraft}
              className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] shadow transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer"
            >
              Continue Draft
            </button>
          </div>
        </div>
      )}

      {/* Step Tracker Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-5 overflow-x-auto scrollbar-none">
        {[
          { num: 1, label: "Event Details" },
          { num: 2, label: "Sub-Events" },
          { num: 3, label: "Recommendations" },
          { num: 4, label: "Services" },
          { num: 5, label: "Food Engine" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                step === s.num
                  ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-sm"
                  : step > s.num
                  ? "bg-[#a17a34]/20 text-[#a17a34] dark:text-[#d2b56b]"
                  : "border border-[#173d2c]/10 bg-[#f3eadf]/40 dark:border-white/[0.08] dark:bg-white/[0.02] text-[#173d2c]/40 dark:text-white/30"
              }`}
            >
              {s.num}
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-[0.2em] hidden sm:inline ${step === s.num ? "text-[#143d2b] dark:text-[#f0e8db]" : "text-[#173d2c]/40 dark:text-white/30"}`}>
              {s.label}
            </span>
            {s.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-[#173d2c]/30 dark:text-white/20 ml-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2.5 max-w-2xl mx-auto animate-fade-in font-light">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── STEP 1: EVENT & CONTACT DETAILS FORM ── */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] p-6 sm:p-8 lg:p-10 space-y-7 shadow-sm animate-fade-in-up">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />
              <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9a742e] dark:text-[#d2b56b]">Stage One</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal font-heading tracking-[-0.03em] text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Stage 1: Event & Contact Details
            </h2>
            <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light">
              Contact credentials are pre-filled from your profile. Specify your event parameters below.
            </p>
          </div>

          <div className="space-y-6 text-xs">

            {/* Section A: Contact Details (Prefilled from Profile) */}
            <div className="p-4 rounded-none border border-[#173d2c]/10 bg-[#fffaf3]/60 dark:border-white/[0.08] dark:bg-white/[0.025] space-y-4">
              <h3 className="text-[10.5px] uppercase tracking-wider font-extrabold text-[#a17a34] dark:text-[#d2b56b] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" /> Contact Details (Profile Prefill)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={fullName}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/10 bg-[#efe8dd]/70 dark:border-white/[0.06] dark:bg-black/10 text-[#173d2c]/50 dark:text-[#eee5d7]/45 opacity-80 cursor-not-allowed text-xs font-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/10 bg-[#efe8dd]/70 dark:border-white/[0.06] dark:bg-black/10 text-[#173d2c]/50 dark:text-[#eee5d7]/45 opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Phone Number</label>
                  <input
                    type="text"
                    disabled
                    value={`${phoneCountryCode} ${phoneNumber}`}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/10 bg-[#efe8dd]/70 dark:border-white/[0.06] dark:bg-black/10 text-[#173d2c]/50 dark:text-[#eee5d7]/45 opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">WhatsApp Number</label>
                  <input
                    type="text"
                    disabled
                    value={`${whatsappCountryCode} ${whatsappNumber}`}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/10 bg-[#efe8dd]/70 dark:border-white/[0.06] dark:bg-black/10 text-[#173d2c]/50 dark:text-[#eee5d7]/45 opacity-80 cursor-not-allowed text-xs font-mono"
                  />
                </div>
              </div>

              {/* Additional Secondary Contacts Section (Up to 3 Optional Contacts) */}
              <div className="pt-3 border-t border-[#173d2c]/10 dark:border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#143d2b] dark:text-[#f0e8db] tracking-wider block">
                      Additional Event Contacts (Optional - Up to 3)
                    </span>
                    <span className="text-[9px] text-[#173d2c]/55 dark:text-[#eee5d7]/45 block font-light">
                      Add secondary contact persons for event coordination (e.g., Co-Host, Family Member, Manager)
                    </span>
                  </div>
                  {additionalContacts.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setAdditionalContacts(prev => [...prev, { name: "", phone: "", relation: "Co-Host" }])}
                      className="px-3 py-1.5 bg-[#a17a34]/15 border border-[#a17a34]/40 text-[#9a742e] dark:text-[#d2b56b] hover:bg-[#a17a34]/25 text-[8px] font-bold uppercase tracking-[0.18em] transition cursor-pointer flex items-center gap-1 shrink-0 self-start sm:self-auto shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Additional Contact</span>
                    </button>
                  )}
                </div>

                {additionalContacts.map((contact, idx) => (
                  <div key={idx} className="p-3.5 bg-[#f3eadf]/40 dark:bg-white/[0.025] border border-[#173d2c]/12 dark:border-white/[0.08] space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#173d2c]/10 dark:border-white/[0.06] pb-2">
                      <span className="text-[8px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-[0.2em]">
                        Secondary Contact #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdditionalContacts(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition flex items-center gap-1 text-[9px] uppercase font-bold"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#173d2c]/50 dark:text-[#eee5d7]/45">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={contact.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdditionalContacts(prev => prev.map((c, i) => i === idx ? { ...c, name: val } : c));
                          }}
                          placeholder="e.g. Harish Kumar"
                          className="w-full px-3 py-2 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/12 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] focus:border-[#a17a34] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#173d2c]/50 dark:text-[#eee5d7]/45">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={contact.phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdditionalContacts(prev => prev.map((c, i) => i === idx ? { ...c, phone: val } : c));
                          }}
                          placeholder="e.g. +91 9876543210"
                          className="w-full px-3 py-2 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/12 dark:border-white/10 text-xs font-mono text-[#143d2b] dark:text-[#f0e8db] focus:border-[#a17a34] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#173d2c]/50 dark:text-[#eee5d7]/45">Role / Relationship</label>
                        <select
                          value={contact.relation || "Co-Host"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdditionalContacts(prev => prev.map((c, i) => i === idx ? { ...c, relation: val } : c));
                          }}
                          className="w-full px-3 py-2 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/12 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] cursor-pointer focus:border-[#a17a34] focus:outline-none"
                        >
                          <option value="Co-Host" className="bg-[#f8f2e9] dark:bg-[#171914]">Co-Host</option>
                          <option value="Event Manager / Contact" className="bg-[#f8f2e9] dark:bg-[#171914]">Event Manager / Contact</option>
                          <option value="Family Member" className="bg-[#f8f2e9] dark:bg-[#171914]">Family Member</option>
                          <option value="Venue Coordinator" className="bg-[#f8f2e9] dark:bg-[#171914]">Venue Coordinator</option>
                          <option value="Other" className="bg-[#f8f2e9] dark:bg-[#171914]">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Event Information */}
            <div className="space-y-4">
              <h3 className="text-[10.5px] uppercase tracking-wider font-extrabold text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" /> Event Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Event Type */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] cursor-pointer text-xs"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Event For */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Event For *</label>
                  <select
                    value={eventFor}
                    onChange={(e) => setEventFor(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] cursor-pointer text-xs"
                  >
                    {EVENT_FOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Celebrant / Event Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Celebrant / Couple / Event Name *</label>
                  <input
                    type="text"
                    required
                    value={celebrantName}
                    onChange={(e) => setCelebrantName(e.target.value)}
                    placeholder="e.g. Rahul & Sneha's Wedding / Aarav's 1st Birthday"
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] placeholder:text-muted-foreground/60 text-xs font-light"
                  />
                </div>

                {/* Event Date (min = today) - Auto opens calendar & focuses time on pick */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Event Date * (Today or Future)</label>
                  <input
                    type="date"
                    required
                    min={todayDate}
                    value={eventDate}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEventDate(val);
                      if (val && timeHourRef.current) {
                        setTimeout(() => {
                          try {
                            timeHourRef.current?.focus();
                            timeHourRef.current?.showPicker?.();
                          } catch (_) {}
                        }, 100);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs cursor-pointer font-mono"
                  />
                </div>

                {/* Event Start Time (12-Hour Format with AM/PM) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">
                    Start Time (12-Hour Format) * ({eventTime})
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      ref={timeHourRef}
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className="w-1/3 px-2.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono cursor-pointer"
                    >
                      {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => (
                        <option key={h} value={h} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">
                          {h} Hr
                        </option>
                      ))}
                    </select>

                    <span className="text-[#173d2c]/40 dark:text-[#eee5d7]/40 font-mono font-bold">:</span>

                    <select
                      value={timeMinute}
                      onChange={(e) => setTimeMinute(e.target.value)}
                      className="w-1/3 px-2.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono cursor-pointer"
                    >
                      {["00","15","30","45"].map(m => (
                        <option key={m} value={m} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">
                          {m} Min
                        </option>
                      ))}
                    </select>

                    <select
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      className="w-1/3 px-2.5 py-2.5 border border-[#a17a34]/35 dark:border-[#d2b56b]/35 bg-[#a17a34]/10 dark:bg-[#d2b56b]/10 text-[#9a742e] dark:text-[#d2b56b] text-xs font-bold font-mono cursor-pointer"
                    >
                      <option value="AM" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">AM</option>
                      <option value="PM" className="bg-[#f8f2e9] dark:bg-[#171914] text-[#143d2b] dark:text-[#f0e8db]">PM</option>
                    </select>
                  </div>
                </div>

                {/* Event Duration with Custom Input Option */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">
                    Event Duration * ({durationHours} {durationHours === 1 ? "Hour" : "Hours"})
                  </label>
                  <div className="space-y-2">
                    <select
                      value={durationSelection}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDurationSelection(val);
                        if (val !== "custom") {
                          setDurationHours(Number(val));
                        } else {
                          const num = Number(customDurationValue) || 5;
                          setDurationHours(num);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs cursor-pointer font-medium"
                    >
                      <option value="2" className="bg-[#f8f2e9] dark:bg-[#171914]">2 Hours</option>
                      <option value="4" className="bg-[#f8f2e9] dark:bg-[#171914]">4 Hours (Standard)</option>
                      <option value="6" className="bg-[#f8f2e9] dark:bg-[#171914]">6 Hours</option>
                      <option value="8" className="bg-[#f8f2e9] dark:bg-[#171914]">Full Day (8 Hours)</option>
                      <option value="12" className="bg-[#f8f2e9] dark:bg-[#171914]">12 Hours (Multi-Event)</option>
                      <option value="custom" className="bg-[#f8f2e9] dark:bg-[#171914]">Custom Duration (Specify Hours)...</option>
                    </select>

                    {durationSelection === "custom" && (
                      <div className="flex items-center gap-2 animate-fade-in pt-0.5">
                        <input
                          type="number"
                          min={1}
                          max={168}
                          required
                          value={customDurationValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomDurationValue(val);
                            setDurationHours(Number(val) || 1);
                          }}
                          placeholder="e.g. 3, 5, 14, 24"
                          className="flex-1 px-3 py-2 border border-[#a17a34]/35 bg-[#fffaf3] dark:border-[#d2b56b]/35 dark:bg-[#11130f] text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono focus:outline-none focus:border-[#a17a34]"
                        />
                        <span className="text-xs font-bold text-[#a17a34] dark:text-[#d2b56b] shrink-0">Hours</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue Name & Address with Map Action Buttons */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">
                      Venue Name & Full Address *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDetectVenueLocation}
                        disabled={mapLocating}
                        className="text-[10px] text-[#a17a34] dark:text-[#d2b56b] hover:underline flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
                      >
                        <Navigation className="w-3 h-3 text-[#a17a34] dark:text-[#d2b56b]" />
                        {mapLocating ? "Detecting..." : "Use Current GPS"}
                      </button>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (venueAddress) setSelectedMapAddress(venueAddress);
                          setShowMapModal(true);
                        }}
                        className="text-[10px] text-[#a17a34] dark:text-[#d2b56b] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-[#a17a34] dark:text-[#d2b56b]" />
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
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] placeholder:text-muted-foreground/60 text-xs font-light resize-none leading-relaxed"
                  />
                </div>

                {/* Guest Count Range */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Minimum Guests *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={minGuestCount}
                    onChange={(e) => setMinGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Maximum Guests *</label>
                  <input
                    type="number"
                    min={minGuestCount}
                    required
                    value={maxGuestCount}
                    onChange={(e) => setMaxGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono"
                  />
                </div>

                {/* Target Budget Range - Single Choice Radio Selection */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">
                    Target Budget Range (INR) *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {BUDGET_RANGES.map((b) => {
                      const isChecked = budgetRange === b;
                      return (
                        <label
                          key={b}
                          className={`p-3 border transition cursor-pointer flex items-center gap-2.5 text-xs font-medium ${
                            isChecked
                              ? "bg-[#143d2b]/10 border-[#143d2b] dark:bg-[#d2b56b]/10 dark:border-[#d2b56b] text-[#143d2b] dark:text-[#f0e8db]"
                              : "bg-[#fffaf3]/75 dark:bg-[#11130f]/60 border-[#173d2c]/12 dark:border-white/10 text-[#173d2c]/80 dark:text-[#eee5d7]/70 hover:border-[#a17a34]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="budgetRange"
                            value={b}
                            checked={isChecked}
                            onChange={(e) => setBudgetRange(e.target.value)}
                            className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b] accent-[#143d2b] dark:accent-[#d2b56b] cursor-pointer shrink-0"
                          />
                          <span>{b}</span>
                        </label>
                      );
                    })}
                  </div>

                  {budgetRange === "Custom Budget" && (
                    <div className="pt-2 animate-fade-in space-y-1.5">
                      <label className="block font-semibold text-[#a17a34] dark:text-[#d2b56b] uppercase text-[9.5px]">
                        Specify Custom Budget Amount (INR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/50 font-bold">₹</span>
                        <input
                          type="number"
                          required
                          value={customBudget || ""}
                          onChange={(e) => setCustomBudget(Number(e.target.value) || undefined)}
                          placeholder="e.g. 1500000"
                          className="w-full pl-8 pr-3.5 py-2.5 border border-[#a17a34]/40 bg-[#fffaf3] dark:border-[#d2b56b]/40 dark:bg-[#11130f] text-[#143d2b] dark:text-[#f0e8db] text-xs font-mono focus:outline-none focus:border-[#a17a34]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Requirements */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px]">Special Requirements / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="Describe theme expectations, VIP arrangements, accessibility requirements, etc."
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] placeholder:text-muted-foreground/60 text-xs font-light resize-none leading-relaxed"
                  />
                </div>

                {/* Reference Video Link */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-semibold text-[#173d2c]/50 dark:text-[#eee5d7]/45 uppercase text-[9.5px] flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" /> Reference Video Link (YouTube / Vimeo / Web URL - Optional)
                  </label>
                  <input
                    type="url"
                    value={referenceVideoUrl}
                    onChange={(e) => setReferenceVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=example"
                    className="w-full px-3.5 py-2.5 border border-[#173d2c]/12 bg-[#fffaf3]/75 dark:border-white/10 dark:bg-[#11130f]/60 focus:ring-2 focus:ring-[#a17a34]/25 text-[#143d2b] dark:text-[#f0e8db] placeholder:text-muted-foreground/60 text-xs font-mono"
                  />
                </div>

                {/* Reference Images Attachment Module (Up to 10 max from device or Media Studio folders) */}
                <div className="space-y-3 sm:col-span-2 border-t border-[#173d2c]/10 dark:border-white/10 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block font-semibold text-[#173d2c]/60 dark:text-[#eee5d7]/50 uppercase text-[9.5px] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
                      <span>Attach Reference Images (Up to 10 Max)</span>
                      <span className="font-mono text-[9px] text-[#9a742e] dark:text-[#d2b56b] font-bold">
                        ({referenceImages.length} / 10 attached)
                      </span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Option 1: Device Upload */}
                      <label className="px-3 py-1.5 bg-[#f3eadf] dark:bg-white/[0.05] border border-[#173d2c]/15 dark:border-white/10 hover:border-[#a17a34] text-[#143d2b] dark:text-[#f0e8db] text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-[#9a742e] dark:text-[#d2b56b]" />
                        <span>Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={referenceImages.length >= 10}
                          onChange={handleDeviceImageUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Option 2: Select from Media Studio folders */}
                      <button
                        type="button"
                        onClick={() => setShowMediaPickerModal(true)}
                        disabled={referenceImages.length >= 10}
                        className="px-3 py-1.5 bg-[#143d2b]/10 dark:bg-[#d2b56b]/10 border border-[#143d2b]/30 dark:border-[#d2b56b]/30 hover:border-[#a17a34] text-[#143d2b] dark:text-[#f0e8db] text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <FolderHeart className="w-3 h-3 text-[#9a742e] dark:text-[#d2b56b]" />
                        <span>Select from Media Tab</span>
                      </button>
                    </div>
                  </div>

                  {/* Attached Images Preview Grid */}
                  {referenceImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                      {referenceImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-[4/3] bg-black/10 border border-[#173d2c]/15 dark:border-white/10 group overflow-hidden">
                          <img src={imgUrl} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white font-mono text-[8px] font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10.5px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 italic font-light">
                      No reference images attached yet. Upload photos of stage setups, seating layouts, or decor styles you prefer.
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={savingDraft}
              onClick={handleStage1SaveAndNext}
              className="px-7 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
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
            subEventDetails={subEventDetails}
            onSubEventDetailsChange={setSubEventDetails}
          />

          <div className="flex justify-between items-center max-w-4xl mx-auto pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-3 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.2em] transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-7 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] flex items-center gap-2 cursor-pointer shadow-md"
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
            selectedPartIds={selectedPartIds}
            availableParts={eventParts}
            onToggleItem={handleToggleItem}
            onApplyAll={handleApplyRecommendations}
          />

          <div className="flex justify-between items-center max-w-4xl mx-auto pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-3 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.2em] transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sub-Events
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-7 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue to Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: NON-FOOD CATEGORY-WISE SERVICES SELECTION (SCROLLSPY) ── */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in-up">
          <CategoryServiceCatalog
            categories={categories}
            items={nonFoodItems}
            selectedItems={selectedItems}
            onToggleItem={handleToggleItem}
            onQuantityChange={handleQuantityChange}
            grandTotal={grandTotal}
          />

          <div className="flex justify-between items-center max-w-5xl mx-auto pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-3 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] text-[8px] font-bold uppercase tracking-[0.2em] transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Recommendations
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-7 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] flex items-center gap-2 cursor-pointer shadow-md"
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

          <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#a17a34]/40 dark:border-[#d2b56b]/40 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[8px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-[0.24em] block">Final Estimated Investment</span>
              <div className="text-3xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db] mt-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                ₹{grandTotal.toLocaleString("en-IN")} <span className="text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono font-normal">INR</span>
              </div>
              <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light mt-1">
                Includes verified service items, catering estimates, and operational coordination.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-3 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#173d2c]/[0.035] dark:hover:bg-white/[0.035] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? "Submitting Request..." : "Submit Event Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE MAP VENUE SELECTION MODAL ── */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/15 dark:border-white/[0.10] max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
              <div>
                <span className="text-[8px] uppercase font-bold text-[#9a742e] dark:text-[#d2b56b] tracking-[0.2em] block">Interactive Venue Locator</span>
                <h3 className="text-lg font-normal text-[#143d2b] dark:text-[#f0e8db] font-heading mt-0.5" style={{ fontFamily: '"Playfair Display", serif' }}>Select Event Location on Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="text-[#173d2c]/50 dark:text-[#eee5d7]/40 hover:text-[#143d2b] dark:hover:text-[#f0e8db] transition cursor-pointer p-1"
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
                className="flex-1 px-4 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] text-xs font-light"
              />
              <button
                type="submit"
                disabled={mapSearching}
                className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer disabled:opacity-50"
              >
                {mapSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {mapSearchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-[#173d2c]/15 dark:border-white/[0.10] bg-[#fbf7f0] dark:bg-[#161813] divide-y divide-[#173d2c]/10 dark:divide-white/[0.08] text-xs">
                {mapSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMapSearchResult(res)}
                    className="w-full text-left p-3 hover:bg-[#f3eadf]/60 dark:hover:bg-white/[0.03] transition text-[#143d2b] dark:text-[#f0e8db] font-light flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                    <span className="truncate">{res.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Embedded OpenStreetMap Preview */}
            <div className="relative border border-[#173d2c]/15 dark:border-white/[0.10] bg-black/10 h-64 w-full">
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
                className="absolute bottom-3 right-3 bg-[#fbf7f0]/90 dark:bg-[#161813]/90 backdrop-blur-md border border-[#173d2c]/15 dark:border-white/[0.10] text-[#143d2b] dark:text-[#f0e8db] hover:text-[#a17a34] px-3.5 py-2 text-[8px] font-bold uppercase tracking-[0.18em] shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" /> Use My Location
              </button>
            </div>

            {/* Selected Location Text Area */}
            <div className="space-y-1.5">
              <label className="text-[8px] uppercase font-bold text-[#a17a34] dark:text-[#d2b56b] tracking-[0.2em] block">Selected Venue Address:</label>
              <textarea
                rows={2}
                value={selectedMapAddress || venueAddress}
                onChange={(e) => setSelectedMapAddress(e.target.value)}
                placeholder="Selected location address will appear here..."
                className="w-full px-3.5 py-2.5 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] font-light text-xs resize-none"
              />
            </div>

            {/* Popular Fast Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.18em] block">Popular Venue Areas:</span>
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
                    className="px-2.5 py-1 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] hover:border-[#a17a34]/40 text-[#173d2c]/60 dark:text-[#eee5d7]/50 text-[10px] transition cursor-pointer"
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-[#173d2c]/10 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 border border-[#173d2c]/15 text-[#173d2c] dark:border-white/[0.10] dark:text-[#f0e8db] text-[8px] font-bold uppercase tracking-[0.2em] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-6 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#174631] dark:hover:bg-[#dfc580] cursor-pointer shadow-md"
              >
                Confirm Venue Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Studio Selection Modal */}
      {showMediaPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#f8f2e9] dark:bg-[#171914] border border-[#a17a34]/40 w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/10 pb-3 shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-[#9a742e] dark:text-[#d2b56b]" />
                <span>Select Photos from Your Media Studio</span>
              </h3>
              <button type="button" onClick={() => setShowMediaPickerModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Items Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {getStoredCustomerMedia().items.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No photos found in your Media Tab. Upload photos under the Media tab first or upload directly from your device.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getStoredCustomerMedia().items.map((item) => {
                    const isSelected = referenceImages.includes(item.url);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isSelected) {
                            setReferenceImages((prev) => prev.filter((u) => u !== item.url));
                          } else {
                            if (referenceImages.length >= 10) {
                              alert("Maximum 10 reference images allowed.");
                              return;
                            }
                            setReferenceImages((prev) => [...prev, item.url]);
                          }
                        }}
                        className={`relative aspect-[4/3] border cursor-pointer overflow-hidden transition ${
                          isSelected ? "border-2 border-[#a17a34] ring-2 ring-[#a17a34]/40" : "border-[#173d2c]/10 hover:border-[#a17a34]/50"
                        }`}
                      >
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-2 right-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#a17a34] text-black" : "bg-black/40 text-white"}`}>
                            {isSelected ? "✓" : "+"}
                          </div>
                        </div>
                        <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white bg-black/60 px-1 truncate">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-[#173d2c]/10 dark:border-white/10 pt-3 shrink-0">
              <span className="text-xs font-mono text-[#a17a34] font-bold">
                Attached: {referenceImages.length} / 10 max
              </span>
              <button
                type="button"
                onClick={() => setShowMediaPickerModal(false)}
                className="px-5 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}