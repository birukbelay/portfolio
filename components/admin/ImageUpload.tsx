"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { LuImagePlus, LuLoaderCircle, LuLink, LuX } from "react-icons/lu";
import { toast } from "./toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: "video" | "square";
  required?: boolean;
}

export default function ImageUpload({ value, onChange, label = "Image", aspect = "video", required }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image", { description: "Use a PNG, JPG, WEBP or SVG file." });
      return;
    }
    setUploading(true);
    const id = toast.loading(`Uploading ${file.name}…`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      if (data.warning) {
        toast.warning("Image uploaded locally", { id, description: data.warning, duration: 8000 });
      } else {
        toast.success("Image uploaded", { id, description: "Remember to save to publish it." });
      }
    } catch (err) {
      toast.error("Upload failed", { id, description: err instanceof Error ? err.message : undefined, duration: 8000 });
    } finally {
      setUploading(false);
    }
  };

  const box = aspect === "video" ? "aspect-video w-full" : "h-28 w-28";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-zinc-800">
          {label}
          {required && <span className="ml-0.5 text-brand-500">*</span>}
        </span>
        <button type="button" onClick={() => setShowUrl((v) => !v)} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900">
          <LuLink size={12} /> {showUrl ? "Hide URL" : "Paste URL"}
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={`group relative overflow-hidden rounded-xl border-2 border-dashed transition ${box} ${
          dragOver ? "border-brand-500 bg-brand-50" : value ? "border-transparent" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
        }`}
      >
        {value ? (
          <>
            <Image src={value} alt="Preview" fill className={aspect === "video" ? "object-cover" : "object-contain p-3"} sizes="(max-width: 768px) 100vw, 600px" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/50 opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow">
                Replace
              </button>
              <button type="button" onClick={() => onChange("")} className="rounded-lg bg-white/90 p-1.5 text-zinc-700 shadow" aria-label="Remove image">
                <LuX size={14} />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
              <LuImagePlus size={18} />
            </span>
            {aspect === "video" && (
              <span className="text-xs text-zinc-500">
                <span className="font-medium text-zinc-800">Click to upload</span> or drag and drop
              </span>
            )}
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <LuLoaderCircle className="animate-spin text-zinc-500" size={22} />
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>

      {showUrl && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /assets/…"
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
      )}
    </div>
  );
}
