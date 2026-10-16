import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { getGallery, getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Inspiration Gallery",
  description: "Interior inspiration for living rooms, bedrooms and dining spaces.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [items, content] = await Promise.all([getGallery(), getPage("gallery")]);
  return (
    <>
      <PageHeader
        eyebrow={content.eyebrow}
        title={content.heading}
        text={content.intro}
      />
      <section className="container-site py-12 lg:py-16">
        {items.length === 0 ? (
          <p className="border border-line bg-white px-6 py-14 text-center text-ink/75">
            Inspiration images will appear here soon.
          </p>
        ) : (
          <GalleryGrid items={items} />
        )}
      </section>
      <CtaBand heading={content.ctaHeading} buttonLabel={content.ctaButtonLabel} buttonHref={content.ctaButtonHref} />
    </>
  );
}
