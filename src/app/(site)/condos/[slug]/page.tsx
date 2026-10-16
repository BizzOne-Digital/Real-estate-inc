import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin } from "lucide-react";
import { ImageGallery } from "@/components/realestate/ImageGallery";
import { CondoCard } from "@/components/realestate/Cards";
import { RichText } from "@/components/site/RichText";
import { CtaBand } from "@/components/site/CtaBand";
import { ThinArrow } from "@/components/ui/Icons";
import { getCondoBySlug, getCondos, getSettings } from "@/lib/data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const condo = await getCondoBySlug(slug);
  if (!condo) return { title: "Condo not found" };
  return {
    title: `${condo.name}${condo.city ? `, ${condo.city}` : ""} | Condo Guide`,
    description: condo.summary || `Building details, amenities and neighbourhood information for ${condo.name}.`,
    alternates: { canonical: `/condos/${condo.slug}` },
    openGraph: { images: condo.images[0] ? [condo.images[0]] : undefined },
  };
}

export default async function CondoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const condo = await getCondoBySlug(slug);
  if (!condo) notFound();
  const [settings, all] = await Promise.all([getSettings(), getCondos({})]);
  const others = all.filter((c) => c._id !== condo._id).slice(0, 3);
  const inquiryHref = `/contact?interest=${encodeURIComponent("Condominium inquiry")}&condo=${encodeURIComponent(condo.slug)}`;
  const mapQuery = condo.mapQuery || condo.address;

  const facts = [
    condo.address && { label: "Address", value: condo.address },
    condo.city && { label: "City", value: condo.city },
    condo.neighbourhood && { label: "Neighbourhood", value: condo.neighbourhood },
    condo.intersection && { label: "Major intersection", value: condo.intersection },
    condo.developer && { label: "Developer", value: condo.developer },
    ...condo.details,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <div className="container-site py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="mb-8 font-sans text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/condos" className="hover:text-navy">
            Condominiums
          </Link>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="text-navy">
            {condo.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[55%_1fr] lg:gap-16">
          <ImageGallery images={condo.images} name={condo.name} />
          <div className="lg:pt-2">
            {condo.city && <p className="eyebrow">{condo.city}</p>}
            <h1 className="mt-4 font-display text-[clamp(2.5rem,4.2vw,3.7rem)] font-medium leading-[0.98] tracking-[-0.02em] text-navy">
              {condo.name}
            </h1>
            {condo.address && (
              <p className="mt-4 flex items-start gap-2 text-[16px] text-ink/80">
                <MapPin aria-hidden strokeWidth={1.25} className="mt-1 h-4 w-4 shrink-0 text-navy" />
                {condo.address}
              </p>
            )}
            {condo.summary && <p className="mt-6 text-[17px] leading-relaxed text-ink/85">{condo.summary}</p>}
            {facts.length > 0 && (
              <dl className="mt-8 border-b border-line">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-4 border-t border-line py-3.5">
                    <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
                    <dd className="text-[15.5px] text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={inquiryHref} className="btn-navy group justify-center">
                Inquire about this building <ThinArrow className="btn-arrow" />
              </Link>
              {settings.propertySearchUrl && (
                <a
                  href={settings.propertySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-navy px-6 py-3 text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  Search listings
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {(condo.description || condo.featureGroups.length > 0) && (
        <section className="border-t border-line bg-white">
          <div className="container-site grid gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
            <div>
              {condo.description && (
                <>
                  <h2 className="font-display text-[clamp(2rem,3.2vw,2.6rem)] font-medium text-navy">About the building</h2>
                  <RichText text={condo.description} className="mt-6 text-[16.5px] leading-relaxed text-ink/85" />
                </>
              )}
            </div>
            {condo.featureGroups.length > 0 && (
              <div className="space-y-8">
                {condo.featureGroups.map((g, i) => (
                  <div key={i}>
                    <h3 className="eyebrow mb-4">{g.heading}</h3>
                    <ul className="space-y-2.5">
                      {g.items.map((item, j) => (
                        <li key={j} className="flex gap-3 text-[15.5px] text-ink/85">
                          <CheckCircle2 aria-hidden strokeWidth={1.25} className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {mapQuery && (
        <section aria-label="Map" className="border-t border-line bg-mist">
          <div className="container-site py-14">
            <h2 className="mb-6 font-display text-[clamp(1.9rem,3vw,2.4rem)] text-navy">Location</h2>
            <div className="relative aspect-[16/9] overflow-hidden border border-line bg-white sm:aspect-[21/9]">
              <iframe
                title={`Map of ${condo.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="more-condos" className="border-t border-line bg-offwhite">
          <div className="container-site py-14 lg:py-20">
            <h2 id="more-condos" className="mb-8 font-display text-[clamp(2rem,3.4vw,2.8rem)] text-navy">
              More condo buildings
            </h2>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((c) => (
                <CondoCard key={c._id} condo={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand heading={`Interested in ${condo.name}?`} buttonLabel="Send an Inquiry" buttonHref={inquiryHref} />
    </>
  );
}
