"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { savePageContent } from "@/app/admin/actions/content";
import { LocalImageField } from "./LocalImageField";
import { FormSection, TextArea, TextField } from "./fields";
import { useToast } from "./Toast";
import {
  BENEFIT_ICONS,
  type AboutContent,
  type BenefitIcon,
  type CollectionsContent,
  type ContactContent,
  type GalleryContent,
  type HomeContent,
} from "@/lib/content-types";
import type { PageKey } from "@/lib/models/PageContent";

function useSave(key: PageKey) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const save = (data: unknown) =>
    start(async () => {
      const res = await savePageContent(key, data);
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Saved.");
      router.refresh();
    });
  return { pending, save };
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-navy" />
      {label}
    </label>
  );
}

/** Repeatable list of items with add, remove and reorder controls. */
function ListEditor<T extends object>({
  items,
  onChange,
  max,
  blank,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  max: number;
  blank: T;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded border border-gray-100 bg-gray-50/50 p-3">
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          <div className="flex gap-2">
            <button type="button" className="admin-btn-ghost" disabled={i === 0} onClick={() => move(i, -1)}>
              Up
            </button>
            <button type="button" className="admin-btn-ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              Down
            </button>
            <button type="button" className="admin-btn-ghost text-red-700" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 aria-hidden className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="admin-btn-ghost" onClick={() => onChange([...items, { ...blank }])}>
          <Plus aria-hidden className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

function SaveBar({ pending, uploading, label = "Save changes" }: { pending: boolean; uploading: boolean; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
      <button type="submit" className="admin-btn" disabled={pending || uploading}>
        {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        {uploading ? "Waiting for upload…" : pending ? "Saving…" : label}
      </button>
    </div>
  );
}

export function HomeContentForm({ initial }: { initial: HomeContent }) {
  const [v, setV] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const { pending, save } = useSave("home");
  const set = <K extends keyof HomeContent>(k: K, val: HomeContent[K]) => setV((s) => ({ ...s, [k]: val }));
  const setBenefit = (i: number, patch: Partial<HomeContent["benefits"][number]>) =>
    set("benefits", v.benefits.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Hero" description="The split hero at the top of the homepage.">
        <TextArea label="Headline" value={v.heroHeadline} onChange={(x) => set("heroHeadline", x)} max={120} rows={2} required help="Each line break starts a new line in the headline." />
        <TextArea label="Supporting copy" value={v.heroText} onChange={(x) => set("heroText", x)} max={400} required />
        <TextField label="Button label" value={v.heroButtonLabel} onChange={(x) => set("heroButtonLabel", x)} max={40} required />
        <LocalImageField label="Hero image" folder="pages" value={v.heroImage} onChange={(x) => set("heroImage", x)} aspect="aspect-[16/10]" onBusyChange={setUploading} />
        <TextField label="Hero image alt text" value={v.heroImageAlt} onChange={(x) => set("heroImageAlt", x)} max={200} />
      </FormSection>

      <FormSection title="Benefits strip" description="Up to three short benefits with icons.">
        {v.benefits.map((b, i) => (
          <div key={i} className="grid gap-3 rounded border border-gray-100 p-3 sm:grid-cols-[140px_1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor={`b-icon-${i}`} className="field-label">Icon</label>
              <select id={`b-icon-${i}`} value={b.icon} onChange={(e) => setBenefit(i, { icon: e.target.value as BenefitIcon })} className="field-input">
                {BENEFIT_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
            <TextField label="Title" value={b.title} onChange={(x) => setBenefit(i, { title: x })} max={60} required />
            <TextField label="Subtitle" value={b.subtitle} onChange={(x) => setBenefit(i, { subtitle: x })} max={100} />
            <button type="button" onClick={() => set("benefits", v.benefits.filter((_, j) => j !== i))} className="admin-btn-ghost text-red-700" aria-label={`Remove benefit ${i + 1}`}>
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
        {v.benefits.length < 3 && (
          <button type="button" className="admin-btn-ghost" onClick={() => set("benefits", [...v.benefits, { icon: "leaf", title: "", subtitle: "" }])}>
            <Plus aria-hidden className="h-4 w-4" /> Add benefit
          </button>
        )}
      </FormSection>

      <FormSection title="Collections section">
        <TextField label="Heading" value={v.collectionsHeading} onChange={(x) => set("collectionsHeading", x)} max={120} required />
        <TextArea label="Supporting text" value={v.collectionsText} onChange={(x) => set("collectionsText", x)} max={300} rows={2} />
        <p className="text-xs text-gray-500">The three cards come from Categories marked “Show on homepage”, in display order.</p>
      </FormSection>

      <FormSection title="Founder section">
        <TextField label="Eyebrow" value={v.founderEyebrow} onChange={(x) => set("founderEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.founderHeading} onChange={(x) => set("founderHeading", x)} max={120} required />
        <TextArea label="Paragraph" value={v.founderText} onChange={(x) => set("founderText", x)} max={600} />
        <TextField label="Link label" value={v.founderLinkLabel} onChange={(x) => set("founderLinkLabel", x)} max={40} required />
        <LocalImageField label="Founder portrait" folder="pages" value={v.founderImage} onChange={(x) => set("founderImage", x)} aspect="aspect-[1.85/1]" onBusyChange={setUploading} />
        <TextField label="Portrait alt text" value={v.founderImageAlt} onChange={(x) => set("founderImageAlt", x)} max={200} />
      </FormSection>

      <FormSection title="Featured products" description="Shows up to four published products, featured ones first.">
        <Toggle label="Show this section" checked={v.showFeatured} onChange={(x) => set("showFeatured", x)} />
        <TextField label="Eyebrow" value={v.featuredEyebrow} onChange={(x) => set("featuredEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.featuredHeading} onChange={(x) => set("featuredHeading", x)} max={120} required />
        <TextArea label="Text" value={v.featuredText} onChange={(x) => set("featuredText", x)} max={400} rows={2} />
        <TextField label="Button label" value={v.featuredButtonLabel} onChange={(x) => set("featuredButtonLabel", x)} max={40} required />
      </FormSection>

      <FormSection title="How it works">
        <Toggle label="Show this section" checked={v.showProcess} onChange={(x) => set("showProcess", x)} />
        <TextField label="Eyebrow" value={v.processEyebrow} onChange={(x) => set("processEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.processHeading} onChange={(x) => set("processHeading", x)} max={120} required />
        <TextArea label="Text" value={v.processText} onChange={(x) => set("processText", x)} max={400} rows={2} />
        <ListEditor
          items={v.processSteps}
          onChange={(x) => set("processSteps", x)}
          max={6}
          blank={{ title: "", text: "" }}
          addLabel="Add step"
          render={(item, update) => (
            <>
              <TextField label="Step title" value={item.title} onChange={(x) => update({ title: x })} max={60} required />
              <TextArea label="Step text" value={item.text} onChange={(x) => update({ text: x })} max={300} rows={2} />
            </>
          )}
        />
      </FormSection>

      <FormSection title="Gallery preview" description="Shows the first five images from Gallery.">
        <Toggle label="Show this section" checked={v.showGallery} onChange={(x) => set("showGallery", x)} />
        <TextField label="Eyebrow" value={v.galleryEyebrow} onChange={(x) => set("galleryEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.galleryHeading} onChange={(x) => set("galleryHeading", x)} max={120} required />
        <TextArea label="Text" value={v.galleryText} onChange={(x) => set("galleryText", x)} max={400} rows={2} />
        <TextField label="Button label" value={v.galleryButtonLabel} onChange={(x) => set("galleryButtonLabel", x)} max={40} required />
      </FormSection>

      <FormSection title="Client testimonials" description="Add genuine client feedback only. The section stays hidden on the website until at least one testimonial is added.">
        <Toggle label="Show this section" checked={v.showTestimonials} onChange={(x) => set("showTestimonials", x)} />
        <TextField label="Eyebrow" value={v.testimonialsEyebrow} onChange={(x) => set("testimonialsEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.testimonialsHeading} onChange={(x) => set("testimonialsHeading", x)} max={120} required />
        <ListEditor
          items={v.testimonials}
          onChange={(x) => set("testimonials", x)}
          max={12}
          blank={{ quote: "", name: "", location: "" }}
          addLabel="Add testimonial"
          render={(item, update) => (
            <>
              <TextArea label="Quote" value={item.quote} onChange={(x) => update({ quote: x })} max={800} rows={3} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Client name" value={item.name} onChange={(x) => update({ name: x })} max={80} required />
                <TextField label="Location (optional)" value={item.location} onChange={(x) => update({ location: x })} max={80} />
              </div>
            </>
          )}
        />
      </FormSection>

      <FormSection title="FAQ">
        <Toggle label="Show this section" checked={v.showFaq} onChange={(x) => set("showFaq", x)} />
        <TextField label="Eyebrow" value={v.faqEyebrow} onChange={(x) => set("faqEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.faqHeading} onChange={(x) => set("faqHeading", x)} max={120} required />
        <TextArea label="Text" value={v.faqText} onChange={(x) => set("faqText", x)} max={400} rows={2} />
        <ListEditor
          items={v.faqs}
          onChange={(x) => set("faqs", x)}
          max={12}
          blank={{ question: "", answer: "" }}
          addLabel="Add question"
          render={(item, update) => (
            <>
              <TextField label="Question" value={item.question} onChange={(x) => update({ question: x })} max={200} required />
              <TextArea label="Answer" value={item.answer} onChange={(x) => update({ answer: x })} max={1500} rows={3} required />
            </>
          )}
        />
      </FormSection>

      <FormSection title="Contact section" description="Phone numbers, email and address come from Settings.">
        <Toggle label="Show this section" checked={v.showVisit} onChange={(x) => set("showVisit", x)} />
        <TextField label="Eyebrow" value={v.visitEyebrow} onChange={(x) => set("visitEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.visitHeading} onChange={(x) => set("visitHeading", x)} max={120} required />
        <TextArea label="Text" value={v.visitText} onChange={(x) => set("visitText", x)} max={400} rows={2} />
        <TextField label="Button label" value={v.visitButtonLabel} onChange={(x) => set("visitButtonLabel", x)} max={40} required />
      </FormSection>

      <FormSection title="Call to action band">
        <TextField label="Heading" value={v.ctaHeading} onChange={(x) => set("ctaHeading", x)} max={120} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Button label" value={v.ctaButtonLabel} onChange={(x) => set("ctaButtonLabel", x)} max={40} required />
          <TextField label="Button link" value={v.ctaButtonHref} onChange={(x) => set("ctaButtonHref", x)} max={300} help="A site path like /collections or a full URL." />
        </div>
      </FormSection>

      <SaveBar pending={pending} uploading={uploading} />
    </form>
  );
}

export function AboutContentForm({ initial }: { initial: AboutContent }) {
  const [v, setV] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const { pending, save } = useSave("about");
  const set = <K extends keyof AboutContent>(k: K, val: AboutContent[K]) => setV((s) => ({ ...s, [k]: val }));
  const setValue = (i: number, patch: Partial<AboutContent["values"][number]>) =>
    set("values", v.values.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Page introduction">
        <TextField label="Eyebrow" value={v.heroEyebrow} onChange={(x) => set("heroEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heroHeading} onChange={(x) => set("heroHeading", x)} max={140} required />
        <TextArea label="Introduction" value={v.heroText} onChange={(x) => set("heroText", x)} max={800} />
      </FormSection>

      <FormSection title="Founder" description="Only details you enter here are shown. Leave the name empty to show the homepage founder heading instead.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Founder name" value={v.founderName} onChange={(x) => set("founderName", x)} max={120} />
          <TextField label="Role / title" value={v.founderRole} onChange={(x) => set("founderRole", x)} max={120} />
        </div>
        <TextArea label="Biography" value={v.founderBio} onChange={(x) => set("founderBio", x)} max={5000} rows={6} help="Leave a blank line between paragraphs." />
        <LocalImageField label="Founder portrait" folder="pages" value={v.founderImage} onChange={(x) => set("founderImage", x)} aspect="aspect-[1.85/1]" onBusyChange={setUploading} />
      </FormSection>

      <FormSection title="Brand story & approach">
        <TextField label="Story heading" value={v.storyHeading} onChange={(x) => set("storyHeading", x)} max={120} required />
        <TextArea label="Story" value={v.storyText} onChange={(x) => set("storyText", x)} max={5000} rows={5} />
        <LocalImageField label="Story image" folder="pages" value={v.storyImage} onChange={(x) => set("storyImage", x)} aspect="aspect-[4/5]" onBusyChange={setUploading} />
        <TextField label="Approach heading" value={v.approachHeading} onChange={(x) => set("approachHeading", x)} max={120} required />
        <TextArea label="Design approach" value={v.approachText} onChange={(x) => set("approachText", x)} max={5000} rows={5} />
      </FormSection>

      <FormSection title="Values">
        <TextField label="Section heading" value={v.valuesHeading} onChange={(x) => set("valuesHeading", x)} max={120} />
        {v.values.map((val, i) => (
          <div key={i} className="grid gap-3 rounded border border-gray-100 p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <TextField label="Title" value={val.title} onChange={(x) => setValue(i, { title: x })} max={80} required />
            <TextField label="Text" value={val.text} onChange={(x) => setValue(i, { text: x })} max={400} />
            <button type="button" onClick={() => set("values", v.values.filter((_, j) => j !== i))} className="admin-btn-ghost text-red-700" aria-label={`Remove value ${i + 1}`}>
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
        {v.values.length < 6 && (
          <button type="button" className="admin-btn-ghost" onClick={() => set("values", [...v.values, { title: "", text: "" }])}>
            <Plus aria-hidden className="h-4 w-4" /> Add value
          </button>
        )}
      </FormSection>

      <SaveBar pending={pending} uploading={uploading} />
    </form>
  );
}

export function ContactContentForm({ initial }: { initial: ContactContent }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave("contact");
  const set = <K extends keyof ContactContent>(k: K, val: ContactContent[K]) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Contact page" description="Contact details (email, phone, address) are managed in Settings and only shown when filled in.">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heading} onChange={(x) => set("heading", x)} max={140} required />
        <TextArea label="Introduction" value={v.intro} onChange={(x) => set("intro", x)} max={800} />
        <TextField label="Form heading" value={v.formHeading} onChange={(x) => set("formHeading", x)} max={120} />
        <TextArea label="Success message" value={v.successMessage} onChange={(x) => set("successMessage", x)} max={300} required rows={2} />
      </FormSection>
      <SaveBar pending={pending} uploading={false} />
    </form>
  );
}

export function CollectionsContentForm({ initial }: { initial: CollectionsContent }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave("collections");
  const set = <K extends keyof CollectionsContent>(k: K, val: CollectionsContent[K]) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Catalog page" description="Header of /collections. When a category is selected, its own name and description are shown instead.">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heading} onChange={(x) => set("heading", x)} max={140} required />
        <TextArea label="Introduction" value={v.intro} onChange={(x) => set("intro", x)} max={800} />
        <TextField label="No results heading" value={v.emptyHeading} onChange={(x) => set("emptyHeading", x)} max={120} required />
        <TextField label="No results text" value={v.emptyText} onChange={(x) => set("emptyText", x)} max={300} />
      </FormSection>
      <FormSection title="Collection detail pages" description="Shared by every /collections/[category] page.">
        <TextField label="Products heading" value={v.detailProductsHeading} onChange={(x) => set("detailProductsHeading", x)} max={120} required />
        <TextField label="CTA heading" value={v.detailCtaHeading} onChange={(x) => set("detailCtaHeading", x)} max={120} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="CTA button label" value={v.detailCtaButtonLabel} onChange={(x) => set("detailCtaButtonLabel", x)} max={40} required />
          <TextField label="CTA button link" value={v.detailCtaButtonHref} onChange={(x) => set("detailCtaButtonHref", x)} max={300} />
        </div>
      </FormSection>
      <FormSection title="Product pages">
        <TextField label="Inquiry button label" value={v.productInquiryLabel} onChange={(x) => set("productInquiryLabel", x)} max={60} required />
        <TextField label="Related products heading" value={v.relatedHeading} onChange={(x) => set("relatedHeading", x)} max={120} required />
      </FormSection>
      <SaveBar pending={pending} uploading={false} />
    </form>
  );
}

export function GalleryContentForm({ initial }: { initial: GalleryContent }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave("gallery");
  const set = <K extends keyof GalleryContent>(k: K, val: GalleryContent[K]) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Gallery page" description="Images themselves are managed under Gallery in the sidebar.">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heading} onChange={(x) => set("heading", x)} max={140} required />
        <TextArea label="Introduction" value={v.intro} onChange={(x) => set("intro", x)} max={800} />
      </FormSection>
      <FormSection title="Call to action band">
        <TextField label="Heading" value={v.ctaHeading} onChange={(x) => set("ctaHeading", x)} max={120} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Button label" value={v.ctaButtonLabel} onChange={(x) => set("ctaButtonLabel", x)} max={40} required />
          <TextField label="Button link" value={v.ctaButtonHref} onChange={(x) => set("ctaButtonHref", x)} max={300} />
        </div>
      </FormSection>
      <SaveBar pending={pending} uploading={false} />
    </form>
  );
}
