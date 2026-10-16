import Link from "next/link";
import { ThinArrow } from "@/components/ui/Icons";

export function NotFoundView() {
  return (
    <section className="bg-mist">
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.6rem)] font-medium leading-none text-navy">
          This page has moved on.
        </h1>
        <p className="mt-5 max-w-md text-[17px] text-ink/80">
          The page you are looking for does not exist or is no longer available.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-navy group justify-center">
            Back to home <ThinArrow className="btn-arrow" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center border border-navy px-6 py-3 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Contact Nadeem
          </Link>
        </div>
      </div>
    </section>
  );
}
