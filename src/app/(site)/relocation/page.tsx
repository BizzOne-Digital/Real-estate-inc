import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/site/InfoPage";
import { ThinArrow } from "@/components/ui/Icons";
import { getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Relocation Services",
  description:
    "Relocation services for families and newcomers moving to Toronto, Mississauga and the GTA: home finding, short and long term rentals, mortgages and settlement support.",
  alternates: { canonical: "/relocation" },
};

export default async function RelocationPage() {
  const content = await getPage("relocation");
  return (
    <InfoPage
      content={content}
      heroExtra={
        <div className="mt-9">
          <Link href="/contact?interest=Relocation%20services" className="btn-navy group">
            Plan your move <ThinArrow className="btn-arrow" />
          </Link>
        </div>
      }
    />
  );
}
