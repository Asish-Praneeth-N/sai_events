"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  saveExtendedVendorProfile,
  updateVendorCategoryMappings,
  addPortfolioImage,
  removePortfolioImage,
  updateVendorAvailability,
} from "../actions";
import { Profile, VendorAvailabilityStatus } from "@/lib/types";
import {
  Store, CheckCircle2, AlertCircle, Plus, Trash2, LogOut, X,
  ShieldCheck, User, Phone, MapPin, Tag, Image, Clock, Info,
  Building2, Globe, Landmark, FileCheck,
  Truck, Warehouse, Sliders, MessageSquare
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

interface Props {
  profile: Profile | null;
  userEmail: string;
  categories: Category[];
  initialMappings: string[];
  portfolioItems: PortfolioItem[];
}

export default function VendorProfileForm({
  profile,
  userEmail,
  categories,
  initialMappings,
  portfolioItems,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  // Basic Info
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(
    profile?.phone_number === "0000000000" ? "" : profile?.phone_number || ""
  );
  const [businessName, setBusinessName] = useState(profile?.business_name || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [primaryCity, setPrimaryCity] = useState(profile?.primary_city || "");
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(profile?.service_radius_km || 100);
  const [maxDailyCapacity, setMaxDailyCapacity] = useState<number>(profile?.max_daily_capacity || 5);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(profile?.years_of_experience || 0);

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebook_url || "");

  // Bank Details
  const [bankName, setBankName] = useState(profile?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(profile?.account_number || "");
  const [ifscCode, setIfscCode] = useState(profile?.ifsc_code || "");
  const [accountName, setAccountName] = useState(profile?.account_name || "");

  // Category Mappings
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialMappings);

  // Certificates & Asset Inputs
  const [gstUrl, setGstUrl] = useState(profile?.vendor_documents?.gst?.url || "");
  const [panUrl, setPanUrl] = useState(profile?.vendor_documents?.pan?.url || "");
  const [msmeUrl, setMsmeUrl] = useState(profile?.vendor_documents?.msme?.url || "");

  const [godownPhoto, setGodownPhoto] = useState("");
  const [godownPhotos, setGodownPhotos] = useState<string[]>(profile?.godown_photos || []);

  const [vehicleType, setVehicleType] = useState("Truck");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleUrl, setVehicleUrl] = useState("");
  const [vehicleAssets, setVehicleAssets] = useState<Array<{ type: string; url: string; name: string }>>(
    profile?.vehicle_assets || []
  );

  const [additionalNotes, setAdditionalNotes] = useState(profile?.additional_notes || "");

  // Status & Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddGodownPhoto = () => {
    if (!godownPhoto.trim()) return;
    setGodownPhotos((prev) => [...prev, godownPhoto.trim()]);
    setGodownPhoto("");
  };

  const handleAddVehicleAsset = () => {
    if (!vehicleName.trim() || !vehicleUrl.trim()) return;
    setVehicleAssets((prev) => [
      ...prev,
      { type: vehicleType, name: vehicleName.trim(), url: vehicleUrl.trim() },
    ]);
    setVehicleName("");
    setVehicleUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!fullName.trim()) throw new Error("Owner Name is required.");
      if (phoneNumber.trim().length < 10) throw new Error("Phone number must contain at least 10 digits.");
      if (!businessName.trim()) throw new Error("Company Name is required.");

      const vendorDocumentsPayload = {
        gst: { url: gstUrl, status: profile?.vendor_documents?.gst?.status || "Pending" },
        pan: { url: panUrl, status: profile?.vendor_documents?.pan?.status || "Pending" },
        msme: { url: msmeUrl, status: profile?.vendor_documents?.msme?.status || "Pending" },
      };

      await saveExtendedVendorProfile({
        fullName,
        phoneNumber,
        businessName,
        address,
        primaryCity,
        serviceRadiusKm,
        maxDailyCapacity,
        yearsOfExperience,
        instagramUrl,
        websiteUrl,
        facebookUrl,
        bankName,
        accountNumber,
        ifscCode,
        accountName,
        vendorDocuments: vendorDocumentsPayload,
        godownPhotos,
        vehicleAssets,
        additionalNotes,
      });

      await updateVendorCategoryMappings(selectedCategories);

      setSuccess("Vendor profile & registration parameters updated successfully.");
      setTimeout(() => setSuccess(null), 3500);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="cursor-pointer text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="cursor-pointer text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Company & Owner Information */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Building2 className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">1. Company & Owner Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Company Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Royal Decor & Sound Studio"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Owner Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Asish Praneeth"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full px-3.5 py-2.5 bg-background/50 border border-border/50 rounded-xl text-muted-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Years of Industry Experience</label>
              <input
                type="number"
                min={0}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Maximum Daily Event Capacity</label>
              <input
                type="number"
                min={1}
                value={maxDailyCapacity}
                onChange={(e) => setMaxDailyCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Location & Service Area Radius */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <MapPin className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">2. Location & Service Radius</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Primary Operating City</label>
              <input
                type="text"
                value={primaryCity}
                onChange={(e) => setPrimaryCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">
                Service Radius: <span className="text-accent-gold font-mono font-bold">{serviceRadiusKm} KM</span>
              </label>
              <select
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              >
                <option value={50}>50 KM (Local City Only)</option>
                <option value={100}>100 KM (Metropolitan Region)</option>
                <option value={150}>150 KM (Extended Travel Area)</option>
                <option value={250}>250+ KM (Statewide Travel)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-semibold text-muted-foreground uppercase">Godown / Office Address *</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete address for equipment dispatch..."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Category & Services Multi-Selection */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Tag className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">3. Service Categories Selection</h3>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`px-4 py-2 rounded-xl border font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-accent-gold text-black border-accent-gold shadow-md"
                      : "bg-background border-border text-muted-foreground hover:bg-surface-raised"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Globe className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">4. Social Links & Portfolio Web</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Instagram Handle / URL</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/your_handle"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Official Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourevents.com"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Facebook Page</label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/your_page"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>
          </div>
        </div>

        {/* 5. Bank Account Details */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Landmark className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">5. Bank Account & Payout Verification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Royal Decor Enterprises"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 5010029384918"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>
          </div>
        </div>

        {/* 6. Assets & Compliance Documents */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <FileCheck className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">6. Compliance Certificates & Asset Photos</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">GST Certificate URL</label>
              <input
                type="url"
                value={gstUrl}
                onChange={(e) => setGstUrl(e.target.value)}
                placeholder="https://...gst.pdf"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">PAN Card URL</label>
              <input
                type="url"
                value={panUrl}
                onChange={(e) => setPanUrl(e.target.value)}
                placeholder="https://...pan.pdf"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">MSME / UDYAM Certificate URL</label>
              <input
                type="url"
                value={msmeUrl}
                onChange={(e) => setMsmeUrl(e.target.value)}
                placeholder="https://...msme.pdf"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              />
            </div>
          </div>

          {/* Godown Photos section */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-accent-gold" /> Godown / Warehouse Photos
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={godownPhoto}
                onChange={(e) => setGodownPhoto(e.target.value)}
                placeholder="Append Warehouse Photo URL (https://...)"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground"
              />
              <button
                type="button"
                onClick={handleAddGodownPhoto}
                className="px-4 py-2 bg-background hover:bg-surface-raised border border-border text-foreground font-bold rounded-xl text-xs cursor-pointer"
              >
                + Add Photo
              </button>
            </div>

            {godownPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {godownPhotos.map((url, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-background border border-border flex items-center gap-2 text-xs">
                    <span className="truncate max-w-[150px] font-mono text-[10px] text-muted-foreground">{url}</span>
                    <button
                      type="button"
                      onClick={() => setGodownPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles section */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-accent-gold" /> Logistics & Vehicle Assets (Truck / Mini Truck / Van)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              >
                <option value="Truck">Heavy Truck</option>
                <option value="Mini Truck">Mini Truck / DCM</option>
                <option value="Van">Delivery Van</option>
                <option value="Tempo">Tempo / Loader</option>
              </select>
              <input
                type="text"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="Vehicle Name / Registration Number"
                className="px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              />
              <input
                type="url"
                value={vehicleUrl}
                onChange={(e) => setVehicleUrl(e.target.value)}
                placeholder="Vehicle Photo / Document URL"
                className="px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              />
              <button
                type="button"
                onClick={handleAddVehicleAsset}
                className="px-4 py-2 bg-background hover:bg-surface-raised border border-border text-foreground font-bold rounded-xl text-xs cursor-pointer"
              >
                + Add Asset
              </button>
            </div>

            {vehicleAssets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {vehicleAssets.map((v, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">{v.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({v.type})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVehicleAssets((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 7. Additional Requirements & Notes */}
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <MessageSquare className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold text-foreground">7. Additional Requirements & Notes</h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Provide any special instructions, equipment details, or custom logistics setup parameters..."
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/40">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-black font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xl shadow-accent-gold/20"
          >
            {loading ? "Saving Credentials..." : "Save Extended Business Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
