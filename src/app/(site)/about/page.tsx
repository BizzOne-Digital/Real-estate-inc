import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { CtaBand } from "@/components/site/CtaBand";
import { RichText } from "@/components/site/RichText";
import { ContactDetailsCard } from "@/components/home/HomeSections";
import { ThinArrow } from "@/components/ui/Icons";
import { getPage, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Nadeem Khan, Broker",
  description:
    "Nadeem Khan is a real estate Broker with Discover Real Estate Inc., helping clients buy, sell and rent across Mississauga, Toronto and the GTA.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [about, home, settings] = await Promise.all([getPage("about"), getPage("home"), getSettings()]);

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-site py-14 sm:py-16 lg:py-24">
          <p className="eyebrow flex items-center gap-4">
            {about.heroEyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.8rem,5.6vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.02em] text-navy">
            {about.heroHeading}
          </h1>
          {about.heroText && <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink/80">{about.heroText}</p>}
        </div>
      </section>

      <section aria-labelledby="founder-title" className="grid lg:grid-cols-[54.4%_45.6%]">
        <div className="relative aspect-[1.85/1] overflow-hidden bg-[#8a7f75] lg:aspect-auto lg:min-h-[560px]">
          <SafeImage
            src={about.founderImage}
            alt={about.founderName ? `Portrait of ${about.founderName}` : "Portrait"}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
        <div className="flex flex-col justify-center bg-white px-6 py-14 sm:px-12 lg:px-16">
          <p className="eyebrow">{home.founderEyebrow}</p>
          <h2 id="founder-title" className="mt-5 font-display text-[clamp(2.4rem,4vw,3.4rem)] font-medium leading-none text-navy">
            {about.founderName || home.founderHeading}
          </h2>
          {about.founderRole && <p className="mt-3 font-sans text-sm uppercase tracking-[0.18em] text-muted">{about.founderRole}</p>}
          <RichText text={about.founderBio || home.founderText} className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-ink/85" />
          <Link href="/contact" className="group mt-8 inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-[16px] text-navy">
            Contact {settings.agentName || "us"} <ThinArrow className="btn-arrow" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="story-title" className="bg-offwhite">
        <div className="container-site grid items-start gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <h2 id="story-title" className="font-display text-[clamp(2.2rem,3.6vw,3rem)] font-medium leading-tight text-navy">
              {about.storyHeading}
            </h2>
            <RichText text={about.storyText} className="mt-6 text-[16.5px] leading-relaxed text-ink/85" />
            {about.services.length > 0 && (
              <div className="mt-12 border-t border-line pt-10">
                <h2 className="font-display text-[clamp(2rem,3.2vw,2.6rem)] font-medium leading-tight text-navy">{about.servicesHeading}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {about.services.map((s) => (
                    <li key={s} className="flex gap-3 text-[16px] text-ink/85">
                      <CheckCircle2 aria-hidden strokeWidth={1.25} className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-mist-deep lg:sticky lg:top-8">
            <SafeImage src={about.storyImage} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="container-site grid gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <div>
            <h2 className="font-display text-[clamp(2rem,3.2vw,2.6rem)] font-medium leading-tight text-navy">{about.approachHeading}</h2>
            <RichText text={about.approachText} className="mt-5 text-[16.5px] leading-relaxed text-ink/85" />
          </div>
          {about.memberships.length > 0 && (
            <div>
              <h2 className="font-display text-[clamp(2rem,3.2vw,2.6rem)] font-medium leading-tight text-navy">{about.membershipsHeading}</h2>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {about.memberships.map((m) => (
                  <li key={m} className="py-3.5 text-[16px] text-ink">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {about.values.length > 0 && (
        <section aria-labelledby="values-title" className="border-t border-line bg-mist">
          <div className="container-site py-16 lg:py-20">
            <h2 id="values-title" className="font-display text-[clamp(2.2rem,3.6vw,3rem)] font-medium text-navy">
              {about.valuesHeading}
            </h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0">
              {about.values.map((v, i) => (
                <li key={i} className="md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-divider/60">
                  <p className="font-sans text-xs tracking-[0.2em] text-muted">0{i + 1}</p>
                  <h3 className="mt-3 font-display text-[1.9rem] leading-tight text-navy">{v.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-offwhite">
        <div className="container-site py-14">
          <ContactDetailsCard settings={settings} />
        </div>
      </section>

      <CtaBand heading={home.ctaHeading} buttonLabel="Contact Nadeem" buttonHref="/contact" />
    </>
  );
}
