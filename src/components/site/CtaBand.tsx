import Link from "next/link";
import { ThinArrow } from "@/components/ui/Icons";
import { safeHref } from "@/lib/utils";

/** Full-width navy call-to-action band with an understated botanical shadow. */
export function CtaBand({ heading, buttonLabel, buttonHref }: { heading: string; buttonLabel: string; buttonHref: string }) {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-navy">
      <svg
        aria-hidden
        viewBox="0 0 400 200"
        className="pointer-events-none absolute -left-10 -top-6 h-[150%] w-auto text-navy-deep opacity-70 blur-[1.5px]"
        fill="currentColor"
      >
        <path d="M10 190C70 150 120 110 170 40c-30 60-60 110-150 150z" />
        <path d="M60 60c40-5 70 10 90 40-35 0-65-12-90-40z" />
        <path d="M30 120c35-20 75-20 105 5-40 12-75 10-105-5z" />
        <path d="M120 20c20 25 25 55 10 85-15-25-18-55-10-85z" />
        <path d="M200 110c35-15 70-8 95 18-35 5-68 0-95-18z" />
        <path d="M150 150c30-10 60-4 85 16-30 4-58 0-85-16z" />
      </svg>
      <div className="container-site relative flex flex-col items-center gap-6 py-12 text-center sm:py-14">
        <h2 id="cta-heading" className="font-display text-[clamp(2.2rem,4vw,3.15rem)] font-medium leading-tight text-white">
          {heading}
        </h2>
        <Link href={safeHref(buttonHref) ?? "/collections"} className="btn-outline-light group">
          {buttonLabel} <ThinArrow className="btn-arrow" />
        </Link>
      </div>
    </section>
  );
}
