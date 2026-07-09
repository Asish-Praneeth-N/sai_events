"use client";

import { useState, useTransition } from "react";
import { deleteMediaObject } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  service_items: {
    name: string;
    subcategories: {
      name: string;
      categories: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface MediaLibraryProps {
  media: MediaItem[];
  categories: Category[];
}

export default function MediaLibrary({ media, categories }: MediaLibraryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMedia = selectedCategoryId === "all"
    ? media
    : media.filter(
        (m) => m.service_items?.subcategories?.categories?.id === selectedCategoryId
      );

  const handleDelete = (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this media item? This will remove the file from storage and the catalog item association.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteMediaObject(id, url);
        alert("Media deleted successfully!");
      } catch (err: any) {
        alert(err.message || "Failed to delete media.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border border-border/50 rounded-2xl shadow-sm hover:shadow transition duration-200">
        <div className="flex items-center gap-3">
          <label htmlFor="categoryFilter" className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-foreground transition-all duration-200"
          >
            <option value="all">All Service Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Showing {filteredMedia.length} files
        </span>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
          No media files found in the library for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          {filteredMedia.map((item) => {
            const isDeleting = deletingId === item.id;
            
            return (
              <div
                key={item.id}
                className="group relative bg-surface border border-border/50 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                {/* Visual Preview */}
                <div className="aspect-video bg-muted/30 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                  {item.media_type === "video" ? (
                    <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                      <span className="h-8 w-8 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-bold">
                        ▶
                      </span>

                      <span>Video Asset</span>
                    </div>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.service_items?.name || "Media file"}
                      className="object-cover h-full w-full group-hover:scale-105 transition duration-300"
                    />
                  )}

                  {/* Absolute Delete Button Overlay */}
                  <button
                    onClick={() => handleDelete(item.id, item.media_url)}
                    disabled={isDeleting}
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-600 text-[10px] font-bold cursor-pointer"
                  >
                    {isDeleting ? "..." : "Delete"}
                  </button>
                </div>

                {/* Metadata details */}
                <div className="p-3.5 space-y-1.5">
                  <div className="font-bold text-foreground truncate text-xs" title={item.service_items?.name}>
                    {item.service_items?.name || "Catalog Item"}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>{item.service_items?.subcategories?.categories?.name || "Service"}</span>
                    <span className="font-bold tracking-wider">{item.media_type.toUpperCase()}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono font-semibold pt-1.5 border-t border-border/50 mt-1">
                    Uploaded: {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
