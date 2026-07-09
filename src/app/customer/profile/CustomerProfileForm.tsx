"use client";

import { useState } from "react";
import { saveCustomerProfile } from "../actions";
import { User, Phone, MapPin, CheckCircle2, AlertCircle, ShieldCheck, Mail, Sparkles, Award } from "lucide-react";

interface CustomerProfileFormProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    address: string;
    email: string;
    role: string;
    activeCasesCount: number;
    totalCasesCount: number;
  };
}

export default function CustomerProfileForm({
  initialProfile,
}: CustomerProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [address, setAddress] = useState(initialProfile.address);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "PC";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (phoneNumber.replace(/\D/g, "").length < 10) {
        throw new Error("Phone number must be at least 10 digits.");
      }

      await saveCustomerProfile({
        fullName,
        phoneNumber,
        address,
      });

      setMessage("Profile credentials saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
      
      {/* ── Left Column: VIP Portfolio Summary Card ── */}
      <div className="lg:col-span-4 bg-surface border border-border/80 rounded-3xl p-6.5 text-center flex flex-col justify-between gap-6 relative overflow-hidden shadow-sm">
        {/* Decorative Golden Light Streak */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-gold/45 to-transparent" />
        
        <div className="space-y-4 pt-4">
          {/* Circular Luxury Initial Ring */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-background border border-border/80 shadow-inner group">
            {/* Pulsing gold focus halo */}
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

        {/* Real-time event statistics */}
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

        {/* Concierge Guarantee Tag */}
        <div className="p-3 bg-background/40 border border-border/50 rounded-xl flex gap-2 items-center justify-center text-left">
          <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0" />
          <span className="text-[9px] text-muted-foreground font-light leading-normal">
            Verified SAI EVENTS client account.
          </span>
        </div>
      </div>

      {/* ── Right Column: Credentials Input Form ── */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
        
        {error && (
          <div className="p-4.5 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4.5 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-6.5 rounded-3xl bg-surface border border-border/80 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-border/40 pb-4">
            <h2 className="text-lg font-light font-heading text-foreground">Contact & Coordination Details</h2>
            <p className="text-[10.5px] text-muted-foreground mt-1 leading-relaxed font-light">
              Configure your registered communication nodes and defaults. These parameters are used by your assigned operational manager to schedule video syncs and direct layouts logistics.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            
            {/* Full Name field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <User className="w-3.5 h-3.5 text-accent-gold" />
                <span>Full Name</span>
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

            {/* Phone field */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Phone className="w-3.5 h-3.5 text-accent-gold" />
                <span>Phone Number</span>
              </label>
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

            {/* Address field */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-[9.5px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5 pl-0.5">
                <MapPin className="w-3.5 h-3.5 text-accent-gold" />
                <span>Default Billing / Event Location Address</span>
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address, city, state, and pin code"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground transition duration-200 text-sm resize-none font-light leading-relaxed hover:border-border/60"
              />
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold disabled:opacity-50 text-black font-bold rounded-xl transition shadow text-xs uppercase tracking-[0.15em] cursor-pointer shadow-md shadow-[#D4AF37]/10"
          >
            {loading ? "Saving Changes..." : "Save Credentials"}
          </button>
        </div>
      </form>
      
    </div>
  );
}
