"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveCategory } from "@/app/admin/actions/categories";
import { LocalImageField } from "./LocalImageField";
import { useToast } from "./Toast";
import type { CategoryInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export function CategoryForm({ id, initial }: { id: string | null; initial: CategoryInput }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof CategoryInput>(k: K, val: CategoryInput[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveCategory(id, v);
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Saved.");
      if (!id && res.data) router.replace(`/admin/categories/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="admin-card max-w-3xl space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">Name *</label>
          <input
            id="name"
            required
            maxLength={80}
            value={v.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="slug" className="field-label">URL slug *</label>
          <input
            id="slug"
            required
            maxLength={90}
            value={v.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value.toLowerCase());
            }}
            className="field-input font-mono text-xs"
          />
          <p className="mt-1 text-xs text-gray-500">/collections/{v.slug || "…"}</p>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="field-label">Description</label>
        <textarea id="description" rows={4} maxLength={2000} value={v.description} onChange={(e) => set("description", e.target.value)} className="field-input" />
      </div>
      <LocalImageField label="Collection image" folder="products" value={v.image} onChange={(url) => set("image", url)} onBusyChange={setUploading} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="order" className="field-label">Display order</label>
          <input id="order" type="number" min={0} max={9999} value={v.order} onChange={(e) => set("order", Math.max(0, Number(e.target.value) || 0))} className="field-input" />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first.</p>
        </div>
        <label className="flex items-center gap-2 self-center text-sm">
          <input type="checkbox" checked={v.showOnHome} onChange={(e) => set("showOnHome", e.target.checked)} className="h-4 w-4 accent-navy" />
          Show on homepage (first three are displayed)
        </label>
      </div>
      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <button type="submit" className="admin-btn" disabled={pending || uploading}>
          {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {uploading ? "Waiting for upload…" : pending ? "Saving…" : id ? "Save changes" : "Create category"}
        </button>
        <Link href="/admin/categories" className="admin-btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
