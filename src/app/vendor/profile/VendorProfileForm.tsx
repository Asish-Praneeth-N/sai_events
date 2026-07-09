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
  Trash2, LogOut, ShieldCheck
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

  // Form parameters
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber);
  const [businessName, setBusinessName] = useState(initialProfile.businessName);
  const [address, setAddress] = useState(initialProfile.address);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialMappings);

  // Availability (DB-backed)
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Leave">(
    initialProfile.availabilityStatus
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Portfolio (DB-backed — comes from server)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(portfolioItems);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [showAddImage, setShowAddImage] = useState(false);
  const [addingImage, setAddingImage] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Completeness rate
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

      setSuccess("Business profile parameters saved successfully.");
      setTimeout(() => setSuccess(null), 3500);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (state: "Available" | "Busy" | "Leave") => {
    setAvailabilityLoading(true);
    setAvailability(state);
    try {
      await updateVendorAvailability(state);
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
      setSuccess("Portfolio image added.");
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add portfolio image.");
    } finally {
      setAddingImage(false);
    }
  };

  const handleRemovePortfolioImage = async (itemId: string) => {
    try {
      await removePortfolioImage(itemId);
      setPortfolio((prev) => prev.filter((p) => p.id !== itemId));
    } catch (err: any) {
      setError(err.message || "Failed to remove portfolio image.");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = (businessName || fullName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="space-y-8 select-none">

      {/* Toast logs */}
      {error && (
        <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Covered Banner Header ── */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-md">
        <div className="h-32 bg-gradient-to-r from-zinc-900 via-accent-gold/5 to-zinc-900 flex items-center justify-end px-8">
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" /> Vetted Partner
            </span>
          </div>
        </div>

        {/* Badge overlaps header */}
        <div className="p-6 pt-0 bg-surface flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-border/80 flex items-center justify-center text-accent-gold text-2xl font-bold font-heading shadow-lg select-none">
              {initials}
            </div>
            <div className="space-y-1.5 pb-1">
              <h2 className="text-xl font-bold text-foreground font-heading">
                {businessName || "Your Business"}
              </h2>
              <p className="text-[10px] text-muted-foreground font-mono">
                {initialProfile.email}
              </p>
            </div>
          </div>

          {/* Completeness Bar */}
          <div className="w-full sm:w-64 space-y-1.5 self-end pb-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground font-mono">
              <span>Calibration Completion</span>
              <span className={completeness === 100 ? "text-emerald-500" : "text-accent-gold"}>
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

        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">

          {/* Business details form */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Business Profile Data</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9.5px] uppercase font-bold text-muted-foreground tracking-wider block">Owner Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asish Praneeth"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9.5px] uppercase font-bold text-muted-foreground tracking-wider block">Phone Line</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground tracking-wider block">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Grand Event Photography"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] uppercase font-bold text-muted-foreground tracking-wider block">Service Area / Coverage Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Hyderabad, TS. Cover all southern sectors."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold/45 transition resize-none"
              />
            </div>
          </div>

          {/* Category selection */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Services Alignment</h3>
              <p className="text-[10px] text-muted-foreground font-light mt-1">Select standard event planning categories mapped to your services log.</p>
            </div>

            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground font-light py-2">No category logs available.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-3 py-1.5 border rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-accent-gold border-accent-gold text-black shadow-sm"
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

          {/* Availability Status */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Workspace Availability</h3>
              <p className="text-[10px] text-muted-foreground font-light mt-1">Update your current operational state for the SAI EVENTS dispatch team.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["Available", "Busy", "Leave"] as const).map((state) => (
                <button
                  key={state}
                  type="button"
                  disabled={availabilityLoading}
                  onClick={() => handleAvailabilityChange(state)}
                  className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition ${
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

          {/* Submit button */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              {loading ? "Saving Parameters..." : "Save Profile Details"}
            </button>
          </div>

        </form>

        {/* Right Column: DB-backed Portfolio Gallery */}
        <div className="lg:col-span-5 space-y-6 w-full">

          {/* Gallery card */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Showcase Gallery</h3>
                <p className="text-[10px] text-muted-foreground font-light mt-0.5">
                  {portfolio.length} portfolio image{portfolio.length !== 1 ? "s" : ""} saved.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddImage(!showAddImage)}
                className="p-2 bg-background border border-border rounded-xl text-accent-gold hover:bg-surface-raised cursor-pointer transition"
                title="Add Image URL"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add URL Input drawer */}
            {showAddImage && (
              <form onSubmit={handleAddPortfolioImage} className="p-3 bg-background border border-border/60 rounded-2xl space-y-3.5 animate-scale-in text-xs">
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-muted-foreground block">Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://your-image-link.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent-gold/45"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-muted-foreground block">Caption (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Wedding Reception 2024"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent-gold/45"
                  />
                </div>
                <div className="flex justify-end gap-2 text-[9px]">
                  <button
                    type="button"
                    onClick={() => setShowAddImage(false)}
                    className="px-3 py-1 border border-border rounded-md text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingImage}
                    className="px-3.5 py-1 bg-accent-gold text-black font-bold rounded-md uppercase tracking-wider"
                  >
                    {addingImage ? "Saving..." : "Append"}
                  </button>
                </div>
              </form>
            )}

            {/* Masonry Grid — renders from DB */}
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
                {portfolio.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.caption || "Portfolio asset"}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition">
                        {item.caption}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioImage(item.id)}
                        className="p-2.5 bg-red-600 text-white rounded-xl hover:scale-105 cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-[10px] text-muted-foreground font-light border border-dashed border-border/60 rounded-2xl bg-background/30">
                No portfolio images yet. Add URLs above to build your showcase gallery.
              </div>
            )}
          </div>

          {/* Account credentials card */}
          <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account Control</h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{initialProfile.email}</p>
            </div>

            {!showSignOutConfirm ? (
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full py-2.5 border border-border hover:border-red-950/20 text-xs font-semibold rounded-xl text-red-400 hover:bg-red-950/10 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out Credentials
              </button>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-2xl animate-scale-in text-xs">
                <span className="text-muted-foreground">Are you sure?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    type="button"
                    className="px-3 py-1.5 border border-border rounded-lg text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    type="button"
                    className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg uppercase tracking-wider"
                  >
                    {signingOut ? "Signing out..." : "Yes"}
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
