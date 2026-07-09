"use client";

import { useState } from "react";
import { addCustomService, deleteCustomService } from "./actions";
import MediaUploader from "@/components/admin/MediaUploader";
import { 
  Store, Plus, Trash2, ShieldCheck, DollarSign, FolderOpen, 
  Sparkles, Layers, Image as ImageIcon, ChevronDown, Check, X, AlertCircle
} from "lucide-react";

interface CustomMedia { media_url: string; }
interface CustomService {
  id: string;
  category_name: string;
  subcategory_name: string;
  service_name: string;
  custom_price: number;
  vendor_custom_service_media: CustomMedia[];
}
interface Category { id: string; name: string; }
interface Subcategory { id: string; category_id: string; name: string; }

interface Props {
  initialServices: CustomService[];
  categories: Category[];
  subcategories: Subcategory[];
}

export default function VendorServicesManager({ initialServices, categories, subcategories }: Props) {
  const [services, setServices] = useState<CustomService[]>(initialServices);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.name)));

  const [selectedCategoryId, setSelectedCategoryId] = useState(() => categories[0]?.id || "");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(() => {
    const firstCatId = categories[0]?.id;
    if (firstCatId) return subcategories.find((s) => s.category_id === firstCatId)?.id || "";
    return "";
  });
  const [serviceName, setServiceName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Group services
  const grouped: Record<string, Record<string, CustomService[]>> = {};
  services.forEach((s) => {
    const cat = s.category_name.trim();
    const sub = s.subcategory_name.trim();
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][sub]) grouped[cat][sub] = [];
    grouped[cat][sub].push(s);
  });

  const filteredSubs = subcategories.filter((s) => s.category_id === selectedCategoryId);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const firstSub = subcategories.find((s) => s.category_id === catId);
    setSelectedSubcategoryId(firstSub?.id || "");
  };

  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) next.delete(catName);
      else next.add(catName);
      return next;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const catObj = categories.find((c) => c.id === selectedCategoryId);
      const subObj = subcategories.find((s) => s.id === selectedSubcategoryId);
      if (!catObj) throw new Error("Select a category.");
      if (!subObj) throw new Error("Select a subcategory.");
      if (!serviceName.trim()) throw new Error("Service package name is required.");
      
      const price = Number(customPrice);
      if (isNaN(price) || price < 0) throw new Error("Enter a valid custom price ≥ 0.");

      await addCustomService({
        categoryName: catObj.name,
        subcategoryName: subObj.name,
        serviceName: serviceName.trim(),
        customPrice: price,
        mediaUrls,
      });

      setServiceName("");
      setCustomPrice("");
      setMediaUrls([]);
      setSuccess("Custom service package successfully published.");
      setShowAddForm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to publish service.");
      setAddLoading(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteCustomService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
      setSuccess("Service package deleted.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to remove service.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const AddForm = (
    <form
      onSubmit={handleAdd}
      className="rounded-3xl bg-surface border border-border/80 shadow-md overflow-hidden animate-scale-in"
    >
      <div className="px-6 py-5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-border/40 flex items-center justify-between">
        <div>
          <span className="text-[8px] uppercase font-bold tracking-[0.25em] text-accent-gold">SAI CATALOG MANAGER</span>
          <h3 className="text-sm font-bold text-white font-heading mt-0.5">Add Custom Offer</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-4 text-xs font-medium">
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-6">No service channels configured.</p>
        ) : (
          <>
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Service Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground cursor-pointer text-xs"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Subcategory Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Sub-channel classification</label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                disabled={filteredSubs.length === 0}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                {filteredSubs.length === 0 ? (
                  <option value="">No subcategories</option>
                ) : (
                  filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                )}
              </select>
            </div>

            {/* Service Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Package Descriptor</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Premium Stage Sound Calibration"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground text-xs"
              />
            </div>

            {/* Custom Price */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Custom Rate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full px-4 py-3 pl-8 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground font-mono text-xs"
                />
              </div>
            </div>

            {/* Photos Showcase */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                Showcase media <span className="text-zinc-500 font-normal lowercase font-sans">(optional, max 3)</span>
              </label>
              <MediaUploader value={mediaUrls} onChange={setMediaUrls} limit={3} />
            </div>

            <button
              type="submit"
              disabled={addLoading || filteredSubs.length === 0}
              className="w-full py-3 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
            >
              {addLoading ? "Publishing Catalog Offer..." : "Publish Service Package"}
            </button>
          </>
        )}
      </div>
    </form>
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Toast notifications */}
      {error && (
        <div className="p-4 bg-red-950/35 border border-red-900/40 text-red-400 text-xs rounded-2xl flex items-center justify-between gap-3 animate-fade-in max-w-4xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/35 border border-emerald-900/40 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in max-w-4xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Desktop form toggle / catalog layout wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Catalog List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-1">
            <div className="space-y-0.5">
              <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-accent-gold">Business Catalog</span>
              <h2 className="text-xl font-light font-heading text-foreground">Services Configuration</h2>
            </div>
            
            {/* Mobile form drawer toggle */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="lg:hidden px-4.5 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1 shadow-md shadow-[#D4AF37]/10"
              >
                <Plus className="w-4 h-4" /> Add Offer
              </button>
            )}
          </div>

          {showAddForm && <div className="lg:hidden">{AddForm}</div>}

          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-5 text-accent-gold shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Business catalog is empty</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light">
                Define your custom packages, rates, and reference photos to list your offerings for assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([catName, subGroups]) => {
                const isExpanded = expandedCategories.has(catName);
                const serviceCount = Object.values(subGroups).flat().length;

                return (
                  <div key={catName} className="rounded-3xl bg-surface border border-border/80 shadow-sm overflow-hidden transition-all duration-300">
                    
                    {/* Header trigger */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(catName)}
                      className="w-full flex items-center justify-between px-6 py-5 bg-background/30 hover:bg-surface-raised cursor-pointer transition duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[3px] h-4 bg-accent-gold rounded-full shrink-0" />
                        <span className="text-sm font-bold text-foreground font-heading">{catName} Group</span>
                        <span className="px-2 py-0.5 bg-background border border-border text-accent-gold text-[9px] font-bold rounded-lg font-mono">
                          {serviceCount} {serviceCount === 1 ? "Offer" : "Offers"}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-accent-gold" : ""
                      }`} />
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="p-6 space-y-6 border-t border-border/40 bg-surface/30 animate-scale-in">
                        {Object.entries(subGroups).map(([subName, items]) => (
                          <div key={subName} className="space-y-3.5">
                            
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/60 shrink-0" />
                              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{subName}</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {items.map((item) => {
                                const isDeleting = deleteConfirmId === item.id;
                                return (
                                  <div 
                                    key={item.id}
                                    className="p-5 bg-background border border-border/60 hover:border-accent-gold/15 rounded-2xl flex flex-col justify-between gap-4 transition duration-300 shadow-sm group relative"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <h5 className="text-xs font-bold text-foreground leading-normal max-w-[190px]">{item.service_name}</h5>
                                      
                                      {/* Delete action hooks */}
                                      {!isDeleting ? (
                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirmId(item.id)}
                                          className="p-1.5 rounded-lg text-zinc-300 hover:text-red-400 hover:bg-red-950/10 opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1 animate-scale-in shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="px-2 py-1 text-[8.5px] font-bold border border-border text-muted-foreground rounded-lg"
                                          >
                                            Keep
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteConfirm(item.id)}
                                            disabled={deleteLoading}
                                            className="px-2 py-1 text-[8.5px] font-bold bg-red-600 text-white rounded-lg"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Footer details pricing */}
                                    <div className="border-t border-border/40 pt-3 mt-1 flex flex-col gap-3">
                                      <div className="flex justify-between items-center text-xs font-mono">
                                        <span className="text-[8px] uppercase font-bold text-zinc-400 font-sans tracking-wider">Custom Rate</span>
                                        <span className="font-bold text-accent-gold text-xs">
                                          ₹{Number(item.custom_price).toLocaleString("en-IN")}
                                        </span>
                                      </div>

                                      {/* Media Showcase attachments */}
                                      {item.vendor_custom_service_media?.length > 0 && (
                                        <div className="flex gap-2.5 flex-wrap">
                                          {item.vendor_custom_service_media.map((med, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => window.open(med.media_url, "_blank")}
                                              className="w-10 h-10 rounded-xl overflow-hidden border border-border hover:border-accent-gold/25 hover:scale-105 transition cursor-pointer bg-muted shrink-0"
                                            >
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={med.media_url} alt="Showcase" className="w-full h-full object-cover" />
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sticky desktop form panel */}
        <div className="hidden lg:block lg:col-span-4 sticky top-28">
          {AddForm}
        </div>

      </div>

    </div>
  );
}
