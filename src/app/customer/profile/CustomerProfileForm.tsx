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
      <div className="lg:col-span-4 bg-[#fbf7f0] dark:bg-[#1f221c] border border-[#173d2c]/10 dark:border-white/[0.08] p-6 text-center flex flex-col justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#a17a34]/50 to-transparent dark:via-[#d2b56b]/50" />
        
        <div className="space-y-4 pt-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-[#f3eadf]/60 dark:bg-white/[0.02] border border-[#173d2c]/15 dark:border-white/[0.08] shadow-inner group">
            <div className="absolute inset-0 rounded-full border border-[#a17a34]/30 dark:border-[#d2b56b]/30 scale-105 opacity-60 pointer-events-none group-hover:scale-110 transition duration-300" />
            <span className="text-2xl font-normal font-heading text-[#9a742e] dark:text-[#d2b56b] uppercase tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
              {initials}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-normal text-[#173d2c] dark:text-[#f0e8db] font-heading truncate px-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              {fullName || "Private Client"}
            </h3>
            <span className="text-[7.5px] uppercase tracking-[0.22em] text-[#9a742e] dark:text-[#d2b56b] font-bold flex items-center justify-center gap-1">
              <Award className="w-3 h-3" /> VIP Planning Portfolio
            </span>
            <span className="text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono block select-all opacity-80 pt-1">
              {initialProfile.email}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-[#173d2c]/10 dark:border-white/[0.08] py-5 my-1">
          <div className="text-center space-y-1 border-r border-[#173d2c]/10 dark:border-white/[0.08]">
            <span className="text-[7.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.22em] block">Active Cases</span>
            <span className="text-xl font-bold font-mono text-[#a17a34] dark:text-[#d2b56b] block">
              {initialProfile.activeCasesCount}
            </span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[7.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.22em] block">Total Booked</span>
            <span className="text-xl font-bold font-mono text-[#173d2c] dark:text-[#f0e8db] block">
              {initialProfile.totalCasesCount}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#f3eadf]/50 dark:bg-white/[0.02] border border-[#173d2c]/10 dark:border-white/[0.08] flex gap-2.5 items-center justify-center text-left">
          <ShieldCheck className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
          <span className="text-[9.5px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 font-light leading-normal">
            Verified SAI EVENTS private client profile.
          </span>
        </div>
      </div>

      {/* ── Right Column: Credentials Input Form ── */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 w-full min-w-0">
        
        {isCompletionRequired && (
          <div className="p-4 bg-amber-100/90 border border-amber-300 text-amber-950 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs flex items-center gap-3 animate-fade-in font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <strong className="block font-bold">Profile Completion Required:</strong>
              Please complete your contact details and address before planning your luxury event.
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100/90 border border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-100/90 border border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-4 sm:p-6.5 bg-[#fbf7f0] dark:bg-[#1f221c] border border-[#173d2c]/10 dark:border-white/[0.08] shadow-sm space-y-6 w-full min-w-0">
          <div className="space-y-1 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
            <h2 className="text-base sm:text-lg font-normal font-heading text-[#173d2c] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Contact & Coordination Profile
            </h2>
            <p className="text-[11px] text-[#173d2c]/60 dark:text-[#eee5d7]/50 mt-1 leading-relaxed font-light">
              Your contact details are used to coordinate event planning schedules, layout syncs, and event manager communications.
            </p>
          </div>

          <div className="space-y-5 text-xs w-full min-w-0">
            
            {/* Authenticated Email (Readonly) */}
            <div className="space-y-2">
              <label className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em] flex items-center gap-1.5 pl-0.5">
                <Mail className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                <span>Verified Account Email (Supabase Auth)</span>
              </label>
              <input
                type="email"
                disabled
                value={initialProfile.email}
                className="w-full px-4 py-3 bg-[#f3eadf]/40 dark:bg-white/[0.015] border border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/60 dark:text-[#eee5d7]/40 font-mono text-xs opacity-80 cursor-not-allowed truncate"
              />
            </div>

            {/* Full Name field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em] flex items-center gap-1.5 pl-0.5">
                <User className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                <span>Full Name *</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] transition duration-200 text-sm font-light"
              />
            </div>

            {/* Phone field with Country Code */}
            <div className="space-y-2 w-full">
              <label htmlFor="phoneNumber" className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em] flex items-center gap-1.5 pl-0.5">
                <Phone className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                <span>Primary Phone Number *</span>
              </label>
              <div className="flex flex-row gap-2 w-full min-w-0">
                <select
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="w-28 sm:w-44 px-2.5 sm:px-3 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] text-xs font-mono shrink-0 cursor-pointer text-ellipsis overflow-hidden"
                >
                  {ALL_COUNTRY_CODES.map((c, idx) => (
                    <option key={`${c.code}-${idx}`} value={c.code} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">
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
                  className="flex-1 min-w-0 w-full px-3.5 sm:px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] transition duration-200 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* WhatsApp Same As Phone Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#173d2c] dark:text-[#f0e8db] font-medium select-none">
                <input
                  type="checkbox"
                  checked={whatsappSameAsPhone}
                  onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                  className="w-4 h-4 border-[#173d2c]/20 text-[#a17a34] focus:ring-[#a17a34]/30 accent-[#a17a34] dark:accent-[#d2b56b] cursor-pointer shrink-0"
                />
                <span className="leading-snug">WhatsApp number is same as primary phone number</span>
              </label>
            </div>

            {/* Separate WhatsApp Field if disabled */}
            {!whatsappSameAsPhone && (
              <div className="space-y-2 pt-2 animate-fade-in w-full">
                <label htmlFor="whatsappNumber" className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em] flex items-center gap-1.5 pl-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                  <span>WhatsApp Number *</span>
                </label>
                <div className="flex flex-row gap-2 w-full min-w-0">
                  <select
                    value={whatsappCountryCode}
                    onChange={(e) => setWhatsappCountryCode(e.target.value)}
                    className="w-28 sm:w-44 px-2.5 sm:px-3 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-[#171914] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] text-xs font-mono shrink-0 cursor-pointer text-ellipsis overflow-hidden"
                  >
                    {ALL_COUNTRY_CODES.map((c, idx) => (
                      <option key={`${c.code}-${idx}`} value={c.code} className="bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c] dark:text-[#f0e8db]">
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
                    className="flex-1 min-w-0 w-full px-3.5 sm:px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] transition duration-200 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* Address field & Geolocation */}
            <div className="space-y-2 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="address" className="text-[8px] uppercase font-bold text-[#173d2c]/55 dark:text-[#eee5d7]/45 tracking-[0.2em] flex items-center gap-1.5 pl-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                  <span>Customer Address & Location *</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="text-[9.5px] uppercase font-bold tracking-[0.18em] text-[#a17a34] dark:text-[#d2b56b] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 ml-auto"
                >
                  <Navigation className="w-3 h-3 text-[#a17a34] dark:text-[#d2b56b] shrink-0" />
                  <span>{locating ? "Locating..." : "Use Current Location"}</span>
                </button>
              </div>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address, city, state, and pincode..."
                className="w-full px-4 py-3 bg-[#f3eadf]/40 border border-[#173d2c]/15 text-[#173d2c] focus:border-[#a17a34] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.02] dark:text-[#f0e8db] dark:focus:border-[#d2b56b] transition duration-200 text-sm resize-none font-light leading-relaxed"
              />
              {locationLat && locationLng && (
                <div className="text-[10px] text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-mono flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
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
            className="w-full sm:w-auto px-8 py-3.5 bg-[#143d2b] text-[#fffaf1] font-bold text-[8.5px] uppercase tracking-[0.2em] transition shadow-md hover:bg-[#174631] cursor-pointer disabled:opacity-50 dark:bg-[#d2b56b] dark:text-[#161812] dark:hover:bg-[#dfc580]"
          >
            {loading ? "Saving Profile..." : "Save Profile Details"}
          </button>
        </div>
      </form>
      
    </div>
  );
}
