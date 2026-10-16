import Link from "next/link";
import { MapPin, Quote } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { LinkCard, Testimonial } from "@/lib/content-types";
import type { CondoT, PostT } from "@/lib/types";
import { formatDate, safeHref } from "@/lib/utils";

/** Large photo card with a white serif label, matching the reference room cards. */
export function ImageLinkCard({ card, sizes }: { card: LinkCard; sizes: string }) {
  const href = safeHref(card.href) ?? "/contact";
  const external = /^https?:\/\//.test(href);
  const inner = (
    <>
      <SafeImage
        src={card.image}
        alt=""
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <span className="absolute inset-x-6 bottom-5 text-white">
        <span className="flex items-center gap-3 font-display text-[clamp(1.6rem,2.2vw,2rem)] leading-tight">
          {card.title}
          <ThinArrow size={22} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
        {card.text && <span className="mt-1.5 block max-w-sm text-[14.5px] leading-snug text-white/85">{card.text}</span>}
      </span>
    </>
  );
  const cls = "group relative block aspect-[4/3] overflow-hidden bg-mist-deep lg:aspect-[1.2/1]";
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

export function CondoCard({ condo }: { condo: CondoT }) {
  return (
    <article className="group">
      <Link href={`/condos/${condo.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist-deep">
          <SafeImage
            src={condo.images[0]}
            alt={condo.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
          {condo.city && (
            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.2em] text-navy">
              {condo.city}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-[1.6rem] leading-tight text-navy">{condo.name}</h3>
            {condo.address && (
              <p className="mt-1 flex items-start gap-1.5 text-[14.5px] text-ink/75">
                <MapPin aria-hidden strokeWidth={1.25} className="mt-0.5 h-4 w-4 shrink-0" />
                {condo.address}
              </p>
            )}
            {condo.summary && <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-ink/80">{condo.summary}</p>}
          </div>
          <ThinArrow className="mt-3 shrink-0 text-navy transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </article>
  );
}

export function PostCard({ post }: { post: PostT }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-white">
      <Link href={`/market-insights/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-mist-deep">
          <SafeImage
            src={post.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted">
            {post.category} <span aria-hidden>·</span> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </p>
          <h3 className="mt-3 font-display text-[1.55rem] leading-tight text-navy">{post.title}</h3>
          {post.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink/80">{post.excerpt}</p>}
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[15px] text-navy">
            Read more <ThinArrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col border border-line bg-white p-8">
      <Quote aria-hidden strokeWidth={1} className="h-8 w-8 text-navy/40" />
      <blockquote className="mt-4 flex-1 font-display text-[1.3rem] leading-snug text-navy">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-6">
        <span className="block font-sans text-sm font-medium text-ink">{t.name}</span>
        {t.location && <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">{t.location}</span>}
      </figcaption>
    </figure>
  );
}
