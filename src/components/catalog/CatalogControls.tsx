"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { PRODUCT_SORTS, type ProductSort } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  categories: { name: string; slug: string }[];
  active: { category: string; q: string; sort: ProductSort };
}

/** Category, search and sort controls. All state lives in the URL so results are shareable. */
export function CatalogControls({ categories, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(active.q);

  useEffect(() => setQ(active.q), [active.q]);

  function hrefWith(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // any filter change returns to page 1
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  function navigate(changes: Record<string, string | null>) {
    startTransition(() => router.push(hrefWith(changes), { scroll: false }));
  }

  return (
    <div className="space-y-6" aria-busy={pending}>
      <nav aria-label="Filter by category" className="-mx-1 flex flex-wrap gap-2">
        {[{ name: "All", slug: "" }, ...categories].map((c) => {
          const isActive = active.category === c.slug;
          return (
            <Link
              key={c.slug || "all"}
              href={hrefWith({ category: c.slug || null })}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate({ category: c.slug || null });
              }}
              className={cn(
                "mx-1 border px-4 py-2 font-sans text-[13px] tracking-wide transition-colors",
                isActive ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy",
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          role="search"
          className="relative w-full sm:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ q: q.trim() || null });
          }}
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search furniture
          </label>
          <Search aria-hidden strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="catalog-search"
            type="search"
            value={q}
            maxLength={80}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or material"
            className="w-full border border-line bg-white py-2.5 pl-9 pr-24 font-sans text-sm text-ink placeholder:text-muted/80 focus:border-navy focus:outline-none"
          />
          {active.q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQ("");
                navigate({ q: null });
              }}
              className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 p-1 text-muted hover:text-navy"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute inset-y-1 right-1 bg-navy px-3 font-sans text-xs uppercase tracking-wider text-white hover:bg-navy-deep"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          {pending && <Loader2 aria-label="Loading results" className="h-4 w-4 animate-spin text-navy" />}
          <label htmlFor="catalog-sort" className="font-sans text-xs uppercase tracking-[0.18em] text-muted">
            Sort
          </label>
          <select
            id="catalog-sort"
            value={active.sort}
            onChange={(e) => navigate({ sort: e.target.value === "featured" ? null : e.target.value })}
            className="border border-line bg-white px-3 py-2.5 font-sans text-sm text-ink focus:border-navy focus:outline-none"
          >
            {Object.entries(PRODUCT_SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
