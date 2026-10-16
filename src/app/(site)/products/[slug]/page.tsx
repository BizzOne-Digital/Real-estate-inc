import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ThinArrow } from "@/components/ui/Icons";
import { getPage, getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160) || `${product.name} — furniture and home interiors.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { images: product.images[0] ? [product.images[0]] : undefined },
  };
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-t border-line py-4">
      <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="text-[16px] text-ink">{children}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, content, related] = await Promise.all([
    getSettings(),
    getPage("collections"),
    getRelatedProducts(product.category?._id ?? null, product._id, 3),
  ]);
  const price = formatPrice(product.price, settings.currency);
  const inquiryHref = `/contact?product=${encodeURIComponent(product.slug)}`;

  return (
    <>
      <div className="container-site py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="mb-8 font-sans text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/collections" className="hover:text-navy">
            Collections
          </Link>
          {product.category && (
            <>
              <span aria-hidden className="mx-2">/</span>
              <Link href={`/collections/${product.category.slug}`} className="hover:text-navy">
                {product.category.name}
              </Link>
            </>
          )}
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="text-navy">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[55%_1fr] lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:pt-4">
            {product.category && <p className="eyebrow">{product.category.name}</p>}
            <h1 className="mt-4 font-display text-[clamp(2.6rem,4.4vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.02em] text-navy">
              {product.name}
            </h1>
            {price && <p className="mt-4 text-xl text-ink">{price}</p>}
            {product.description && (
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink/85">
                {product.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            <dl className="mt-8 border-b border-line">
              {product.materials.length > 0 && <Spec label="Materials">{product.materials.join(", ")}</Spec>}
              {product.dimensions && <Spec label="Dimensions">{product.dimensions}</Spec>}
              {product.finishes.length > 0 && (
                <Spec label="Finishes">
                  <ul className="flex flex-wrap gap-2">
                    {product.finishes.map((f) => (
                      <li key={f} className="border border-line bg-white px-3 py-1 text-[14px]">
                        {f}
                      </li>
                    ))}
                  </ul>
                </Spec>
              )}
              {product.category && (
                <Spec label="Category">
                  <Link href={`/collections/${product.category.slug}`} className="underline-offset-4 hover:underline">
                    {product.category.name}
                  </Link>
                </Spec>
              )}
            </dl>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={inquiryHref} className="btn-navy group justify-center">
                {content.productInquiryLabel} <ThinArrow className="btn-arrow" />
              </Link>
              <Link
                href={product.category ? `/collections/${product.category.slug}` : "/collections"}
                className="inline-flex items-center justify-center border border-navy px-6 py-3 text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Back to collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-line bg-mist">
          <div className="container-site py-14 lg:py-20">
            <h2 id="related-heading" className="mb-8 font-display text-[clamp(2rem,3.4vw,2.8rem)] text-navy">
              {content.relatedHeading}
            </h2>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} currency={settings.currency} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
