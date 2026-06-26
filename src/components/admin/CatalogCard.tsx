"use client";

import { useTransition } from "react";
import { ServiceItem } from "@/lib/types";
import { deleteServiceItem } from "@/app/admin/catalog/actions";

interface CatalogCardProps {
  item: ServiceItem & { media?: string[] };
  onEdit: (item: ServiceItem & { media?: string[] }) => void;
}

export default function CatalogCard({ item, onEdit }: CatalogCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      startTransition(async () => {
        try {
          await deleteServiceItem(item.id);
        } catch (err: any) {
          alert(err.message || "Failed to delete item.");
        }
      });
    }
  };

  const firstImage = item.media && item.media.length > 0 ? item.media[0] : null;

  return (
    <div className="flex gap-4 p-4 bg-surface border border-border/50 rounded-2xl relative group hover:shadow-md transition-all duration-300">
      {/* Media Preview */}
      <div className="w-20 h-20 bg-muted/30 border border-border/50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
        {firstImage ? (
          firstImage.toLowerCase().endsWith(".mp4") ? (
            <video src={firstImage} className="w-full h-full object-cover" muted />
          ) : (
            <img src={firstImage} alt={item.name} className="w-full h-full object-cover" />
          )
        ) : (
          <span className="text-[10px] text-muted-foreground font-medium">No Media</span>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading font-bold text-foreground text-sm truncate">{item.name}</h4>
          <span
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
              item.is_available
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                : "bg-muted text-muted-foreground border border-border/50"
            }`}
          >
            {item.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-purple-600 dark:text-purple-400 font-bold text-xs font-mono">
            {item.price.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}{" "}
            {item.pricing_type === "per_plate" ? "/ Plate" : ""}
          </span>

          <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition duration-200">
            <button
              onClick={() => onEdit(item)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs font-bold text-red-500 hover:text-red-400 disabled:opacity-50 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
