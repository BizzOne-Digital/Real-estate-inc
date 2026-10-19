import Link from "next/link";
import { Mail, MapPin, Phone, Plus } from "lucide-react";
import { CondoCard, ImageLinkCard, PostCard, TestimonialCard } from "@/components/realestate/Cards";
import { ThinArrow } from "@/components/ui/Icons";
import type { HomeContent, SiteSettingsData, Testimonial } from "@/lib/content-types";
import type { CondoT, PostT } from "@/lib/types";
import { SectionIntro } from "./SectionIntro";

const outlineLink = "group inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-[16px] text-navy";

export function FeaturedCondos({ content, condos }: { content: HomeContent; condos: CondoT[] }) {
  if (!content.showCondos || condos.length === 0) return null;
  return (
    <section aria-labelledby="condos-heading" className="bg-offwhite py-16 lg:py-24">
      <div className="container-site">
        <SectionIntro
          id="condos-heading"
          eyebrow={content.condosEyebrow}
          heading={content.condosHeading}
          text={content.condosText}
          action={
            <Link href="/condos" className={outlineLink}>
              {content.condosButtonLabel} <ThinArrow className="btn-arrow" />
            </Link>
          }
        />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {condos.map((c) => (
            <CondoCard key={c._id} condo={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSteps({ content }: { content: HomeContent }) {
  if (!content.showProcess || content.processSteps.length === 0) return null;
  return (
    <section aria-labelledby="process-heading" className="border-y border-line bg-white py-16 lg:py-24">
      <div className="container-site">
        <SectionIntro id="process-heading" eyebrow={content.processEyebrow} heading={content.processHeading} text={content.processText} align="center" />
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {content.processSteps.map((s, i) => (
            <li key={i} className="relative lg:px-8 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line">
              <span className="font-display text-[3.2rem] leading-none text-navy/25">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-[1.8rem] leading-tight text-navy">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ToolsSection({ content }: { content: HomeContent }) {
  if (!content.showTools || content.tools.length === 0) return null;
  return (
    <section aria-labelledby="tools-heading" className="bg-mist py-16 lg:py-24">
      <div className="container-site">
        <SectionIntro id="tools-heading" eyebrow={content.toolsEyebrow} heading={content.toolsHeading} text={content.toolsText} />
        <ul className="grid gap-4 md:grid-cols-3">
          {content.tools.map((card, i) => (
            <li key={i}>
              <ImageLinkCard card={card} sizes="(min-width: 768px) 33vw, 100vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LatestInsights({ content, posts }: { content: HomeContent; posts: PostT[] }) {
  if (!content.showInsights || posts.length === 0) return null;
  return (
    <section aria-labelledby="insights-heading" className="bg-offwhite py-16 lg:py-24">
      <div className="container-site">
        <SectionIntro
          id="insights-heading"
          eyebrow={content.insightsEyebrow}
          heading={content.insightsHeading}
          text={content.insightsText}
          action={
            <Link href="/market-insights" className={outlineLink}>
              All insights <ThinArrow className="btn-arrow" />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsTeaser({ content, testimonials }: { content: HomeContent; testimonials: Testimonial[] }) {
  if (!content.showTestimonials || testimonials.length === 0) return null;
  return (
    <section aria-labelledby="testimonials-heading" className="border-t border-line bg-white py-16 lg:py-24">
      <div className="container-site">
        <SectionIntro
          id="testimonials-heading"
          eyebrow={content.testimonialsEyebrow}
          heading={content.testimonialsHeading}
          action={
            <Link href="/testimonials" className={outlineLink}>
              Read all reviews <ThinArrow className="btn-arrow" />
            </Link>
          }
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t, i) => (
            <li key={i}>
              <TestimonialCard t={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ content }: { content: HomeContent }) {
  if (!content.showFaq || content.faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading" className="border-t border-line bg-offwhite py-16 lg:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow flex items-center gap-4">
            {content.faqEyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
          <h2 id="faq-heading" className="mt-4 font-display text-[clamp(2.3rem,4vw,3.3rem)] font-medium leading-none text-navy">
            {content.faqHeading}
          </h2>
          {content.faqText && <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/80">{content.faqText}</p>}
          <Link href="/contact" className={`${outlineLink} mt-8`}>
            Ask a question <ThinArrow className="btn-arrow" />
          </Link>
        </div>
        <div className="border-t border-line">
          {content.faqs.map((f, i) => (
            <details key={i} className="group border-b border-line py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.45rem] leading-snug text-navy [&::-webkit-details-marker]:hidden">
                {f.question}
                <Plus aria-hidden strokeWidth={1.25} className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink/80">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactDetailsCard({ settings }: { settings: SiteSettingsData }) {
  const phones = [
    settings.contactPhone && { label: settings.contactPhone, number: settings.contactPhone },
    ...(settings.extraPhones ?? []).map((p) => ({ label: `${p.label ? `${p.label}: ` : ""}${p.number}`, number: p.number })),
  ].filter(Boolean) as { label: string; number: string }[];
  if (phones.length === 0 && !settings.contactEmail && !settings.contactAddress) return null;
  return (
    <ul className="grid gap-6 border border-line bg-white p-8 sm:grid-cols-2">
      {phones.length > 0 && (
        <li className="flex gap-4">
          <Phone aria-hidden strokeWidth={1.25} className="mt-1 h-5 w-5 shrink-0 text-navy" />
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">Call</p>
            {phones.map((p) => (
              <a key={p.label} href={`tel:${p.number.replace(/[^\d+]/g, "")}`} className="mt-1 block text-[16px] text-navy hover:underline">
                {p.label}
              </a>
            ))}
          </div>
        </li>
      )}
      {settings.contactEmail && (
        <li className="flex gap-4">
          <Mail aria-hidden strokeWidth={1.25} className="mt-1 h-5 w-5 shrink-0 text-navy" />
          <div className="min-w-0">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">Email</p>
            <a href={`mailto:${settings.contactEmail}`} className="mt-1 block break-words text-[16px] text-navy hover:underline">
              {settings.contactEmail}
            </a>
          </div>
        </li>
      )}
      {settings.contactAddress && (
        <li className="flex gap-4 sm:col-span-2">
          <MapPin aria-hidden strokeWidth={1.25} className="mt-1 h-5 w-5 shrink-0 text-navy" />
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">Office</p>
            <p className="mt-1 whitespace-pre-line text-[16px] text-ink">{settings.contactAddress}</p>
          </div>
        </li>
      )}
    </ul>
  );
}

export function VisitStrip({ content, settings }: { content: HomeContent; settings: SiteSettingsData }) {
  if (!content.showVisit) return null;
  return (
    <section aria-labelledby="visit-heading" className="bg-mist py-16 lg:py-20">
      <div className="container-site grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow flex items-center gap-4">
            {content.visitEyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
          <h2 id="visit-heading" className="mt-4 font-display text-[clamp(2.3rem,4vw,3.3rem)] font-medium leading-none text-navy">
            {content.visitHeading}
          </h2>
          {content.visitText && <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/80">{content.visitText}</p>}
          <Link href="/contact" className="btn-navy group mt-8">
            {content.visitButtonLabel} <ThinArrow className="btn-arrow" />
          </Link>
        </div>
        <ContactDetailsCard settings={settings} />
      </div>
    </section>
  );
}
