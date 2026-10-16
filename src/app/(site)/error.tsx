"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-mist">
      <div className="container-site flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,3.8rem)] font-medium leading-none text-navy">
          We could not load this page.
        </h1>
        <p className="mt-5 max-w-md text-ink/80">Please try again. If the problem continues, come back in a few minutes.</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={reset} className="btn-navy">
            Try again
          </button>
          <Link href="/" className="inline-flex items-center border border-navy px-6 py-3 text-navy hover:bg-navy hover:text-white">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
