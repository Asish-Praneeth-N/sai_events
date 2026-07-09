"use client";

import { useState } from "react";
import { addCustomService, deleteCustomService } from "./actions";
import MediaUploader from "@/components/admin/MediaUploader";
import { 
  Store, Plus, Trash2, ShieldCheck, DollarSign, FolderOpen, 
  Sparkles, Layers, Image as ImageIcon, ChevronDown, Check, X, AlertCircle,
  Tag, Info
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

  const filteredSubs = subcategories.filter((s) => s.category_id === selectedCategoryId);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const firstSub = subcategories.find((s) => s.category_id === catId);
    setSelectedSubcategoryId(firstSub?.id || "");
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
      setSuccess("Custom service package successfully published to your catalog.");
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
      className="rounded-[28px] bg-surface border border-border/80 shadow-xl overflow-hidden animate-scale-in"
    >
      <div className="px-6 py-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-border/40 flex items-center justify-between">
        <div>
          <span className="text-[8px] uppercase font-bold tracking-[0.25em] text-accent-gold">SAI CATALOG MANAGER</span>
          <h3 className="text-sm font-bold text-white font-heading mt-0.5">Publish New Offer</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-5 text-xs font-medium">
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
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Classification</label>
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
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Package Name</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Premium Venue Sound Calibration"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent-gold/45 text-foreground placeholder-muted-foreground text-xs font-light"
              />
            </div>

            {/* Custom Price */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Service Rate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 font-mono">₹</span>
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
                Catalog Photos <span className="text-zinc-500 font-normal lowercase font-sans">(max 3)</span>
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
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      
      {/* Toast notifications */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid view layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Custom catalog grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-1">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground font-sans">Business catalog</span>
              <h2 className="text-3xl font-light font-heading text-foreground">Services configuration</h2>
            </div>
            
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

          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-[32px] border border-dashed border-border/80 bg-surface/50 text-center p-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border/60 flex items-center justify-center mb-5 text-accent-gold shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Catalog is empty</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-light">
                Define your custom packages, pricing, and showcase attachments to receive event dispatch proposals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              {services.map((item) => {
                const isDeleting = deleteConfirmId === item.id;
                // Elegant visual CSS background gradient placeholder if there is no image
                const hasMedia = item.vendor_custom_service_media && item.vendor_custom_service_media.length > 0;
                const coverImage = hasMedia ? item.vendor_custom_service_media[0].media_url : "";

                return (
                  <div 
                    key={item.id}
                    className="group bg-surface border border-border/80 hover:border-accent-gold/25 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between hover-lift relative min-h-[300px]"
                  >
                    {/* Cover display media showcase */}
                    <div className="h-44 relative w-full overflow-hidden bg-gradient-to-br from-[#27201b] to-[#120e0d]">
                      {coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={coverImage} 
                          alt={item.service_name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                      
                      {/* Top tags overlay */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[8.5px] font-bold uppercase tracking-widest text-accent-gold border border-accent-gold/20 select-none">
                          {item.category_name}
                        </span>
                        
                        {!isDeleting ? (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-2 rounded-xl bg-black/60 hover:bg-red-950/80 hover:text-red-400 border border-white/10 text-zinc-300 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 animate-scale-in">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 text-[8.5px] font-bold text-muted-foreground rounded-lg hover:text-foreground"
                            >Keep</button>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(item.id)}
                              disabled={deleteLoading}
                              className="px-2.5 py-1 text-[8.5px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg"
                            >Delete</button>
                          </div>
                        )}
                      </div>

                      {/* Small visual showcase media slides count indicator overlay */}
                      {item.vendor_custom_service_media && item.vendor_custom_service_media.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[8.5px] font-mono text-zinc-400 font-bold border border-white/5">
                          +{item.vendor_custom_service_media.length - 1} images
                        </div>
                      )}
                    </div>

                    {/* Content text metadata info */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground font-mono block">
                          {item.subcategory_name}
                        </span>
                        <h4 className="text-sm font-bold text-foreground leading-normal line-clamp-2">
                          {item.service_name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-3">
                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase tracking-widest font-extrabold text-muted-foreground block font-sans">Custom Rate</span>
                          <span className="text-sm font-bold font-mono text-accent-gold">
                            ₹{Number(item.custom_price).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Pop up attachments of media files */}
                        {item.vendor_custom_service_media && item.vendor_custom_service_media.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {item.vendor_custom_service_media.map((med, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => window.open(med.media_url, "_blank")}
                                className="w-8 h-8 rounded-lg overflow-hidden border border-border hover:border-accent-gold/25 hover:scale-105 transition cursor-pointer bg-muted shrink-0"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={med.media_url} alt="Reference Showcase" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sticky desktop add offer form panel */}
        <div className="hidden lg:block lg:col-span-4 sticky top-28">
          {AddForm}
        </div>

      </div>

    </div>
  );
}
