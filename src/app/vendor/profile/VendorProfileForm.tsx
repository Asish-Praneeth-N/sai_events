"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  saveVendorProfile,
  updateVendorCategoryMappings,
  addPortfolioImage,
  removePortfolioImage,
  updateVendorAvailability,
} from "../actions";
import {
  Store, CheckCircle2, AlertCircle, Plus,
  Trash2, LogOut, ShieldCheck, User, Phone, MapPin, Tag, Image, Clock, Info
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

interface VendorProfileFormProps {
  initialProfile: {
    fullName: string;
    phoneNumber: string;
    businessName: string;
    address: string;
    email: string;
    availabilityStatus: "Available" | "Busy" | "Leave";
  };
  categories: Category[];
  initialMappings: string[];
  portfolioItems: PortfolioItem[];
}

export default function VendorProfileForm({
  initialProfile,
  categories,
  initialMappings,
  portfolioItems,
}: VendorProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [businessName, setBusinessName] = useState(initialProfile.businessName);
  const [address, setAddress] = useState(initialProfile.address);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialMappings);

  const [availability, setAvailability] = useState<"Available" | "Busy" | "Leave">(
    initialProfile.availabilityStatus
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(portfolioItems);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [showAddImage, setShowAddImage] = useState(false);
  const [addingImage, setAddingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fields = [fullName, phoneNumber, businessName, address];
  const filledCount =
    fields.filter((f) => f.trim().length > 0).length +
    (selectedCategories.length > 0 ? 1 : 0);
  const completeness = Math.round((filledCount / 5) * 100);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (phoneNumber.trim().length < 10) {
        throw new Error("Phone number must contain at least 10 digits.");
      }
      await saveVendorProfile({ fullName, phoneNumber, businessName, address });
      await updateVendorCategoryMappings(selectedCategories);

      setSuccess("Business credentials saved successfully.");
      setTimeout(() => setSuccess(null), 3500);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (state: "Available" | "Busy" | "Leave") => {
    setAvailabilityLoading(true);
    setAvailability(state);
    try {
      await updateVendorAvailability(state);
      setSuccess(`Status changed to ${state}.`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleAddPortfolioImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setAddingImage(true);
    setError(null);
    try {
      await addPortfolioImage(newImageUrl.trim(), newImageCaption.trim() || undefined);
      setNewImageUrl("");
      setNewImageCaption("");
      setShowAddImage(false);
      setSuccess("New showcase file appended successfully.");
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add showcase image.");
    } finally {
      setAddingImage(false);
    }
  };

  const handleRemovePortfolioImage = async (itemId: string) => {
    try {
      await removePortfolioImage(itemId);
      setPortfolio((prev) => prev.filter((p) => p.id !== itemId));
      setSuccess("Showcase file deleted.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to delete showcase image.");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = (businessName || fullName || "?")
    .split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-12">

      {/* Toast Alert logs */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-scale-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Covered Banner Header Profile ── */}
      <div className="relative rounded-[32px] overflow-hidden border border-border/80 shadow-md">
        <div className="h-44 bg-gradient-to-br from-[#1c1815] via-[#2d261f] to-[#120e0c] dark:from-[#0d0b0a] dark:to-[#050404] flex items-center justify-end px-8 relative">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-accent-gold/5 to-transparent blur-2xl pointer-events-none" />
          
          <div className="flex gap-2 relative z-10">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/25 select-none">
              <ShieldCheck className="w-3.5 h-3.5" /> Vetted Partner
            </span>
          </div>
        </div>

        {/* Info layout */}
        <div className="p-6 sm:p-8 pt-0 bg-surface flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-14 relative z-10">
            <div className="w-24 h-24 rounded-[28px] bg-zinc-900 border-2 border-accent-gold flex items-center justify-center text-accent-gold text-3xl font-heading shadow-xl select-none font-bold">
              {initials}
            </div>
            <div className="space-y-1 pb-1">
              <h2 className="text-2xl font-light text-foreground font-heading leading-tight">
                {businessName || "Your Enterprise"}
              </h2>
              <p className="text-xs text-muted-foreground font-mono font-light">
                {initialProfile.email}
              </p>
            </div>
          </div>

          {/* Progress Calibration bar */}
          <div className="w-full sm:w-64 space-y-2 self-end pb-1">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground">
              <span>Calibration Strength</span>
              <span className={completeness === 100 ? "text-emerald-400 font-bold" : "text-accent-gold font-bold"}>
                {completeness}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-background border border-border/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completeness === 100 ? "bg-emerald-500" : "bg-accent-gold"
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Form detail segments */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">

          {/* Business profile logs card */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Business Credentials</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Owner Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mohan Kumar"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Phone Line</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Company Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Grand Event Photography"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition font-light"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Operating Address / Service Coverage</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Hyderabad TS. Cover all southern sectors."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition resize-none font-light leading-relaxed"
              />
            </div>
          </div>

          {/* Categories mappings panel */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Channels Alignment</h3>
            </div>
            <p className="text-[10px] text-muted-foreground font-light leading-normal">
              Select standard event channels corresponding to your business services to catalog proposals.
            </p>

            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground font-light py-2">No category logs available.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-3 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer ${
                        isSelected
                          ? "bg-accent-gold border-accent-gold text-black shadow"
                          : "bg-background border-border text-muted-foreground hover:border-accent-gold/15"
                      }`}
                      title={cat.description || cat.name}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Availability schedule */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-gold" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Workspace Availability</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["Available", "Busy", "Leave"] as const).map((state) => (
                <button
                  key={state}
                  type="button"
                  disabled={availabilityLoading}
                  onClick={() => handleAvailabilityChange(state)}
                  className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center cursor-pointer transition ${
                    availability === state
                      ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold font-black"
                      : "bg-background border-border text-muted-foreground hover:bg-surface-raised"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Submit details button */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              {loading ? "Saving Parameters..." : "Save Credentials"}
            </button>
          </div>

        </form>

        {/* Right Column: DB Showcase Gallery & Signout */}
        <div className="lg:col-span-5 space-y-6 w-full">

          {/* Gallery block */}
          <div className="p-6 sm:p-8 bg-surface border border-border/80 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-accent-gold" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Showcase Gallery</h3>
                </div>
                <p className="text-[10px] text-muted-foreground font-light font-mono">
                  {portfolio.length} portfolio item{portfolio.length !== 1 ? "s" : ""} cataloged.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddImage(!showAddImage)}
                className="p-2 bg-background border border-border rounded-xl text-accent-gold hover:bg-surface-raised cursor-pointer transition"
                title="Append File URL"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* URL input drawer */}
            {showAddImage && (
              <form onSubmit={handleAddPortfolioImage} className="p-4 bg-background border border-border/80 rounded-2xl space-y-4 animate-scale-in text-xs">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Image Asset URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/...jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Caption Descriptor</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Wedding Main Stage Setup"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-accent-gold/45"
                  />
                </div>
                <div className="flex justify-end gap-2 text-[9px]">
                  <button
                    type="button"
                    onClick={() => setShowAddImage(false)}
                    className="px-3.5 py-1.5 border border-border rounded-xl text-muted-foreground cursor-pointer"
                  >Cancel</button>
                  <button
                    type="submit"
                    disabled={addingImage}
                    className="px-4 py-1.5 bg-accent-gold text-black font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >Append</button>
                </div>
              </form>
            )}

            {/* Pinterest-quality Masonry grid from Supabase */}
            {portfolio.length > 0 ? (
              <div className="columns-2 gap-3 space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-none pt-1">
                {portfolio.map((item) => (
                  <div key={item.id} className="relative rounded-2xl overflow-hidden border border-border group break-inside-avoid shadow-sm hover:shadow-md transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.caption || "Showcase asset"}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-[8px] uppercase tracking-wider font-mono px-3 py-2 truncate opacity-0 group-hover:opacity-100 transition duration-250 select-none">
                        {item.caption}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-250 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioImage(item.id)}
                        className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl hover:scale-105 cursor-pointer shadow-md"
                        title="Delete asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground font-light border border-dashed border-border/80 rounded-2xl bg-background/30">
                No portfolio images cataloged yet. Append assets above to build your showcase gallery.
              </div>
            )}

            <div className="p-3 bg-background border border-border/60 rounded-2xl flex items-start gap-2.5 text-[9.5px] text-muted-foreground leading-normal font-light">
              <Info className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
              <p>
                Reference photos are cataloged in your vetted profile files. Dispatchers review these showcase assets when matching category availability.
              </p>
            </div>
          </div>

          {/* Account control */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Account Credentials</h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{initialProfile.email}</p>
            </div>

            {!showSignOutConfirm ? (
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full py-2.5 border border-border hover:border-red-950/20 text-xs font-bold uppercase tracking-wider rounded-xl text-red-400 hover:bg-red-950/10 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-2xl animate-scale-in text-xs font-bold">
                <span className="text-muted-foreground">Are you sure?</span>
                <div className="flex items-center gap-2 font-bold">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    type="button"
                    className="px-3.5 py-1.5 border border-border rounded-xl text-muted-foreground cursor-pointer text-[10px]"
                  >Cancel</button>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    type="button"
                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl uppercase tracking-wider cursor-pointer text-[10px]"
                  >
                    {signingOut ? "Leaving..." : "Yes, Exit"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
