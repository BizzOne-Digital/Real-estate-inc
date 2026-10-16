import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { HomeContent } from "@/lib/content-types";

export function Hero({ content }: { content: HomeContent }) {
  const lines = content.heroHeadline.split("\n").filter(Boolean);
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid bg-mist lg:min-h-[clamp(560px,44vw,720px)] lg:grid-cols-[32%_68%]"
    >
      <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:justify-start lg:px-[clamp(2.5rem,5vw,4.5rem)] lg:pb-12 lg:pt-[clamp(120px,10.5vw,150px)]">
        <h1
          id="hero-heading"
          className="animate-rise font-display text-[clamp(2.9rem,4.5vw,4.7rem)] font-medium leading-[0.92] tracking-[-0.025em] text-navy"
        >
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p
          className="animate-rise mt-7 max-w-[25rem] text-[clamp(1.05rem,1.35vw,1.2rem)] leading-[1.55] text-ink/85 [animation-delay:120ms]"
        >
          {content.heroText}
        </p>
        <div className="animate-rise mt-9 [animation-delay:240ms]">
          <Link href="/collections" className="btn-navy group">
            {content.heroButtonLabel} <ThinArrow className="btn-arrow" />
          </Link>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-auto">
        <SafeImage
          src={content.heroImage}
          alt={content.heroImageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 68vw, 100vw"
          className="animate-fade object-cover object-[55%_60%]"
        />
      </div>
    </section>
  );
}
