"use client";

import { useState } from "react";
import { MainCategory } from "@/lib/types";
import { saveMainCategory } from "@/app/admin/catalog/actions";
import { X, Layers, Image as ImageIcon } from "lucide-react";

interface MainCategoryFormProps {
  mainCategory: MainCategory | null;
  onClose: () => void;
}

export default function MainCategoryForm({ mainCategory, onClose }: MainCategoryFormProps) {
  const [name, setName] = useState(mainCategory?.name || "");
  const [description, setDescription] = useState(mainCategory?.description || "");
  const [imageUrl, setImageUrl] = useState(mainCategory?.image_url || "");
  const [sortOrder, setSortOrder] = useState<number>(mainCategory?.sort_order ?? 1);
  const [isActive, setIsActive] = useState<boolean>(mainCategory?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await saveMainCategory({
        id: mainCategory?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        sort_order: sortOrder,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save main category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-surface border border-accent-gold/40 rounded-3xl max-w-md w-full overflow-hidden p-6 space-y-5 shadow-2xl animate-scale-in select-none">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-gold" />
            <h3 className="text-base font-bold text-foreground font-heading">
              {mainCategory ? "Edit Main Category" : "New Main Category (Level 1)"}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-muted-foreground uppercase">Main Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wedding Matrimony / Corporate Gala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-muted-foreground uppercase">Description</label>
            <textarea
              rows={2}
              placeholder="Broad classification of event themes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-muted-foreground uppercase">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-semibold text-muted-foreground uppercase">Status</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2 rounded-xl border font-bold uppercase text-[10px] cursor-pointer transition ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md"
            >
              {loading ? "Saving..." : "Save Main Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
