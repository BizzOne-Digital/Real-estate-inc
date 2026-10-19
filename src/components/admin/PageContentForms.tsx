"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { savePageContent } from "@/app/admin/actions/content";
import { LocalImageField } from "./LocalImageField";
import { FormSection, LinesField, ListEditor, RICH_TEXT_HELP, TextArea, TextField, Toggle } from "./fields";
import { useToast } from "./Toast";
import {
  BENEFIT_ICONS,
  type AboutContent,
  type BenefitIcon,
  type ContactContent,
  type HomeContent,
  type InfoPageContent,
  type LinkCard,
  type TestimonialsContent,
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

function LinkCardsEditor({
  items,
  onChange,
  onBusyChange,
  addLabel,
}: {
  items: LinkCard[];
  onChange: (v: LinkCard[]) => void;
  onBusyChange: (b: boolean) => void;
  addLabel: string;
}) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      max={6}
      blank={{ title: "", text: "", image: "", href: "/contact" }}
      addLabel={addLabel}
      render={(item, update) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title" value={item.title} onChange={(x) => update({ title: x })} max={60} required />
            <TextField label="Link" value={item.href} onChange={(x) => update({ href: x })} max={300} help="A site path like /relocation or a full https:// URL." />
          </div>
          <TextArea label="Text" value={item.text} onChange={(x) => update({ text: x })} max={300} rows={2} />
          <LocalImageField label="Image" folder="pages" value={item.image} onChange={(x) => update({ image: x })} onBusyChange={onBusyChange} />
        </>
      )}
    />
  );
}

