"use client";

import React, { useState, useTransition } from "react";
import { PackageMaster, EventPart, ServiceItem, PackageType } from "@/lib/types";
import { savePackage, deletePackage } from "./actions";
import { 
  Sparkles, Plus, Edit3, Trash2, Tag, Layers, CheckCircle2, 
  Video, Image as ImageIcon, DollarSign, Award, X, ChevronRight 
} from "lucide-react";

interface PackageManagerProps {
  initialPackages: PackageMaster[];
  eventParts: EventPart[];
  serviceItems: ServiceItem[];
}

export default function PackageManager({
  initialPackages,
  eventParts,
  serviceItems,
}: PackageManagerProps) {
  const [packages, setPackages] = useState<PackageMaster[]>(initialPackages);
  const [activeTab, setActiveTab] = useState<PackageType>("EVENT_PART_PACKAGE");
  const [selectedEventType, setSelectedEventType] = useState<string>("Wedding");
  const [isPending, startTransition] = useTransition();

  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageMaster | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [eventPartId, setEventPartId] = useState("");
  const [serviceItemId, setServiceItemId] = useState("");
  const [price, setPrice] = useState<number>(100000);
  const [originalValue, setOriginalValue] = useState<number | "">(125000);
  const [isRecommended, setIsRecommended] = useState(false);
  const [minSuitableBudget, setMinSuitableBudget] = useState<number | "">(50000);
  const [maxSuitableBudget, setMaxSuitableBudget] = useState<number | "">(300000);
  const [recommendationPriority, setRecommendationPriority] = useState<number>(1);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [refVideoUrl, setRefVideoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [servicesInput, setServicesInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredPackages = packages.filter(
    (p) => p.package_type === activeTab && (p.event_type === selectedEventType || !selectedEventType)
  );

  const availablePartsForType = eventParts.filter((p) => p.event_type === eventType);

  const openAddModal = () => {
    setEditingPkg(null);
    setName("");
    setDescription("");
    setEventType(selectedEventType || "Wedding");
    setEventPartId("");
    setServiceItemId("");
    setPrice(100000);
    setOriginalValue(125000);
    setIsRecommended(true);
    setMinSuitableBudget(50000);
    setMaxSuitableBudget(300000);
    setRecommendationPriority(1);
    setCoverImageUrl("");
    setRefVideoUrl("");
    setIsActive(true);
    setSortOrder(0);
    setServicesInput("Decoration\nStage\nDJ & Sound\nPhotography\nCatering");
    setGalleryInput("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (pkg: PackageMaster) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setDescription(pkg.description);
    setEventType(pkg.event_type);
    setEventPartId(pkg.event_part_id || "");
    setServiceItemId(pkg.service_item_id || "");
    setPrice(pkg.price);
    setOriginalValue(pkg.original_value || "");
    setIsRecommended(pkg.is_recommended);
    setMinSuitableBudget(pkg.min_suitable_budget || "");
    setMaxSuitableBudget(pkg.max_suitable_budget || "");
    setRecommendationPriority(pkg.recommendation_priority || 0);
    setCoverImageUrl(pkg.cover_image_url || "");
    setRefVideoUrl(pkg.ref_video_url || "");
    setIsActive(pkg.is_active);
    setSortOrder(pkg.sort_order);

    const incServices = pkg.included_services?.map((s) => s.service_name).join("\n") || "";
    setServicesInput(incServices);

    const mediaUrls = pkg.gallery_media?.map((m) => m.media_url).join("\n") || "";
    setGalleryInput(mediaUrls);

    setError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Package name is required");
      return;
    }
    if (price <= 0) {
      setError("Package price must be greater than zero");
      return;
    }

    const includedServices = servicesInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const galleryUrls = galleryInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    startTransition(async () => {
      try {
        await savePackage({
          id: editingPkg?.id,
          packageType: activeTab,
          eventType,
          eventPartId: eventPartId || undefined,
          serviceItemId: serviceItemId || undefined,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          originalValue: originalValue ? Number(originalValue) : undefined,
          isRecommended,
          minSuitableBudget: minSuitableBudget ? Number(minSuitableBudget) : undefined,
          maxSuitableBudget: maxSuitableBudget ? Number(maxSuitableBudget) : undefined,
          recommendationPriority: Number(recommendationPriority),
          coverImageUrl,
          refVideoUrl,
          isActive,
          sortOrder: Number(sortOrder),
          includedServices,
          galleryUrls,
        });

        setShowModal(false);
        window.location.reload();
      } catch (err: any) {
        setError(err.message || "Failed to save package.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    startTransition(async () => {
      try {
        await deletePackage(id);
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete package.");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-foreground">Package Master Builder</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
              Managed Operations Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure Level 1 Event Part Packages (bundled multi-service) &amp; Level 2 Service Packages with budget fit recommendations.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl transition text-xs shadow-md shadow-accent-gold/15 uppercase tracking-wider self-start md:self-auto cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Package Type & Event Type Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2 bg-surface-raised p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("EVENT_PART_PACKAGE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "EVENT_PART_PACKAGE"
                ? "bg-accent-gold text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Level 1: Event Part Packages
          </button>
          <button
            onClick={() => setActiveTab("SERVICE_PACKAGE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "SERVICE_PACKAGE"
                ? "bg-accent-gold text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Level 2: Service Packages
          </button>
        </div>

        {/* Event Type Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Event Category:</span>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-accent-gold cursor-pointer"
          >
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Private Event">Private Event</option>
            <option value="Other Celebration">Other Celebration</option>
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 text-xs sm:text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/5 space-y-3">
          <Award className="w-8 h-8 text-accent-gold/40 mx-auto" />
          <p className="font-semibold">No packages configured for {selectedEventType} ({activeTab === "EVENT_PART_PACKAGE" ? "Event Part Level" : "Service Level"}).</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-bold rounded-xl hover:bg-accent-gold hover:text-black transition"
          >
            + Create First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const savingsAmt = (pkg.original_value || 0) > pkg.price ? (pkg.original_value || 0) - pkg.price : 0;
            return (
              <div
                key={pkg.id}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-accent-gold/40 transition-all shadow-sm relative group"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-accent-gold bg-accent-gold/10 border border-accent-gold/20 px-2.5 py-0.5 rounded-full">
                      {pkg.event_type}
                    </span>
                    {pkg.is_recommended && (
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> Recommended
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base font-heading text-foreground">{pkg.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pkg.description}</p>
                  </div>

                  {/* Price & Savings */}
                  <div className="p-3 rounded-xl bg-surface-raised border border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Package Price</span>
                      <div className="text-base font-bold font-mono text-accent-gold">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {savingsAmt > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block">Customer Savings</span>
                        <div className="text-xs font-bold font-mono text-emerald-400">
                          Save ₹{savingsAmt.toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Budget Suitability Range */}
                  {(pkg.min_suitable_budget || pkg.max_suitable_budget) && (
                    <div className="text-[10px] font-mono text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/40 flex items-center justify-between">
                      <span>Target Budget Fit:</span>
                      <span className="text-foreground font-bold">
                        ₹{pkg.min_suitable_budget?.toLocaleString("en-IN") || 0} – ₹{pkg.max_suitable_budget?.toLocaleString("en-IN") || "∞"}
                      </span>
                    </div>
                  )}

                  {/* Included Services Preview */}
                  {pkg.included_services && pkg.included_services.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Includes ({pkg.included_services.length} services):</span>
                      <div className="flex flex-wrap gap-1">
                        {pkg.included_services.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="text-[9.5px] bg-background border border-border px-2 py-0.5 rounded-md text-foreground">
                            ✓ {s.service_name}
                          </span>
                        ))}
                        {pkg.included_services.length > 4 && (
                          <span className="text-[9.5px] text-accent-gold font-bold">+{pkg.included_services.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${pkg.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {pkg.is_active ? "● Active" : "○ Inactive"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="px-3 py-1.5 bg-surface-raised hover:bg-border text-foreground text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-accent-gold tracking-widest block">
                  {activeTab === "EVENT_PART_PACKAGE" ? "Level 1 Package Builder" : "Level 2 Service Package Builder"}
                </span>
                <h3 className="text-xl font-bold font-heading text-foreground mt-0.5">
                  {editingPkg ? `Edit Package: ${editingPkg.name}` : `Create New ${activeTab === "EVENT_PART_PACKAGE" ? "Event Part Package" : "Service Package"}`}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                    Event Category *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-bold"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Other Celebration">Other Celebration</option>
                  </select>
                </div>

                {activeTab === "EVENT_PART_PACKAGE" ? (
                  <div>
                    <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                      Event Part / Function (Optional)
                    </label>
                    <select
                      value={eventPartId}
                      onChange={(e) => setEventPartId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                    >
                      <option value="">All Functions in {eventType}</option>
                      {availablePartsForType.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                      Associated Service Item *
                    </label>
                    <select
                      value={serviceItemId}
                      onChange={(e) => setServiceItemId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                    >
                      <option value="">Select Service...</option>
                      {serviceItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (₹{item.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Haldi Package or Premium Haldi Decoration"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-bold"
                />
              </div>

              <div>
                <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of what is included in this package..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground resize-none"
                />
              </div>

              {/* Pricing & Savings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-accent-gold mb-1">
                    Package Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="125000"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl font-mono text-sm font-bold text-accent-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                    Original / Ala-Carte Value (₹)
                  </label>
                  <input
                    type="number"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="150000"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl font-mono text-sm text-foreground"
                  />
                  {originalValue && Number(originalValue) > price && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                      ✓ Customer Savings: ₹{(Number(originalValue) - price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Budget Fit & Recommendation settings */}
              <div className="space-y-3 p-4 rounded-2xl bg-surface-raised border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-accent-gold">Recommendation Engine Rules</span>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-accent-gold focus:ring-accent-gold accent-[#D4AF37]"
                    />
                    <span>Mark as Recommended</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                      Min Target Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={minSuitableBudget}
                      onChange={(e) => setMinSuitableBudget(e.target.value ? parseFloat(e.target.value) : "")}
                      placeholder="50000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                      Max Target Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={maxSuitableBudget}
                      onChange={(e) => setMaxSuitableBudget(e.target.value ? parseFloat(e.target.value) : "")}
                      placeholder="300000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">
                      Recommendation Priority
                    </label>
                    <input
                      type="number"
                      value={recommendationPriority}
                      onChange={(e) => setRecommendationPriority(parseInt(e.target.value) || 0)}
                      placeholder="1"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Included Services list */}
              <div>
                <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                  Included Services Checklist (One per line)
                </label>
                <textarea
                  rows={4}
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  placeholder={"Theme Decoration & Stage\nDJ & Premium Sound System\nHD Photography & Videography\nLive Anchor / MC\nBuffet Catering (150 Plates)"}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono text-xs resize-none"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                    Reference Video URL
                  </label>
                  <input
                    type="text"
                    value={refVideoUrl}
                    onChange={(e) => setRefVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] uppercase font-bold text-muted-foreground mb-1">
                  Gallery Photo URLs (One URL per line)
                </label>
                <textarea
                  rows={2}
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono text-xs resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-surface hover:bg-surface-raised border border-border text-foreground font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md shadow-accent-gold/15 uppercase tracking-wider"
                >
                  {isPending ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
