import { CheckCircle2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { CtaBand } from "./CtaBand";
import { RichText } from "./RichText";
import type { InfoPageContent, InfoSection } from "@/lib/content-types";

/** Split hero matching the homepage: pale text panel + large photograph. */
export function InfoHero({ content, children }: { content: InfoPageContent; children?: React.ReactNode }) {
  return (
    <section className="grid border-b border-line bg-mist lg:grid-cols-[45%_55%]">
      <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-[clamp(2.5rem,5vw,4.5rem)] lg:py-20">
        {content.eyebrow && (
          <p className="eyebrow flex items-center gap-4">
            {content.eyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
        )}
        <h1 className="mt-5 font-display text-[clamp(2.6rem,4.8vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.02em] text-navy">
          {content.heading}
        </h1>
        {content.intro && <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/80">{content.intro}</p>}
        {children}
      </div>
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
        <SafeImage src={content.image} alt={content.imageAlt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
      </div>
    </section>
  );
}

export function InfoSections({ sections }: { sections: InfoSection[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="divide-y divide-line">
      {sections.map((s, i) => (
        <section key={i} className="grid gap-6 py-10 first:pt-0 last:pb-0 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-medium leading-tight text-navy">{s.heading}</h2>
          <div className="text-[16.5px] leading-relaxed text-ink/85">
            {s.body && <RichText text={s.body} />}
            {s.bullets.length > 0 && (
              <ul className={s.body ? "mt-6 space-y-3" : "space-y-3"}>
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3">
                    <CheckCircle2 aria-hidden strokeWidth={1.25} className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Standard content page: hero, optional custom block (calculator, links), sections, CTA. */
export function InfoPage({
  content,
  heroExtra,
  children,
}: {
  content: InfoPageContent;
  heroExtra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <InfoHero content={content}>{heroExtra}</InfoHero>
      {children}
      {content.sections.length > 0 && (
        <div className="bg-offwhite">
          <div className="container-site py-16 lg:py-20">
            <InfoSections sections={content.sections} />
          </div>
        </div>
      )}
      <CtaBand heading={content.ctaHeading} text={content.ctaText} buttonLabel={content.ctaButtonLabel} buttonHref={content.ctaButtonHref || "/contact"} />
    </>
  );
}
