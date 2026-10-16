"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveProduct } from "@/app/admin/actions/products";
import { MultiImageField } from "./MultiImageField";
import { useToast } from "./Toast";
import { slugify } from "@/lib/utils";

export interface ProductFormValues {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: string;
  materials: string;
  dimensions: string;
  finishes: string;
  images: string[];
  featured: boolean;
  published: boolean;
}

const splitList = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

export function ProductForm({
  id,
  initial,
  categories,
}: {
  id: string | null;
  initial: ProductFormValues;
  categories: { _id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = v.price.trim() === "" ? null : Number(v.price);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      toast("error", "Price must be a positive number or left empty.");
      return;
    }
    start(async () => {
      const res = await saveProduct(id, {
        name: v.name,
        slug: v.slug,
        category: v.category,
        description: v.description,
        price,
        materials: splitList(v.materials),
        dimensions: v.dimensions,
        finishes: splitList(v.finishes),
        images: v.images,
        featured: v.featured,
        published: v.published,
      });
      if (!res.ok) {
        toast("error", res.error);
        return;
      }
      toast("success", res.message ?? "Saved.");
      if (!id && res.data) router.replace(`/admin/products/${res.data.id}`);
      else router.refresh();
    });
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="admin-card space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">Name *</label>
              <input
                id="name"
                required
                maxLength={140}
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
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={v.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase());
                }}
                className="field-input font-mono text-xs"
              />
              <p className="mt-1 text-xs text-gray-500">/products/{v.slug || "…"}</p>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" rows={6} maxLength={5000} value={v.description} onChange={(e) => set("description", e.target.value)} className="field-input" />
            <p className="mt-1 text-xs text-gray-500">Leave a blank line between paragraphs.</p>
          </div>
        </section>

        <section className="admin-card p-5">
          <MultiImageField label="Product images" folder="products" value={v.images} onChange={(imgs) => set("images", imgs)} onBusyChange={setUploading} />
        </section>

        <section className="admin-card grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="materials" className="field-label">Materials</label>
            <textarea id="materials" rows={3} value={v.materials} onChange={(e) => set("materials", e.target.value)} className="field-input" placeholder="Solid walnut, Linen blend" />
            <p className="mt-1 text-xs text-gray-500">Separate with commas or new lines.</p>
          </div>
          <div>
            <label htmlFor="finishes" className="field-label">Available finishes</label>
            <textarea id="finishes" rows={3} value={v.finishes} onChange={(e) => set("finishes", e.target.value)} className="field-input" placeholder="Natural walnut, Ivory" />
            <p className="mt-1 text-xs text-gray-500">Separate with commas or new lines.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dimensions" className="field-label">Dimensions</label>
            <input id="dimensions" maxLength={300} value={v.dimensions} onChange={(e) => set("dimensions", e.target.value)} className="field-input" placeholder='W 96" x D 38" x H 30"' />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="admin-card space-y-4 p-5">
          <div>
            <label htmlFor="category" className="field-label">Category *</label>
            <select id="category" required value={v.category} onChange={(e) => set("category", e.target.value)} className="field-input">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">
                <Link href="/admin/categories/new" className="underline">Create a category</Link> first.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="price" className="field-label">Price (optional)</label>
            <input id="price" type="number" min={0} step="0.01" inputMode="decimal" value={v.price} onChange={(e) => set("price", e.target.value)} className="field-input" />
            <p className="mt-1 text-xs text-gray-500">Leave empty to hide the price.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-navy" />
            Published (visible on the website)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-navy" />
            Featured product
          </label>
        </section>
        <div className="flex gap-2">
          <button type="submit" className="admin-btn flex-1" disabled={busy}>
            {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
            {uploading ? "Waiting for upload…" : pending ? "Saving…" : id ? "Save changes" : "Create product"}
          </button>
          <Link href="/admin/products" className="admin-btn-ghost">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