export function HomeContentForm({ initial }: { initial: HomeContent }) {
  const [v, setV] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const { pending, save } = useSave("home");
  const set = <K extends keyof HomeContent>(k: K, val: HomeContent[K]) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Hero" description="The split hero at the top of the homepage.">
        <TextArea label="Headline" value={v.heroHeadline} onChange={(x) => set("heroHeadline", x)} max={120} rows={2} required help="Each line break starts a new line in the headline." />
        <TextArea label="Supporting copy" value={v.heroText} onChange={(x) => set("heroText", x)} max={220} required help="Keep it short (two or three lines) so the search panel and service cards fit on the first screen." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Search button label (header)" value={v.heroButtonLabel} onChange={(x) => set("heroButtonLabel", x)} max={40} required help="Used for Search Properties links." />
          <TextField label="Second link label" value={v.heroSecondaryLabel} onChange={(x) => set("heroSecondaryLabel", x)} max={40} help="Links to the contact page. Leave empty to hide." />
        </div>
        <LocalImageField label="Hero image" folder="pages" value={v.heroImage} onChange={(x) => set("heroImage", x)} aspect="aspect-[16/10]" onBusyChange={setUploading} />
        <TextField label="Hero image description (alt text)" value={v.heroImageAlt} onChange={(x) => set("heroImageAlt", x)} max={200} />
      </FormSection>

      <FormSection title="Property search panel" description="The navy search box under the hero. Results open on the property search site set in Settings.">
        <TextField label="Heading" value={v.searchHeading} onChange={(x) => set("searchHeading", x)} max={80} required />
        <TextField label="Small text" value={v.searchText} onChange={(x) => set("searchText", x)} max={200} />
      </FormSection>

      <FormSection title="Benefits strip" description="Up to three short points shown under the hero.">
        <ListEditor
          items={v.benefits}
          onChange={(x) => set("benefits", x)}
          max={3}
          blank={{ icon: "shield" as BenefitIcon, title: "", subtitle: "" }}
          addLabel="Add benefit"
          render={(b, update, i) => (
            <div className="grid gap-3 sm:grid-cols-[150px_1fr_1fr]">
              <div>
                <label htmlFor={`b-icon-${i}`} className="field-label">Icon</label>
                <select id={`b-icon-${i}`} value={b.icon} onChange={(e) => update({ icon: e.target.value as BenefitIcon })} className="field-input">
                  {BENEFIT_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <TextField label="Title" value={b.title} onChange={(x) => update({ title: x })} max={60} required />
              <TextField label="Subtitle" value={b.subtitle} onChange={(x) => update({ subtitle: x })} max={100} />
            </div>
          )}
        />
      </FormSection>

      <FormSection title="Service shortcuts" description="The three Buying / Selling / Relocation cards shown under the search panel.">
        <TextField label="Eyebrow" value={v.servicesEyebrow} onChange={(x) => set("servicesEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.servicesHeading} onChange={(x) => set("servicesHeading", x)} max={120} required />
        <TextArea label="Text" value={v.servicesText} onChange={(x) => set("servicesText", x)} max={400} rows={2} />
        <LinkCardsEditor items={v.services} onChange={(x) => set("services", x)} onBusyChange={setUploading} addLabel="Add service card" />
      </FormSection>

      <FormSection title="Featured condos" description="Shows up to three published condo pages, featured ones first.">
        <Toggle label="Show this section" checked={v.showCondos} onChange={(x) => set("showCondos", x)} />
        <TextField label="Eyebrow" value={v.condosEyebrow} onChange={(x) => set("condosEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.condosHeading} onChange={(x) => set("condosHeading", x)} max={120} required />
        <TextArea label="Text" value={v.condosText} onChange={(x) => set("condosText", x)} max={400} rows={2} />
        <TextField label="Button label" value={v.condosButtonLabel} onChange={(x) => set("condosButtonLabel", x)} max={40} required />
      </FormSection>

      <FormSection title="Broker section" description="The portrait section that links to the About page.">
        <TextField label="Eyebrow" value={v.founderEyebrow} onChange={(x) => set("founderEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.founderHeading} onChange={(x) => set("founderHeading", x)} max={120} required />
        <TextArea label="Paragraph" value={v.founderText} onChange={(x) => set("founderText", x)} max={600} />
        <TextField label="Link label" value={v.founderLinkLabel} onChange={(x) => set("founderLinkLabel", x)} max={40} required />
        <LocalImageField label="Portrait" folder="pages" value={v.founderImage} onChange={(x) => set("founderImage", x)} aspect="aspect-[1.85/1]" onBusyChange={setUploading} />
        <TextField label="Portrait description (alt text)" value={v.founderImageAlt} onChange={(x) => set("founderImageAlt", x)} max={200} />
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

      <FormSection title="Buyer tools" description="Photo cards linking to the calculators and Market Insights.">
        <Toggle label="Show this section" checked={v.showTools} onChange={(x) => set("showTools", x)} />
        <TextField label="Eyebrow" value={v.toolsEyebrow} onChange={(x) => set("toolsEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.toolsHeading} onChange={(x) => set("toolsHeading", x)} max={120} required />
        <TextArea label="Text" value={v.toolsText} onChange={(x) => set("toolsText", x)} max={400} rows={2} />
        <LinkCardsEditor items={v.tools} onChange={(x) => set("tools", x)} onBusyChange={setUploading} addLabel="Add tool card" />
      </FormSection>

      <FormSection title="Latest Market Insights" description="Shows the three newest published articles.">
        <Toggle label="Show this section" checked={v.showInsights} onChange={(x) => set("showInsights", x)} />
        <TextField label="Eyebrow" value={v.insightsEyebrow} onChange={(x) => set("insightsEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.insightsHeading} onChange={(x) => set("insightsHeading", x)} max={120} required />
        <TextArea label="Text" value={v.insightsText} onChange={(x) => set("insightsText", x)} max={400} rows={2} />
      </FormSection>

      <FormSection title="Client reviews" description="Shows the first three reviews from the Testimonials tab.">
        <Toggle label="Show this section" checked={v.showTestimonials} onChange={(x) => set("showTestimonials", x)} />
        <TextField label="Eyebrow" value={v.testimonialsEyebrow} onChange={(x) => set("testimonialsEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.testimonialsHeading} onChange={(x) => set("testimonialsHeading", x)} max={120} required />
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

      <FormSection title="Closing call to action band">
        <TextField label="Heading" value={v.ctaHeading} onChange={(x) => set("ctaHeading", x)} max={120} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Button label" value={v.ctaButtonLabel} onChange={(x) => set("ctaButtonLabel", x)} max={40} required />
          <TextField label="Button link" value={v.ctaButtonHref} onChange={(x) => set("ctaButtonHref", x)} max={300} help="Leave empty to use the property search link from Settings." />
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

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Page introduction">
        <TextField label="Eyebrow" value={v.heroEyebrow} onChange={(x) => set("heroEyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heroHeading} onChange={(x) => set("heroHeading", x)} max={140} required />
        <TextArea label="Introduction" value={v.heroText} onChange={(x) => set("heroText", x)} max={800} />
      </FormSection>

      <FormSection title="Broker profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={v.founderName} onChange={(x) => set("founderName", x)} max={120} />
          <TextField label="Title / brokerage" value={v.founderRole} onChange={(x) => set("founderRole", x)} max={120} />
        </div>
        <TextArea label="Biography" value={v.founderBio} onChange={(x) => set("founderBio", x)} max={8000} rows={8} help={RICH_TEXT_HELP} />
        <LocalImageField label="Portrait" folder="pages" value={v.founderImage} onChange={(x) => set("founderImage", x)} aspect="aspect-[1.85/1]" onBusyChange={setUploading} />
      </FormSection>

      <FormSection title="Story & services">
        <TextField label="Story heading" value={v.storyHeading} onChange={(x) => set("storyHeading", x)} max={120} required />
        <TextArea label="Story" value={v.storyText} onChange={(x) => set("storyText", x)} max={8000} rows={6} help={RICH_TEXT_HELP} />
        <LocalImageField label="Story image" folder="pages" value={v.storyImage} onChange={(x) => set("storyImage", x)} aspect="aspect-[4/5]" onBusyChange={setUploading} />
        <TextField label="Services heading" value={v.servicesHeading} onChange={(x) => set("servicesHeading", x)} max={120} />
        <LinesField label="Services" value={v.services} onChange={(x) => set("services", x)} />
      </FormSection>

      <FormSection title="Network & memberships">
        <TextField label="Network heading" value={v.approachHeading} onChange={(x) => set("approachHeading", x)} max={120} required />
        <TextArea label="Network text" value={v.approachText} onChange={(x) => set("approachText", x)} max={5000} rows={4} help={RICH_TEXT_HELP} />
        <TextField label="Memberships heading" value={v.membershipsHeading} onChange={(x) => set("membershipsHeading", x)} max={120} />
        <LinesField label="Memberships" value={v.memberships} onChange={(x) => set("memberships", x)} />
      </FormSection>

      <FormSection title="What clients can expect">
        <TextField label="Section heading" value={v.valuesHeading} onChange={(x) => set("valuesHeading", x)} max={120} />
        <ListEditor
          items={v.values}
          onChange={(x) => set("values", x)}
          max={6}
          blank={{ title: "", text: "" }}
          addLabel="Add item"
          render={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <TextField label="Title" value={item.title} onChange={(x) => update({ title: x })} max={80} required />
              <TextField label="Text" value={item.text} onChange={(x) => update({ text: x })} max={400} />
            </div>
          )}
        />
      </FormSection>

      <SaveBar pending={pending} uploading={uploading} />
    </form>
  );
}

/** Shared editor for Featured Properties, Relocation, Mortgage and Land Transfer Tax pages. */
export function InfoPageForm({ pageKey, initial, note }: { pageKey: PageKey; initial: InfoPageContent; note?: string }) {
  const [v, setV] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const { pending, save } = useSave(pageKey);
  const set = <K extends keyof InfoPageContent>(k: K, val: InfoPageContent[K]) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      {note && <p className="rounded border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{note}</p>}
      <FormSection title="Page header">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heading} onChange={(x) => set("heading", x)} max={160} required />
        <TextArea label="Introduction" value={v.intro} onChange={(x) => set("intro", x)} max={1500} rows={4} />
        <LocalImageField label="Header image" folder="pages" value={v.image} onChange={(x) => set("image", x)} aspect="aspect-[16/10]" onBusyChange={setUploading} />
        <TextField label="Image description (alt text)" value={v.imageAlt} onChange={(x) => set("imageAlt", x)} max={200} />
      </FormSection>

      <FormSection title="Content sections" description="Each section shows a heading, text and an optional bullet list.">
        <ListEditor
          items={v.sections}
          onChange={(x) => set("sections", x)}
          max={20}
          blank={{ heading: "", body: "", bullets: [] }}
          addLabel="Add section"
          render={(item, update) => (
            <>
              <TextField label="Section heading" value={item.heading} onChange={(x) => update({ heading: x })} max={160} required />
              <TextArea label="Text" value={item.body} onChange={(x) => update({ body: x })} max={8000} rows={5} help={RICH_TEXT_HELP} />
              <LinesField label="Bullet points (optional)" value={item.bullets} onChange={(x) => update({ bullets: x })} rows={4} />
            </>
          )}
        />
      </FormSection>

      <FormSection title="Closing call to action">
        <TextField label="Heading" value={v.ctaHeading} onChange={(x) => set("ctaHeading", x)} max={160} required />
        <TextArea label="Text" value={v.ctaText} onChange={(x) => set("ctaText", x)} max={600} rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Button label" value={v.ctaButtonLabel} onChange={(x) => set("ctaButtonLabel", x)} max={40} required />
          <TextField label="Button link" value={v.ctaButtonHref} onChange={(x) => set("ctaButtonHref", x)} max={300} />
        </div>
      </FormSection>

      <SaveBar pending={pending} uploading={uploading} />
    </form>
  );
}

export function TestimonialsForm({ initial }: { initial: TestimonialsContent }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave("testimonials");
  const set = <K extends keyof TestimonialsContent>(k: K, val: TestimonialsContent[K]) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Page header">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} max={40} />
        <TextField label="Heading" value={v.heading} onChange={(x) => set("heading", x)} max={140} required />
        <TextArea label="Introduction" value={v.intro} onChange={(x) => set("intro", x)} max={800} />
      </FormSection>
      <FormSection title="Client reviews" description="Add genuine client feedback only. The first three also appear on the homepage.">
        <ListEditor
          items={v.testimonials}
          onChange={(x) => set("testimonials", x)}
          max={60}
          blank={{ quote: "", name: "", location: "" }}
          addLabel="Add review"
          render={(item, update) => (
            <>
              <TextArea label="Review" value={item.quote} onChange={(x) => update({ quote: x })} max={1500} rows={4} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Client name" value={item.name} onChange={(x) => update({ name: x })} max={80} required />
                <TextField label="Location (optional)" value={item.location} onChange={(x) => update({ location: x })} max={80} />
              </div>
            </>
          )}
        />
      </FormSection>
      <SaveBar pending={pending} uploading={false} />
    </form>
  );
}

export function ContactContentForm({ initial }: { initial: ContactContent }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave("contact");
  const set = <K extends keyof ContactContent>(k: K, val: ContactContent[K]) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => (e.preventDefault(), save(v))} className="space-y-6">
      <FormSection title="Contact page" description="Phone numbers, email and address are managed in Settings and only shown when filled in.">
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
