"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface MediaUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  limit?: number;
}

export default function MediaUploader({
  value,
  onChange,
  limit = 5,
}: MediaUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [...value];

    try {
      for (const file of files) {
        if (uploadedUrls.length >= limit) {
          alert(`You can upload up to ${limit} files only.`);
          break;
        }

        const fileExt = file.name.split(".").pop();
        const filePath = `service-items/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("service-media")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("service-media")
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      onChange(uploadedUrls);
    } catch (err: any) {
      alert(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Uploaded Previews */}
        {value.map((url, index) => (
          <div
            key={index}
            className="relative w-20 h-20 border border-border/50 rounded-xl overflow-hidden bg-background group"
          >
            {url.toLowerCase().endsWith(".mp4") ? (
              <video src={url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow cursor-pointer"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Button */}
        {value.length < limit && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[10px] font-semibold text-purple-600">Uploading</span>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-bold">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {value.length > 0 && (
        <p className="text-[10px] text-muted-foreground font-semibold">
          {value.length}/{limit} images uploaded
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple
        accept="image/*,video/mp4"
        className="hidden"
      />
    </div>
  );
}
