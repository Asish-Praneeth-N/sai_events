"use client";

import { useState } from "react";
import { addCustomService, deleteCustomService } from "./actions";
import MediaUploader from "@/components/admin/MediaUploader";

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

type ToastState = { message: string; type: "success" | "error" } | null;

function Toast({ toast, onDismiss }: { toast: NonNullable<ToastState>; onDismiss: () => void }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-slide-down ${
      toast.type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
    }`}>
      {toast.type === "success" ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 cursor-pointer">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition duration-200";

export default function VendorServicesManager({ initialServices, categories, subcategories }: Props) {
  const [services, setServices] = useState<CustomService[]>(initialServices);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
  const [toast, setToast] = useState<ToastState>(null);
  const [showAddForm, setShowAddForm] = useState(false); // for mobile toggle

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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
    try {
      const catObj = categories.find((c) => c.id === selectedCategoryId);
      const subObj = subcategories.find((s) => s.id === selectedSubcategoryId);
      if (!catObj) throw new Error("Select a category.");
      if (!subObj) throw new Error("Select a subcategory.");
      if (!serviceName.trim()) throw new Error("Service name is required.");
      const price = Number(customPrice);
      if (isNaN(price) || price < 0) throw new Error("Enter a valid price ≥ 0.");

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
      showToast("Service added to your catalog.", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to add service.", "error");
      setAddLoading(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteCustomService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
      showToast("Service removed.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to remove service.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const AddForm = (
    <form
      onSubmit={handleAdd}
      className="rounded-3xl bg-surface border border-border shadow-sm overflow-hidden"
    >
      {/* Form header */}
      <div className="px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white font-heading">Add Custom Service</h3>
          <p className="text-[10px] text-purple-200 mt-0.5">Define a package with your own pricing</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="lg:hidden p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-4">No categories configured by admin yet.</p>
        ) : (
          <>
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</label>
              <select id="catSelect" value={selectedCategoryId} onChange={(e) => handleCategoryChange(e.target.value)} className={inputClass}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Subcategory</label>
              <select
                id="subSelect"
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                disabled={filteredSubs.length === 0}
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {filteredSubs.length === 0
                  ? <option value="">No subcategories</option>
                  : filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                }
              </select>
            </div>

            {/* Service Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Package Name</label>
              <input
                id="serviceInput"
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Candid Wedding Package"
                className={inputClass}
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Your Price</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 dark:text-zinc-500 pointer-events-none">₹</span>
                <input
                  id="priceInput"
                  type="number"
                  required
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="e.g. 15000"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Showcase Photos <span className="text-zinc-400 dark:text-zinc-500 normal-case font-normal">(optional, max 3)</span>
              </label>
              <MediaUploader value={mediaUrls} onChange={setMediaUrls} limit={3} />
            </div>

            <button
              type="submit"
              disabled={addLoading || filteredSubs.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 cursor-pointer"
            >
              {addLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Publish Service
                </>
              )}
            </button>
          </>
        )}
      </div>
    </form>
  );

  return (
    <div className="space-y-4 animate-fade-in-up">
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Mobile: Add button */}
      {!showAddForm && (
        <div className="lg:hidden">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-purple-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Service
          </button>
        </div>
      )}

      {/* Mobile form */}
      {showAddForm && <div className="lg:hidden">{AddForm}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left: Service Catalog ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Catalog header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Your Catalog</h2>
              {services.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400 rounded-full">
                  {services.length} {services.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-surface text-center p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-bold text-foreground">Your catalog is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first service using the form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([catName, subGroups]) => {
                const isExpanded = expandedCategories.has(catName);
                const serviceCount = Object.values(subGroups).flat().length;

                return (
                  <div key={catName} className="rounded-3xl bg-surface border border-border shadow-sm overflow-hidden">
                    {/* Category header (accordion toggle) */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(catName)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500 flex-shrink-0" />
                        <span className="text-sm font-bold text-foreground">{catName}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full font-bold">
                          {serviceCount}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion body */}
                    {isExpanded && (
                      <div className="p-5 space-y-5 border-t border-border/40 animate-slide-down">
                        {Object.entries(subGroups).map(([subName, items]) => (
                          <div key={subName} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-0.5 h-3.5 rounded-full bg-indigo-400 dark:bg-indigo-500 flex-shrink-0" />
                              <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{subName}</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {items.map((item) => {
                                const isDeleting = deleteConfirmId === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    className="group relative p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-border shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200"
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h5 className="text-sm font-bold text-foreground leading-snug">{item.service_name}</h5>
                                      {!isDeleting ? (
                                        <button
                                          onClick={() => setDeleteConfirmId(item.id)}
                                          type="button"
                                          className="flex-shrink-0 p-1 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                                          title="Remove"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1.5 animate-scale-in flex-shrink-0">
                                          <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            type="button"
                                            className="px-2 py-1 text-[10px] font-bold border border-border text-muted-foreground rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                                          >
                                            Keep
                                          </button>
                                          <button
                                            onClick={() => handleDeleteConfirm(item.id)}
                                            disabled={deleteLoading}
                                            type="button"
                                            className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition cursor-pointer disabled:opacity-50"
                                          >
                                            {deleteLoading ? "…" : "Delete"}
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/5 border border-purple-200/50 dark:border-purple-900/30 rounded-xl mb-3">
                                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                        ₹{Number(item.custom_price).toLocaleString("en-IN")}
                                      </span>
                                    </div>

                                    {/* Image thumbs */}
                                    {item.vendor_custom_service_media?.length > 0 && (
                                      <div className="flex gap-1.5 flex-wrap">
                                        {item.vendor_custom_service_media.map((med, idx) => (
                                          <button
                                            key={idx}
                                            type="button"
                                            onClick={() => window.open(med.media_url, "_blank")}
                                            className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-zinc-100 dark:bg-zinc-900 hover:scale-110 transition-transform duration-200 cursor-pointer"
                                          >
                                            <img src={med.media_url} alt="Showcase" className="w-full h-full object-cover" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
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

        {/* ── Right: Add Form (desktop) ── */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">{AddForm}</div>
        </div>
      </div>
    </div>
  );
}
