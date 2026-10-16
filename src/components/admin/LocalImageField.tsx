"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useToast } from "./Toast";
import { ACCEPTED_TYPES, discardUpload, uploadImage, validateImageFile, type UploadFolder } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label: string;
  alt?: string;
  help?: string;
  aspect?: string; // tailwind aspect class for the preview
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

/**
 * Reusable admin image input. Uploads to /api/upload (MongoDB-backed storage) and reports
 * the saved public URL via onChange. Removing returns an empty string.
 */
export function LocalImageField({ value, onChange, folder, label, alt, help, aspect = "aspect-[4/3]", disabled, onBusyChange }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  // URLs uploaded in this editing session that have not been saved anywhere yet.
  const unsaved = useRef(new Set<string>());

  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      toast("error", problem);
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, folder, setProgress);
      const previous = value;
      unsaved.current.add(result.url);
      onChange(result.url);
      // A replaced image that was uploaded in this session (and never saved) can be discarded now.
      if (previous && unsaved.current.has(previous)) {
        unsaved.current.delete(previous);
        discardUpload(previous);
      }
      toast("success", "Image uploaded. Save to apply it.");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove() {
    if (value && unsaved.current.has(value)) {
      unsaved.current.delete(value);
      discardUpload(value);
    }
    onChange("");
  }

  const locked = busy || disabled;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className={cn("relative w-full overflow-hidden rounded border border-gray-200 bg-gray-50 sm:w-56", aspect)}>
          {value ? (
            <SafeImage src={value} alt={alt || label} fill sizes="224px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <ImagePlus aria-hidden className="h-8 w-8" strokeWidth={1.25} />
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-sm text-gray-700">
              <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
              Uploading {Math.round(progress * 100)}%
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={locked}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button type="button" className="admin-btn-ghost" disabled={locked} onClick={() => inputRef.current?.click()}>
            {value ? <RefreshCw aria-hidden className="h-4 w-4" /> : <ImagePlus aria-hidden className="h-4 w-4" />}
            {value ? "Replace" : "Upload image"}
          </button>
          {value && (
            <button type="button" className="admin-btn-ghost text-red-700" disabled={locked} onClick={remove}>
              <Trash2 aria-hidden className="h-4 w-4" /> Remove
            </button>
          )}
          <p className="max-w-[16rem] text-xs text-gray-500">{help ?? "JPEG, PNG, WebP or GIF, up to 8 MB."}</p>
        </div>
      </div>
    </div>
  );
}
