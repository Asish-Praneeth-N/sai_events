"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderPlus, Upload, Trash2, Image as ImageIcon, Sparkles, 
  Folder, Eye, Plus, Check, X, Film, Search, Tag
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export interface MediaItem {
  id: string;
  folderName: string;
  url: string;
  title: string;
  createdAt: string;
}

export const DEFAULT_MEDIA_FOLDERS = [
  "Stage & Mandap Decor",
  "Lighting & Ambience",
  "Seating & Layouts",
  "Catering & Table Setup",
];

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "sample-1",
    folderName: "Stage & Mandap Decor",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    title: "Floral Royal Stage Setup",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    folderName: "Lighting & Ambience",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    title: "Crystal Chandelier Canopy",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-3",
    folderName: "Seating & Layouts",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    title: "Velvet Banquet Seating",
    createdAt: new Date().toISOString(),
  },
];

export function getStoredCustomerMedia(): { folders: string[]; items: MediaItem[] } {
  if (typeof window === "undefined") return { folders: DEFAULT_MEDIA_FOLDERS, items: INITIAL_MEDIA_ITEMS };
  try {
    const raw = localStorage.getItem("sai_events_customer_media");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        folders: parsed.folders || DEFAULT_MEDIA_FOLDERS,
        items: parsed.items || INITIAL_MEDIA_ITEMS,
      };
    }
  } catch (_) {}
  return { folders: DEFAULT_MEDIA_FOLDERS, items: INITIAL_MEDIA_ITEMS };
}

export function saveStoredCustomerMedia(folders: string[], items: MediaItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sai_events_customer_media", JSON.stringify({ folders, items }));
  } catch (_) {}
}

