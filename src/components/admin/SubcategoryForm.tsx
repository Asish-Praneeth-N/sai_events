"use client";

import { useState, useTransition } from "react";
import { saveSubcategory } from "@/app/admin/catalog/actions";
import { Subcategory, Category } from "@/lib/types";

interface SubcategoryFormProps {
  subcategory?: Subcategory | null;
  categories: Category[];
  defaultCategoryId?: string;
  onClose: () => void;
}

export default function SubcategoryForm({
  subcategory,
  categories,
  defaultCategoryId,
  onClose,
}: SubcategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(subcategory?.category_id || defaultCategoryId || "");
  const [name, setName] = useState(subcategory?.name || "");
  const [description, setDescription] = useState(subcategory?.description || "");
  const [isActive, setIsActive] = useState(subcategory?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(subcategory?.sort_order || 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Please select a parent category.");
      return;
    }

    startTransition(async () => {
      try {
        await saveSubcategory({
          id: subcategory?.id,
          category_id: categoryId,
          name,
          description,
          is_active: isActive,
          sort_order: sortOrder,
        });
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to save subcategory.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-4 animate-scale-in">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-lg font-bold font-heading text-foreground">
            {subcategory ? "Edit Subcategory" : "Add Subcategory"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subcategory Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Veg, Non-Veg, Wedding, Birthday"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of this subcategory"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground resize-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-accent-gold focus:ring-accent-gold bg-background h-4.5 w-4.5 cursor-pointer"
                />
                <span>Is Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-surface hover:bg-surface-raised text-foreground border border-border rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-accent-gold hover:brightness-110 disabled:opacity-50 text-black font-bold rounded-xl transition cursor-pointer text-xs shadow-md shadow-accent-gold/15"
            >
              {isPending ? "Saving..." : "Save Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
