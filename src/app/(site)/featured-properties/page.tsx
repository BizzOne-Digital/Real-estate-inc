import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InfoPage } from "@/components/site/InfoPage";
import { CondoCard } from "@/components/realestate/Cards";
import { SectionIntro } from "@/components/home/SectionIntro";
import { ThinArrow } from "@/components/ui/Icons";
import { getCondos, getPage, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Featured Properties",
  description: "Browse homes, condos and rental properties for sale and lease in Mississauga, Toronto and the GTA.",
  alternates: { canonical: "/featured-properties" },
};

export default async function FeaturedPropertiesPage() {
  const [content, settings, condos] = await Promise.all([getPage("featured"), getSettings(), getCondos({ limit: 3 })]);

  const buttons = (
    <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
      {settings.propertySearchUrl && (
        <a href={settings.propertySearchUrl} target="_blank" rel="noopener noreferrer" className="btn-navy group">
          Search Properties <ExternalLink aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        </a>
      )}
      {settings.featuredListingsUrl && (
        <a
          href={settings.featuredListingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 border-b border-navy pb-1 text-[16px] text-navy"
        >
          View featured listings <ExternalLink aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        </a>
      )}
    </div>
  );

  return (
    <InfoPage content={content} heroExtra={buttons}>
      {condos.length > 0 && (
        <section className="border-b border-line bg-white py-16 lg:py-20">
          <div className="container-site">
            <SectionIntro
              eyebrow="Condominiums"
              heading="Popular condo buildings"
              text="Building details, amenities and neighbourhood information."
              action={
                <Link href="/condos" className="group inline-flex w-fit items-center gap-3 border-b border-navy pb-1 text-[16px] text-navy">
                  View all condos <ThinArrow className="btn-arrow" />
                </Link>
              }
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {condos.map((c) => (
                <CondoCard key={c._id} condo={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </InfoPage>
  );
}
