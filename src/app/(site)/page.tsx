import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { CategoryCards } from "@/components/home/CategoryCards";
import { FounderSection } from "@/components/home/FounderSection";
import { Faq, FeaturedProducts, GalleryTeaser, ProcessSteps, Testimonials, VisitStrip } from "@/components/home/HomeSections";
import { CtaBand } from "@/components/site/CtaBand";
import { getCategories, getFeaturedProducts, getGallery, getPage, getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.siteTitle }, alternates: { canonical: "/" } };
}

export default async function HomePage() {
  const [home, categories, settings, featured, gallery] = await Promise.all([
    getPage("home"),
    getCategories(),
    getSettings(),
    getFeaturedProducts(4),
    getGallery(),
  ]);
  const homeCategories = categories.filter((c) => c.showOnHome).slice(0, 3);

  return (
    <>
      <Hero content={home} />
      <Benefits items={home.benefits} />
      <CategoryCards heading={home.collectionsHeading} text={home.collectionsText} categories={homeCategories} />
      <FeaturedProducts content={home} products={featured} currency={settings.currency} />
      <FounderSection content={home} />
      <ProcessSteps content={home} />
      <GalleryTeaser content={home} items={gallery} />
      <Testimonials content={home} />
      <Faq content={home} />
      <VisitStrip content={home} settings={settings} />
      <CtaBand heading={home.ctaHeading} buttonLabel={home.ctaButtonLabel} buttonHref={home.ctaButtonHref} />
    </>
  );
}