export default function CustomerMediaStudio() {
  const [folders, setFolders] = useState<string[]>(DEFAULT_MEDIA_FOLDERS);
  const [items, setItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [activeFolder, setActiveFolder] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadFolder, setUploadFolder] = useState<string>(DEFAULT_MEDIA_FOLDERS[0]);
  const [uploadImageUrl, setUploadImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingState, setUploadingState] = useState<boolean>(false);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // Load stored customer media on mount
  useEffect(() => {
    const data = getStoredCustomerMedia();
    setFolders(data.folders);
    setItems(data.items);
  }, []);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    if (folders.includes(trimmed)) {
      alert("Folder already exists!");
      return;
    }
    const updatedFolders = [...folders, trimmed];
    setFolders(updatedFolders);
    saveStoredCustomerMedia(updatedFolders, items);
    setNewFolderName("");
    setShowNewFolderModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setUploadImageUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMediaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = uploadImageUrl.trim();
    if (!finalUrl && !selectedFile) {
      alert("Please upload an image file or provide an image URL.");
      return;
    }

    setUploadingState(true);

    // Attempt direct upload to Supabase Storage Bucket 'customer-media' if file is selected
    if (selectedFile) {
      try {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("customer-media")
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("customer-media")
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
          }
        }
      } catch (_) {
        // Fallback to data URL or link if storage bucket policy is not run yet
      }
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      folderName: uploadFolder || "General",
      url: finalUrl,
      title: uploadTitle.trim() || "Event Reference Photo",
      createdAt: new Date().toISOString(),
    };
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    saveStoredCustomerMedia(folders, updatedItems);

    setUploadingState(false);
    setUploadTitle("");
    setUploadImageUrl("");
    setSelectedFile(null);
    setShowUploadModal(false);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    const updatedItems = items.filter((i) => i.id !== id);
    setItems(updatedItems);
    saveStoredCustomerMedia(folders, updatedItems);
  };

  const filteredItems = items.filter((item) => {
    const matchesFolder = activeFolder === "All" || item.folderName === activeFolder;
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.folderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Studio Header Banner ── */}
      <div className="p-6 sm:p-8 bg-[#fbf7f0] dark:bg-[#161813] border border-[#173d2c]/10 dark:border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-[#a17a34]" />
            <Sparkles className="w-3.5 h-3.5 text-[#a17a34] dark:text-[#d2b56b]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#9a742e] dark:text-[#d2b56b]">
              Visual Media Library
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-heading text-[#143d2b] dark:text-[#f0e8db]" style={{ fontFamily: '"Playfair Display", serif' }}>
            Media & Inspiration Studio
          </h2>
          <p className="text-xs text-[#173d2c]/65 dark:text-[#eee5d7]/55 font-light max-w-xl">
            Create custom folders, upload reference photos, and curate visual inspirations for your celebrations. Attached photos will be shared directly with your SAI EVENTS planner.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="px-4 py-2.5 bg-[#f3eadf] dark:bg-white/[0.05] border border-[#173d2c]/15 dark:border-white/[0.10] text-[#143d2b] dark:text-[#f0e8db] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:border-[#a17a34] flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#9a742e] dark:text-[#d2b56b]" />
            <span>New Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] transition hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* ── Folder Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#173d2c]/10 dark:border-white/[0.08] pb-4">
        {/* Folders Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveFolder("All")}
            className={`px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeFolder === "All"
                ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] shadow-sm"
                : "bg-[#f8f2e9] dark:bg-[#171914] text-[#173d2c]/70 dark:text-[#eee5d7]/70 hover:border-[#a17a34] border border-transparent"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>All Media ({items.length})</span>
          </button>

          {folders.map((folder) => {
            const count = items.filter((i) => i.folderName === folder).length;
            const isSelected = activeFolder === folder;
            return (
              <button
                key={folder}
                type="button"
                onClick={() => setActiveFolder(folder)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] border-[#143d2b] dark:border-[#d2b56b] shadow-sm"
                    : "bg-[#f8f2e9] dark:bg-[#171914] border-[#173d2c]/10 dark:border-white/[0.08] text-[#173d2c]/75 dark:text-[#eee5d7]/75 hover:border-[#a17a34]"
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-[#9a742e] dark:text-[#d2b56b]" />
                <span>{folder}</span>
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#173d2c]/40 dark:text-[#eee5d7]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media items..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8f2e9] dark:bg-[#171914] border border-[#173d2c]/12 dark:border-white/10 text-[#143d2b] dark:text-[#f0e8db] focus:outline-none focus:border-[#a17a34]"
          />
        </div>
      </div>

      {/* ── Photos Grid ── */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#173d2c]/15 dark:border-white/[0.08] bg-[#fbf7f0]/50 dark:bg-[#161813]/40 p-8 space-y-3">
          <ImageIcon className="w-10 h-10 text-[#a17a34]/40 dark:text-[#d2b56b]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#143d2b] dark:text-[#f0e8db]">No Media Found in "{activeFolder}"</h3>
          <p className="text-xs text-[#173d2c]/60 dark:text-[#eee5d7]/50 max-w-sm mx-auto font-light">
            Upload reference images or design inspiration photos to organize them inside your folders.
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="mt-3 px-4 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm hover:brightness-110"
          >
            Upload Photo Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#f8f2e9] dark:bg-[#171914] border border-[#173d2c]/12 dark:border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-[#a17a34]/60 hover:shadow-lg flex flex-col justify-between"
            >
              {/* Photo Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80";
                  }}
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewZoomUrl(item.url)}
                    className="p-2 bg-white/90 text-black rounded-full hover:bg-white transition cursor-pointer"
                    title="View Full Size"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-red-600/90 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#143d2b]/80 backdrop-blur-sm text-[#fffaf1] text-[8px] font-bold uppercase tracking-wider">
                  {item.folderName}
                </span>
              </div>

              {/* Photo Details */}
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-[#143d2b] dark:text-[#f0e8db] truncate">{item.title}</h4>
                <div className="flex items-center justify-between text-[9px] font-mono text-[#173d2c]/50 dark:text-[#eee5d7]/40">
                  <span>Photo ID: #{item.id.slice(-4)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Create New Folder ── */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleCreateFolder} className="bg-[#f8f2e9] dark:bg-[#171914] border border-[#a17a34]/40 w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#9a742e] dark:text-[#d2b56b]" />
                <span>Create New Media Folder</span>
              </h3>
              <button type="button" onClick={() => setShowNewFolderModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9.5px] uppercase font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50">Folder Name *</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Mandap Floral Themes, Cocktail Bar Setup"
                className="w-full px-3.5 py-2.5 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] focus:outline-none focus:border-[#a17a34]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-xs font-bold uppercase tracking-wider"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal: Upload Photo ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleSaveMediaItem} className="bg-[#f8f2e9] dark:bg-[#171914] border border-[#a17a34]/40 w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#173d2c]/10 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#143d2b] dark:text-[#f0e8db] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#9a742e] dark:text-[#d2b56b]" />
                <span>Upload Reference Photo</span>
              </h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9.5px] uppercase font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50">Target Folder *</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] cursor-pointer"
                >
                  {folders.map((f) => (
                    <option key={f} value={f} className="bg-[#f8f2e9] dark:bg-[#171914]">{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9.5px] uppercase font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50">Photo Title / Caption *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Royal Gold Entrance Arch Inspiration"
                  className="w-full px-3.5 py-2.5 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs text-[#143d2b] dark:text-[#f0e8db] focus:outline-none focus:border-[#a17a34]"
                />
              </div>

              {/* Upload Option 1: File from Device */}
              <div className="space-y-1.5">
                <label className="block text-[9.5px] uppercase font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50">Option 1: Choose File from Device</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs cursor-pointer"
                />
              </div>

              {/* Upload Option 2: Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[9.5px] uppercase font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/50">Option 2: Image Web URL (Or paste link)</label>
                <input
                  type="url"
                  value={uploadImageUrl}
                  onChange={(e) => setUploadImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 bg-[#fffaf3] dark:bg-[#11130f] border border-[#173d2c]/15 dark:border-white/10 text-xs font-mono text-[#143d2b] dark:text-[#f0e8db] focus:outline-none focus:border-[#a17a34]"
                />
              </div>

              {/* Image Preview */}
              {uploadImageUrl && (
                <div className="p-2 border border-[#a17a34]/30 bg-black/5 rounded space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#a17a34]">Photo Preview:</span>
                  <div className="h-32 w-full overflow-hidden bg-black/20 relative">
                    <img src={uploadImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#173d2c]/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#173d2c]/60 dark:text-[#eee5d7]/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!uploadImageUrl}
                className="px-5 py-2 bg-[#143d2b] text-[#fffaf1] dark:bg-[#d2b56b] dark:text-[#161812] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Save Photo to Media
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Zoom Lightbox Modal ── */}
      {previewZoomUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden">
            <img src={previewZoomUrl} alt="Enlarged preview" className="max-w-full max-h-[85vh] object-contain shadow-2xl" />
            <button
              type="button"
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
