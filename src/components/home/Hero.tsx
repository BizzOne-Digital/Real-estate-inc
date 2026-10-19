import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { HomeContent, LinkCard } from "@/lib/content-types";
import { safeHref } from "@/lib/utils";
import { PropertySearch } from "./PropertySearch";

/**
 * First screen of the homepage: a compact split hero, the property search panel and the
 * three service shortcuts, sized to fit a typical laptop screen without scrolling.
 */
export function Hero({ content, searchUrl }: { content: HomeContent; searchUrl: string }) {
  const lines = content.heroHeadline.split("\n").filter(Boolean);
  return (
    <div className="bg-mist">
      <section aria-labelledby="hero-heading" className="container-site grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-5">
        <div className="flex flex-col justify-center py-3 lg:py-2">
          <h1
            id="hero-heading"
            className="animate-rise font-display text-[clamp(2.3rem,3.1vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.025em] text-navy"
          >
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="animate-rise mt-5 max-w-[28rem] text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.55] text-ink/85 [animation-delay:120ms]">
            {content.heroText}
          </p>
          {content.heroSecondaryLabel && (
            <Link
              href="/contact"
              className="animate-rise group mt-6 inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-[16px] text-navy [animation-delay:240ms]"
            >
              {content.heroSecondaryLabel} <ThinArrow className="btn-arrow" />
            </Link>
          )}
        </div>
        <div className="relative h-[220px] overflow-hidden sm:h-[280px] lg:h-[clamp(240px,20vw,320px)] lg:self-center">
          <SafeImage
            src={content.heroImage}
            alt={content.heroImageAlt}
            fill
            priority
            sizes="(min-width: 1320px) 630px, (min-width: 1024px) 50vw, 100vw"
            className="animate-fade object-cover object-[50%_60%]"
          />
        </div>
      </section>

      <div className="container-site relative">
        <PropertySearch searchUrl={searchUrl} heading={content.searchHeading} text={content.searchText} />
      </div>

      {content.services.length > 0 && (
        <nav aria-label="Services" className="container-site pb-8 pt-4 lg:pb-10">
          <ul className="grid gap-3 md:grid-cols-3">
            {content.services.map((card, i) => (
              <li key={i}>
                <ServiceShortcut card={card} />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function ServiceShortcut({ card }: { card: LinkCard }) {
  const href = safeHref(card.href) ?? "/contact";
  const external = /^https?:\/\//.test(href);
  const inner = (
    <>
      <div className="relative h-full w-[38%] shrink-0 overflow-hidden bg-mist-deep">
        <SafeImage
          src={card.image}
          alt=""
          fill
          sizes="(min-width: 768px) 12vw, 38vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
        <span className="flex items-center gap-2.5 font-display text-[1.7rem] leading-none text-navy">
          {card.title}
          <ThinArrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        {card.text && <span className="mt-2 line-clamp-2 text-[14px] leading-snug text-ink/75">{card.text}</span>}
      </div>
    </>
  );
  const cls =
    "group flex h-[116px] overflow-hidden border border-line bg-white transition-shadow duration-300 hover:shadow-[0_16px_34px_-22px_rgba(32,42,80,0.55)]";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
