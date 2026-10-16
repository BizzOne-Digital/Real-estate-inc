import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { CatalogGridSkeleton } from "@/components/catalog/CatalogSkeleton";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { getCategories, getPage, getSettings, listProducts, normalizeSort } from "@/lib/data";
import type { CollectionsContent } from "@/lib/content-types";
import type { ProductSort } from "@/lib/types";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse our furniture catalog by room, material and style. Search, filter and inquire about any piece.",
  alternates: { canonical: "/collections" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CollectionsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = one(sp.category).slice(0, 90);
  const q = one(sp.q).slice(0, 80);
  const sort = normalizeSort(one(sp.sort));
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  const [categories, content] = await Promise.all([getCategories(), getPage("collections")]);
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <PageHeader
        eyebrow={content.eyebrow}
        title={activeCategory ? activeCategory.name : content.heading}
        text={activeCategory?.description || content.intro}
      />
      <section className="container-site py-12 lg:py-16">
        <CatalogControls categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} active={{ category, q, sort }} />
        <Suspense key={`${category}|${q}|${sort}|${page}`} fallback={<CatalogGridSkeleton />}>
          <CatalogResults category={category} q={q} sort={sort} page={page} content={content} />
        </Suspense>
      </section>
    </>
  );
}

async function CatalogResults({
  category,
  q,
  sort,
  page,
  content,
}: {
  category: string;
  q: string;
  sort: ProductSort;
  page: number;
  content: CollectionsContent;
}) {
  const [settings, result] = await Promise.all([
    getSettings(),
    listProducts({ category: category || undefined, q: q || undefined, sort, page, perPage: 9 }),
  ]);

  return (
    <>
      <p className="mt-8 font-sans text-xs uppercase tracking-[0.18em] text-muted" aria-live="polite">
        {result.total} {result.total === 1 ? "piece" : "pieces"}
        {q && <> matching &ldquo;{q}&rdquo;</>}
      </p>

      {result.items.length === 0 ? (
        <div className="mt-6 border border-line bg-white px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-navy">{content.emptyHeading}</h2>
          <p className="mx-auto mt-3 max-w-md text-ink/75">{content.emptyText}</p>
          <Link href="/collections" className="btn-navy mt-7">
            View all pieces
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((p) => (
            <ProductCard key={p._id} product={p} currency={settings.currency} />
          ))}
        </div>
      )}

      <div className="mt-14">
        <Pagination
          page={result.page}
          pages={result.pages}
          basePath="/collections"
          params={{ category: category || undefined, q: q || undefined, sort: sort === "featured" ? undefined : sort }}
        />
      </div>
    </>
  );
}
