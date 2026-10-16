"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cleanupUnusedMedia, saveSettings } from "@/app/admin/actions/content";
import { LocalImageField } from "./LocalImageField";
import { FormSection, TextArea, TextField } from "./fields";
import { useToast } from "./Toast";
import type { SiteSettingsData } from "@/lib/content-types";

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [cleaning, startCleaning] = useTransition();
  const set = <K extends keyof SiteSettingsData>(k: K, val: SiteSettingsData[K]) => setV((s) => ({ ...s, [k]: val }));
  const setSocial = (k: keyof SiteSettingsData["social"], val: string) => setV((s) => ({ ...s, social: { ...s.social, [k]: val } }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveSettings(v);
          if (!res.ok) return toast("error", res.error);
          toast("success", res.message ?? "Saved.");
          router.refresh();
        });
      }}
      className="max-w-4xl space-y-6"
    >
      <FormSection title="Brand">
        <TextField label="Site title" value={v.siteTitle} onChange={(x) => set("siteTitle", x)} max={120} required />
        <LocalImageField
          label="Logo"
          folder="misc"
          value={v.logo}
          onChange={(x) => set("logo", x)}
          aspect="aspect-[2.85/1]"
          help="Upload the original logo file (PNG with transparency recommended). It is displayed without recoloring."
          onBusyChange={setUploading}
        />
        <TextField label="Logo alt text / business name" value={v.logoAlt} onChange={(x) => set("logoAlt", x)} max={120} required />
      </FormSection>

      <FormSection title="Contact details" description="Each detail is shown on the website only when filled in.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" type="email" value={v.contactEmail} onChange={(x) => set("contactEmail", x)} max={200} />
          <TextField label="Main phone" value={v.contactPhone} onChange={(x) => set("contactPhone", x)} max={40} />
        </div>
        {v.extraPhones.map((p, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <TextField label="Label" value={p.label} placeholder="e.g. Office" onChange={(x) => set("extraPhones", v.extraPhones.map((q, j) => (j === i ? { ...q, label: x } : q)))} max={40} />
            <TextField label="Number" value={p.number} onChange={(x) => set("extraPhones", v.extraPhones.map((q, j) => (j === i ? { ...q, number: x } : q)))} max={40} required />
            <button type="button" className="admin-btn-ghost text-red-700" onClick={() => set("extraPhones", v.extraPhones.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        {v.extraPhones.length < 5 && (
          <button type="button" className="admin-btn-ghost" onClick={() => set("extraPhones", [...v.extraPhones, { label: "", number: "" }])}>
            Add another phone
          </button>
        )}
        <TextArea label="Address" value={v.contactAddress} onChange={(x) => set("contactAddress", x)} max={300} rows={2} />
        <TextField label="Opening hours" value={v.contactHours} onChange={(x) => set("contactHours", x)} max={200} />
      </FormSection>

      <FormSection title="Social links" description="Icons are hidden in the footer until a URL is added.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Instagram URL" value={v.social.instagram} onChange={(x) => setSocial("instagram", x)} max={300} placeholder="https://instagram.com/…" />
          <TextField label="Pinterest URL" value={v.social.pinterest} onChange={(x) => setSocial("pinterest", x)} max={300} placeholder="https://pinterest.com/…" />
          <TextField label="Facebook URL" value={v.social.facebook} onChange={(x) => setSocial("facebook", x)} max={300} placeholder="https://facebook.com/…" />
          <TextField label="YouTube URL" value={v.social.youtube} onChange={(x) => setSocial("youtube", x)} max={300} placeholder="https://youtube.com/…" />
        </div>
      </FormSection>

      <FormSection title="Footer & catalog">
        <TextField label="Footer text" value={v.footerText} onChange={(x) => set("footerText", x)} max={300} />
        <TextField label="Price currency" value={v.currency} onChange={(x) => set("currency", x)} max={3} help="3-letter code, e.g. CAD or USD. Prices only appear on products that have one." />
      </FormSection>

      <FormSection title="Default SEO">
        <TextField label="Default page title" value={v.seoTitle} onChange={(x) => set("seoTitle", x)} max={120} />
        <TextArea label="Default meta description" value={v.seoDescription} onChange={(x) => set("seoDescription", x)} max={300} rows={2} />
        <LocalImageField label="Social sharing image" folder="misc" value={v.ogImage} onChange={(x) => set("ogImage", x)} aspect="aspect-[1.91/1]" onBusyChange={setUploading} />
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
        <button type="submit" className="admin-btn" disabled={pending || uploading}>
          {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {uploading ? "Waiting for upload…" : pending ? "Saving…" : "Save settings"}
        </button>
        <button
          type="button"
          className="admin-btn-ghost"
          disabled={cleaning}
          onClick={() =>
            startCleaning(async () => {
              const res = await cleanupUnusedMedia();
              if (!res.ok) return toast("error", res.error);
              toast("success", res.message ?? "Done.");
            })
          }
          title="Deletes uploads older than 24 hours that are not used anywhere"
        >
          {cleaning ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Sparkles aria-hidden className="h-4 w-4" />}
          Clean up unused uploads
        </button>
      </div>
    </form>
  );
}
