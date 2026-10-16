import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { HomeContent } from "@/lib/content-types";

export function Hero({ content, searchUrl }: { content: HomeContent; searchUrl: string }) {
  const lines = content.heroHeadline.split("\n").filter(Boolean);
  return (
    <section aria-labelledby="hero-heading" className="grid bg-mist lg:grid-cols-[38%_62%] xl:min-h-[clamp(600px,46vw,760px)] xl:grid-cols-[32%_68%]">
      <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 xl:justify-start xl:px-[clamp(2.5rem,4.5vw,4.5rem)] xl:pb-12 xl:pt-[clamp(128px,10.5vw,150px)]">
        <h1
          id="hero-heading"
          className="animate-rise font-display text-[clamp(2.6rem,3.7vw,4rem)] font-medium leading-[0.95] tracking-[-0.025em] text-navy"
        >
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="animate-rise mt-7 max-w-[27rem] text-[clamp(1.05rem,1.3vw,1.15rem)] leading-[1.6] text-ink/85 [animation-delay:120ms]">
          {content.heroText}
        </p>
        <div className="animate-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:240ms]">
          {searchUrl ? (
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-navy group">
              {content.heroButtonLabel} <ThinArrow className="btn-arrow" />
            </a>
          ) : (
            <Link href="/featured-properties" className="btn-navy group">
              {content.heroButtonLabel} <ThinArrow className="btn-arrow" />
            </Link>
          )}
          {content.heroSecondaryLabel && (
            <Link href="/contact" className="group inline-flex items-center gap-3 border-b border-navy pb-1 text-[16px] text-navy">
              {content.heroSecondaryLabel} <ThinArrow className="btn-arrow" />
            </Link>
          )}
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-auto">
        <SafeImage
          src={content.heroImage}
          alt={content.heroImageAlt}
          fill
          priority
          sizes="(min-width: 1280px) 68vw, (min-width: 1024px) 62vw, 100vw"
          className="animate-fade object-cover object-center"
        />
      </div>
    </section>
  );
}
