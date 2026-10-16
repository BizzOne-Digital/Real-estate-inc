import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { CondoCard } from "@/components/realestate/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { getCondoCities, getCondos } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Condominiums",
  description: "Condo building guides for Mississauga, Toronto and the GTA: amenities, features and neighbourhood information.",
  alternates: { canonical: "/condos" },
};

export default async function CondosPage({ searchParams }: { searchParams: Promise<{ city?: string | string[] }> }) {
  const sp = await searchParams;
  const requested = (Array.isArray(sp.city) ? sp.city[0] : sp.city) ?? "";
  const cities = await getCondoCities();
  const city = cities.includes(requested) ? requested : "";
  const condos = await getCondos({ city: city || undefined });

  return (
    <>
      <PageHeader
        eyebrow="Condominiums"
        title={city ? `Condos in ${city}` : "Condo buildings in the GTA"}
        text="Explore building features, amenities and neighbourhoods. Interested in buying, selling or renting in a building? Send an inquiry from any building page."
      />
      <section className="container-site py-12 lg:py-16">
        {cities.length > 1 && (
          <nav aria-label="Filter by city" className="mb-10 flex flex-wrap gap-2">
            {["", ...cities].map((c) => (
              <Link
                key={c || "all"}
                href={c ? `/condos?city=${encodeURIComponent(c)}` : "/condos"}
                aria-current={city === c ? "true" : undefined}
                className={cn(
                  "border px-4 py-2 font-sans text-[13px] tracking-wide transition-colors",
                  city === c ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy",
                )}
              >
                {c || "All cities"}
              </Link>
            ))}
          </nav>
        )}
        {condos.length === 0 ? (
          <div className="border border-line bg-white px-6 py-16 text-center">
            <h2 className="font-display text-3xl text-navy">New building guides coming soon</h2>
            <p className="mx-auto mt-3 max-w-md text-ink/75">Looking for a specific condo? Send a message and Nadeem will help.</p>
            <Link href="/contact?interest=Condominium%20inquiry" className="btn-navy mt-7">
              Ask about a building
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {condos.map((c) => (
              <CondoCard key={c._id} condo={c} />
            ))}
          </div>
        )}
      </section>
      <CtaBand heading="Buying, selling or renting a condo?" buttonLabel="Contact Nadeem" buttonHref="/contact?interest=Condominium%20inquiry" />
    </>
  );
}
