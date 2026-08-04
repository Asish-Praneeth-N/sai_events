"use client";

import { useState, useEffect } from "react";
import { saveCustomerProfile } from "../actions";
import { User, Phone, MapPin, CheckCircle2, AlertCircle, ShieldCheck, Mail, Sparkles, Award, Navigation, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import { ALL_COUNTRY_CODES } from "@/lib/countryCodes";

interface CustomerProfileFormProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    phoneCountryCode: string;
    whatsappCountryCode: string;
    whatsappNumber: string;
    whatsappSameAsPhone: boolean;
    address: string;
    locationLat?: number;
    locationLng?: number;
    email: string;
    role: string;
    profileCompleted: boolean;
    activeCasesCount: number;
    totalCasesCount: number;
  };
  isCompletionRequired?: boolean;
}

export default function CustomerProfileForm({
  initialProfile,
  isCompletionRequired = false,
}: CustomerProfileFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialProfile.phoneCountryCode || "+91");

  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(initialProfile.whatsappSameAsPhone ?? true);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(initialProfile.whatsappCountryCode || "+91");
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile.whatsappNumber || "");

  const [address, setAddress] = useState(initialProfile.address);
  const [locationLat, setLocationLat] = useState<number | undefined>(initialProfile.locationLat);
  const [locationLng, setLocationLng] = useState<number | undefined>(initialProfile.locationLng);

  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Sync whatsapp values if same as phone
  useEffect(() => {
    if (whatsappSameAsPhone) {
      setWhatsappCountryCode(phoneCountryCode);
      setWhatsappNumber(phoneNumber);
    }
  }, [whatsappSameAsPhone, phoneCountryCode, phoneNumber]);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "PC";

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationLat(lat);
        setLocationLng(lng);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress(`Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
            }
          } else {
            setAddress(`Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        } catch (_) {
          setAddress(`Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        } finally {
          setLocating(false);
          setMessage("Current location address & coordinates captured successfully!");
        }
      },
      (err) => {
        setLocating(false);
        setError(`Unable to retrieve your location: ${err.message}. You can manually type your address.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (phoneNumber.replace(/\D/g, "").length < 10) {
        throw new Error("Phone number must contain at least 10 digits.");
      }

      if (!whatsappSameAsPhone && whatsappNumber.replace(/\D/g, "").length < 10) {
        throw new Error("WhatsApp number must contain at least 10 digits.");
      }

      await saveCustomerProfile({
        fullName,
        phoneCountryCode,
        phoneNumber,
        whatsappCountryCode: whatsappSameAsPhone ? phoneCountryCode : whatsappCountryCode,
        whatsappNumber: whatsappSameAsPhone ? phoneNumber : whatsappNumber,
        whatsappSameAsPhone,
        address,
        locationLat,
        locationLng,
      });

      setMessage("Profile details saved successfully!");
      if (isCompletionRequired) {
        setTimeout(() => {
          router.push("/customer/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ── Left Column: VIP Portfolio Summary Card ── */}
      <div className="lg:col-span-4 bg-surface border border-border/80 rounded-3xl p-6 text-center flex flex-col justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-gold/45 to-transparent" />
        
        <div className="space-y-4 pt-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-background border border-border/80 shadow-inner group">
            <div className="absolute inset-0 rounded-full border border-accent-gold/30 scale-105 opacity-60 pointer-events-none group-hover:scale-110 transition duration-300" />
            <span className="text-2xl font-light font-heading text-accent-gold uppercase tracking-wider">
              {initials}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground font-heading truncate px-2">
              {fullName || "Private Client"}
            </h3>
            <span className="text-[8.5px] uppercase tracking-wider text-accent-gold font-bold font-sans flex items-center justify-center gap-1">
              <Award className="w-3 h-3" /> VIP Planning Portfolio
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block select-all opacity-80 pt-1">
              {initialProfile.email}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-border/45 py-5 my-1">
          <div className="text-center space-y-1 border-r border-border/45">
            <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Active Cases</span>
            <span className="text-xl font-bold font-mono text-accent-gold block">
              {initialProfile.activeCasesCount}
            </span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[8.5px] uppercase font-bold text-muted-foreground/60 tracking-wider block">Total Booked</span>
            <span className="text-xl font-bold font-mono text-foreground block">
              {initialProfile.totalCasesCount}
            </span>
          </div>
        </div>

        <div className="p-3 bg-background/40 border border-border/50 rounded-xl flex gap-2 items-center justify-center text-left">
          <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0" />
          <span className="text-[9px] text-muted-foreground font-light leading-normal">
            Verified SAI EVENTS customer profile.
          </span>
        </div>
      </div>

      {/* ── Right Column: Credentials Input Form ── */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
        
        {isCompletionRequired && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <strong className="block font-bold">Profile Completion Required:</strong>
              Please complete your contact details and address before planning your luxury event.
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-6.5 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-border/40 pb-4">
            <h2 className="text-lg font-light font-heading text-foreground">Contact & Coordination Profile</h2>
            <p className="text-[10.5px] text-muted-foreground mt-1 leading-relaxed font-light">
              Your contact details are used to coordinate event planning schedules, layout syncs, and event manager communications.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            
            {/* Authenticated Email (Readonly) */}
            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Mail className="w-3.5 h-3.5 text-accent-gold" />
                <span>Verified Account Email (Supabase Auth)</span>
              </label>
              <input
                type="email"
                disabled
                value={initialProfile.email}
                className="w-full px-4 py-3 bg-surface-raised border border-border/50 rounded-xl text-muted-foreground font-mono text-xs opacity-80 cursor-not-allowed"
              />
            </div>

            {/* Full Name field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <User className="w-3.5 h-3.5 text-accent-gold" />
                <span>Full Name *</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-200 text-sm font-light hover:border-border/60"
              />
            </div>

            {/* Phone field with Country Code */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Phone className="w-3.5 h-3.5 text-accent-gold" />
                <span>Primary Phone Number *</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs font-mono shrink-0 cursor-pointer"
                >
                  {ALL_COUNTRY_CODES.map((c, idx) => (
                    <option key={`${c.code}-${idx}`} value={c.code} className="bg-surface text-foreground">
                      {c.country}
                    </option>
                  ))}
                </select>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-200 text-sm font-mono hover:border-border/60"
                />
              </div>
            </div>

            {/* WhatsApp Same As Phone Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-foreground font-medium select-none">
                <input
                  type="checkbox"
                  checked={whatsappSameAsPhone}
                  onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent-gold focus:ring-accent-gold/30 accent-[#D4AF37] cursor-pointer"
                />
                <span>WhatsApp number is same as primary phone number</span>
              </label>
            </div>

            {/* Separate WhatsApp Field if disabled */}
            {!whatsappSameAsPhone && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <label htmlFor="whatsappNumber" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent-gold" />
                  <span>WhatsApp Number *</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={whatsappCountryCode}
                    onChange={(e) => setWhatsappCountryCode(e.target.value)}
                    className="px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground text-xs font-mono shrink-0 cursor-pointer"
                  >
                    {ALL_COUNTRY_CODES.map((c, idx) => (
                      <option key={`${c.code}-${idx}`} value={c.code} className="bg-surface text-foreground">
                        {c.country}
                      </option>
                    ))}
                  </select>
                  <input
                    id="whatsappNumber"
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-200 text-sm font-mono hover:border-border/60"
                  />
                </div>
              </div>
            )}

            {/* Address field & Geolocation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="address" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Customer Address & Location *</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="text-[10px] text-accent-gold hover:underline flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
                >
                  <Navigation className="w-3 h-3 text-accent-gold" />
                  {locating ? "Locating..." : "Use Current Location"}
                </button>
              </div>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address, city, state, and pincode..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-200 text-sm resize-none font-light leading-relaxed hover:border-border/60"
              />
              {locationLat && locationLng && (
                <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Coordinates captured: {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold disabled:opacity-50 text-black font-bold rounded-xl transition shadow text-xs uppercase tracking-[0.15em] cursor-pointer shadow-md shadow-[#D4AF37]/10"
          >
            {loading ? "Saving Profile..." : "Save Profile Details"}
          </button>
        </div>
      </form>
      
    </div>
  );
}
