import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CtaBand } from "@/components/site/CtaBand";
import { getCategoryBySlug, getPage, getSettings, listProducts } from "@/lib/data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Collection not found" };
  return {
    title: `${cat.name} Collection`,
    description: cat.description || `Explore our ${cat.name.toLowerCase()} furniture collection.`,
    alternates: { canonical: `/collections/${cat.slug}` },
    openGraph: { images: cat.image ? [cat.image] : undefined },
  };
}

export default async function CollectionDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [settings, content, products] = await Promise.all([
    getSettings(),
    getPage("collections"),
    listProducts({ category: category.slug, sort: "featured", perPage: 12 }),
  ]);

  return (
    <>
      <section className="grid bg-mist lg:grid-cols-[40%_60%]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-[clamp(2.5rem,5vw,4.5rem)] lg:py-20">
          <nav aria-label="Breadcrumb" className="font-sans text-xs uppercase tracking-[0.18em] text-muted">
            <Link href="/collections" className="hover:text-navy">
              Collections
            </Link>
            <span aria-hidden className="mx-2">/</span>
            <span aria-current="page" className="text-navy">
              {category.name}
            </span>
          </nav>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,5vw,4.4rem)] font-medium leading-[0.95] tracking-[-0.02em] text-navy">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/80">{category.description}</p>
          )}
          <Link href={`/collections?category=${category.slug}`} className="group mt-8 inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-navy">
            Search and sort this collection <ThinArrow className="btn-arrow" />
          </Link>
        </div>
        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[480px]">
          <SafeImage
            src={category.image}
            alt={`${category.name} interior`}
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="container-site py-14 lg:py-20" aria-labelledby="collection-products">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="collection-products" className="font-display text-[clamp(2rem,3.4vw,2.8rem)] text-navy">
            {content.detailProductsHeading}
          </h2>
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-muted">{products.total} pieces</p>
        </div>
        {products.items.length === 0 ? (
          <div className="border border-line bg-white px-6 py-14 text-center">
            <p className="text-ink/75">New pieces for this collection are on the way.</p>
            <Link href="/collections" className="btn-navy mt-6">
              Browse all collections
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {products.items.map((p) => (
              <ProductCard key={p._id} product={p} currency={settings.currency} />
            ))}
          </div>
        )}
        {products.pages > 1 && (
          <div className="mt-12 text-center">
            <Link href={`/collections?category=${category.slug}&page=2`} className="btn-navy group">
              View more {category.name.toLowerCase()} pieces <ThinArrow className="btn-arrow" />
            </Link>
          </div>
        )}
      </section>

      <CtaBand heading={content.detailCtaHeading} buttonLabel={content.detailCtaButtonLabel} buttonHref={content.detailCtaButtonHref} />
    </>
  );
}
