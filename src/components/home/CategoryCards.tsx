import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { CategoryT } from "@/lib/types";

export function CategoryCards({
  heading,
  text,
  categories,
}: {
  heading: string;
  text: string;
  categories: CategoryT[];
}) {
  return (
    <section aria-labelledby="collections-heading" className="bg-offwhite pb-3 pt-14 sm:pt-16 lg:pt-[72px]">
      <div className="container-site mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-5">
        <h2
          id="collections-heading"
          className="font-display text-[clamp(2.4rem,4.2vw,3.4rem)] font-medium leading-none tracking-[-0.015em] text-navy"
        >
          {heading}
        </h2>
        <p className="max-w-[20rem] text-[15px] leading-relaxed text-ink/80 md:mb-1">{text}</p>
      </div>
      {categories.length === 0 ? (
        <p className="container-site text-muted">Collections will appear here once they are added.</p>
      ) : (
        <ul className="mx-auto grid max-w-[1600px] gap-2.5 px-3 sm:grid-cols-2 lg:grid-cols-3 lg:px-5">
          {categories.map((c, i) => (
            <li key={c._id} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <Link
                href={`/collections/${c.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-mist-deep lg:aspect-[1.29/1]"
              >
                <SafeImage
                  src={c.image}
                  alt={`${c.name} furniture collection`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
                />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                <span className="absolute bottom-5 left-6 flex items-center gap-3 font-display text-[clamp(1.6rem,2.2vw,2rem)] text-white">
                  {c.name}
                  <ThinArrow size={22} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
