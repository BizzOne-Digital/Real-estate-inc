"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveCondo } from "@/app/admin/actions/condos";
import { MultiImageField } from "./MultiImageField";
import { FormSection, LinesField, ListEditor, RICH_TEXT_HELP, TextArea, TextField, Toggle } from "./fields";
import { useToast } from "./Toast";
import type { CondoInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export function CondoForm({ id, initial }: { id: string | null; initial: CondoInput }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof CondoInput>(k: K, val: CondoInput[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveCondo(id, {
        ...v,
        featureGroups: v.featureGroups.map((g) => ({ ...g, items: g.items.map((i) => i.trim()).filter(Boolean) })),
      });
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Saved.");
      if (!id && res.data) router.replace(`/admin/condos/${res.data.id}`);
      else router.refresh();
    });
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormSection title="Building">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Building name"
              value={v.name}
              required
              max={140}
              onChange={(x) => {
                set("name", x);
                if (!slugTouched) set("slug", slugify(x));
              }}
            />
            <div>
              <TextField
                label="URL slug"
                value={v.slug}
                required
                max={160}
                onChange={(x) => {
                  setSlugTouched(true);
                  set("slug", x.toLowerCase());
                }}
              />
              <p className="mt-1 text-xs text-gray-500">/condos/{v.slug || "…"}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Address" value={v.address} onChange={(x) => set("address", x)} max={300} />
            <TextField label="City" value={v.city} onChange={(x) => set("city", x)} max={80} help="Used for the city filter, e.g. Mississauga." />
            <TextField label="Neighbourhood" value={v.neighbourhood} onChange={(x) => set("neighbourhood", x)} max={120} />
            <TextField label="Major intersection" value={v.intersection} onChange={(x) => set("intersection", x)} max={160} />
            <TextField label="Developer / builder" value={v.developer} onChange={(x) => set("developer", x)} max={120} />
            <TextField label="Map search (optional)" value={v.mapQuery} onChange={(x) => set("mapQuery", x)} max={300} help="Defaults to the address." />
          </div>
          <TextArea label="Short summary" value={v.summary} onChange={(x) => set("summary", x)} max={500} rows={2} help="Shown on condo cards and at the top of the page." />
          <TextArea label="Description" value={v.description} onChange={(x) => set("description", x)} max={20000} rows={10} help={RICH_TEXT_HELP} />
        </FormSection>

        <FormSection title="Photos">
          <MultiImageField label="Building photos" folder="condos" value={v.images} onChange={(imgs) => set("images", imgs)} onBusyChange={setUploading} max={20} />
        </FormSection>

        <FormSection title="Building facts" description="Short label and value pairs, e.g. Maintenance fees include → Heat, Water.">
          <ListEditor
            items={v.details}
            onChange={(x) => set("details", x)}
            max={30}
            blank={{ label: "", value: "" }}
            addLabel="Add fact"
            render={(item, update) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <TextField label="Label" value={item.label} onChange={(x) => update({ label: x })} max={60} required />
                <TextField label="Value" value={item.value} onChange={(x) => update({ value: x })} max={300} required />
              </div>
            )}
          />
        </FormSection>

        <FormSection title="Features & amenities" description="Group features under headings such as Amenities, Suite features or Security.">
          <ListEditor
            items={v.featureGroups}
            onChange={(x) => set("featureGroups", x)}
            max={12}
            blank={{ heading: "", items: [] }}
            addLabel="Add feature group"
            render={(item, update) => (
              <>
                <TextField label="Group heading" value={item.heading} onChange={(x) => update({ heading: x })} max={80} required />
                <LinesField label="Features" value={item.items} onChange={(x) => update({ items: x })} rows={6} />
              </>
            )}
          />
        </FormSection>
      </div>

      <aside className="space-y-6">
        <section className="admin-card space-y-4 p-5">
          <Toggle label="Published (visible on the website)" checked={v.published} onChange={(x) => set("published", x)} />
          <Toggle label="Featured on the homepage" checked={v.featured} onChange={(x) => set("featured", x)} />
          <TextField
            label="Display order"
            type="number"
            value={String(v.order)}
            onChange={(x) => set("order", Math.max(0, Math.min(9999, Number(x) || 0)))}
            help="Lower numbers appear first."
          />
        </section>
        <div className="flex gap-2">
          <button type="submit" className="admin-btn flex-1" disabled={busy}>
            {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
            {uploading ? "Waiting for upload…" : pending ? "Saving…" : id ? "Save changes" : "Create condo page"}
          </button>
          <Link href="/admin/condos" className="admin-btn-ghost">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
