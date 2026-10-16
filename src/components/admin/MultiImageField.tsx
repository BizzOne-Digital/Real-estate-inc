"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useToast } from "./Toast";
import { ACCEPTED_TYPES, discardUpload, uploadImage, validateImageFile, type UploadFolder } from "@/lib/upload-client";

/** Ordered list of images (first = cover). Uses the same MongoDB-backed upload endpoint as LocalImageField. */
export function MultiImageField({
  value,
  onChange,
  folder,
  label,
  max = 12,
  onBusyChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: UploadFolder;
  label: string;
  max?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const unsaved = useRef(new Set<string>());
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = max - latest.current.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (list.length < files.length) toast("error", `A product can have up to ${max} images.`);
    setBusy(true);
    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const problem = validateImageFile(file);
        if (problem) {
          toast("error", `${file.name}: ${problem}`);
          continue;
        }
        setProgress(`${i + 1} of ${list.length}`);
        try {
          const res = await uploadImage(file, folder);
          unsaved.current.add(res.url);
          onChange([...latest.current, res.url]);
          latest.current = [...latest.current, res.url];
        } catch (err) {
          toast("error", `${file.name}: ${err instanceof Error ? err.message : "Upload failed."}`);
        }
      }
      toast("success", "Images uploaded. Save to apply them.");
    } finally {
      setBusy(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    const url = value[i];
    if (unsaved.current.has(url)) {
      unsaved.current.delete(url);
      discardUpload(url);
    }
    onChange(value.filter((_, j) => j !== i));
  }

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <p className="field-label">{label}</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((url, i) => (
          <li key={url} className="overflow-hidden rounded border border-gray-200 bg-white">
            <div className="relative aspect-square bg-gray-50">
              <SafeImage src={url} alt={`Image ${i + 1}`} fill sizes="200px" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Cover</span>}
            </div>
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30" aria-label={`Move image ${i + 1} earlier`}>
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" disabled={busy || i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30" aria-label={`Move image ${i + 1} later`}>
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              </div>
              <button type="button" disabled={busy} onClick={() => removeAt(i)} className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30" aria-label={`Remove image ${i + 1}`}>
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {value.length < max && (
          <li>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 hover:border-navy hover:text-navy disabled:opacity-60"
            >
              {busy ? <Loader2 aria-hidden className="h-6 w-6 animate-spin" /> : <ImagePlus aria-hidden className="h-6 w-6" strokeWidth={1.25} />}
              {busy ? `Uploading ${progress}` : "Add images"}
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        aria-label={`Upload ${label}`}
        disabled={busy}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-gray-500">The first image is used as the cover. JPEG, PNG, WebP or GIF up to 8 MB each.</p>
    </div>
  );
}
