"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createGalleryItem, deleteGalleryItem, reorderGallery, updateGalleryItem } from "@/app/admin/actions/gallery";
import { LocalImageField } from "./LocalImageField";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import type { GalleryItemInput } from "@/lib/validation";

export interface GalleryRow extends GalleryItemInput {
  _id: string;
}

type Cat = { _id: string; name: string };

function ItemFields({
  value,
  onChange,
  categories,
  idPrefix,
  onBusyChange,
}: {
  value: GalleryItemInput;
  onChange: (v: GalleryItemInput) => void;
  categories: Cat[];
  idPrefix: string;
  onBusyChange: (b: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <LocalImageField label="Image" folder="gallery" value={value.image} onChange={(image) => onChange({ ...value, image })} onBusyChange={onBusyChange} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-caption`} className="field-label">Caption</label>
          <input id={`${idPrefix}-caption`} maxLength={200} value={value.caption} onChange={(e) => onChange({ ...value, caption: e.target.value })} className="field-input" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-alt`} className="field-label">Alt text</label>
          <input id={`${idPrefix}-alt`} maxLength={200} value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} className="field-input" placeholder="Describe the image" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-cat`} className="field-label">Category</label>
          <select id={`${idPrefix}-cat`} value={value.category ?? ""} onChange={(e) => onChange({ ...value, category: e.target.value || null })} className="field-input">
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function GalleryManager({ items: initialItems, categories }: { items: GalleryRow[]; categories: Cat[] }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<GalleryItemInput>({ image: "", caption: "", alt: "", category: null });
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();
  const [toDelete, setToDelete] = useState<GalleryRow | null>(null);

  useEffect(() => setItems(initialItems), [initialItems]);
  const setBusyFor = (key: string) => (b: boolean) => setBusy((s) => (s[key] === b ? s : { ...s, [key]: b }));
  const anyBusy = pending || Object.values(busy).some(Boolean);

  function handle(res: { ok: boolean; error?: string; message?: string }, after?: () => void) {
    if (!res.ok) return toast("error", res.error ?? "Something went wrong.");
    toast("success", res.message ?? "Saved.");
    after?.();
    router.refresh();
  }

  function move(index: number, d: -1 | 1) {
    const j = index + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    start(async () => handle(await reorderGallery(next.map((i) => i._id))));
  }

  return (
    <div className="space-y-6">
      <section className="admin-card p-5">
        <h2 className="mb-4 font-semibold">Add an image</h2>
        <ItemFields idPrefix="new" value={draft} onChange={setDraft} categories={categories} onBusyChange={setBusyFor("new")} />
        <button
          type="button"
          className="admin-btn mt-4"
          disabled={anyBusy || !draft.image}
          onClick={() =>
            start(async () => handle(await createGalleryItem(draft), () => setDraft({ image: "", caption: "", alt: "", category: null })))
          }
        >
          {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Plus aria-hidden className="h-4 w-4" />}
          Add to gallery
        </button>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">
          Gallery items <span className="font-normal text-gray-500">({items.length})</span>
        </h2>
        {items.length === 0 && <p className="admin-card px-5 py-10 text-center text-sm text-gray-500">No gallery images yet.</p>}
        <ol className="space-y-4">
          {items.map((item, i) => (
            <li key={item._id} className="admin-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Position {i + 1}</span>
                <div className="flex gap-1">
                  <button type="button" disabled={anyBusy || i === 0} onClick={() => move(i, -1)} className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30" aria-label="Move up">
                    <ArrowUp aria-hidden className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={anyBusy || i === items.length - 1} onClick={() => move(i, 1)} className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30" aria-label="Move down">
                    <ArrowDown aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ItemFields
                idPrefix={item._id}
                value={item}
                categories={categories}
                onBusyChange={setBusyFor(item._id)}
                onChange={(v) => setItems((all) => all.map((x) => (x._id === item._id ? { ...x, ...v } : x)))}
              />
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={anyBusy || !item.image}
                  onClick={() =>
                    start(async () =>
                      handle(await updateGalleryItem(item._id, { image: item.image, caption: item.caption, alt: item.alt, category: item.category })),
                    )
                  }
                >
                  <Save aria-hidden className="h-4 w-4" /> Save
                </button>
                <button type="button" className="admin-btn-ghost text-red-700" disabled={anyBusy} onClick={() => setToDelete(item)}>
                  <Trash2 aria-hidden className="h-4 w-4" /> Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        title="Remove gallery image?"
        message="The image will be removed from the gallery and its uploaded file deleted if nothing else uses it."
        confirmLabel="Remove"
        busy={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && start(async () => handle(await deleteGalleryItem(toDelete._id), () => setToDelete(null)))}
      />
    </div>
  );
}
