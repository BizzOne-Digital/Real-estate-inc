import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { HomeContent } from "@/lib/content-types";

export function FounderSection({ content }: { content: HomeContent }) {
  return (
    <section aria-labelledby="founder-heading" className="grid lg:grid-cols-[54.4%_45.6%]">
      <div className="relative aspect-[1.85/1] overflow-hidden bg-[#8a7f75] lg:aspect-auto lg:min-h-[clamp(420px,29.5vw,560px)]">
        <SafeImage
          src={content.founderImage}
          alt={content.founderImageAlt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div className="flex flex-col justify-center bg-mist px-6 py-14 sm:px-12 lg:px-[clamp(3rem,4.4vw,4.5rem)] lg:py-12">
        <p className="eyebrow flex items-center gap-4">
          {content.founderEyebrow}
          <span aria-hidden className="h-px w-12 bg-navy/70" />
        </p>
        <h2
          id="founder-heading"
          className="mt-6 max-w-[22rem] font-display text-[clamp(2.6rem,4.4vw,3.6rem)] font-medium leading-[0.95] tracking-[-0.02em] text-navy"
        >
          {content.founderHeading}
        </h2>
        <p className="mt-6 max-w-[23rem] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-[1.45] text-ink/85">
          {content.founderText}
        </p>
        <Link
          href="/about"
          className="group mt-7 inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-[17px] text-navy"
        >
          {content.founderLinkLabel} <ThinArrow className="btn-arrow" />
        </Link>
      </div>
    </section>
  );
}
