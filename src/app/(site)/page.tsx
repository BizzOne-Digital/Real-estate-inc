import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { FounderSection } from "@/components/home/FounderSection";
import {
  Faq,
  FeaturedCondos,
  LatestInsights,
  ProcessSteps,
  TestimonialsTeaser,
  ToolsSection,
  VisitStrip,
} from "@/components/home/HomeSections";
import { CtaBand } from "@/components/site/CtaBand";
import { getCondos, getPage, getSettings, listPosts } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.siteTitle }, alternates: { canonical: "/" } };
}

export default async function HomePage() {
  const [home, settings, condos, posts, testimonials] = await Promise.all([
    getPage("home"),
    getSettings(),
    getCondos({ limit: 3 }),
    listPosts({ perPage: 3 }),
    getPage("testimonials"),
  ]);
  // The closing CTA defaults to the external property search when no link is set.
  const ctaHref = home.ctaButtonHref || settings.propertySearchUrl || "/featured-properties";

  return (
    <>
      <Hero content={home} searchUrl={settings.propertySearchUrl} />
      <Benefits items={home.benefits} />
      <FeaturedCondos content={home} condos={condos} />
      <FounderSection content={home} />
      <ProcessSteps content={home} />
      <ToolsSection content={home} />
      <LatestInsights content={home} posts={posts.items} />
      <TestimonialsTeaser content={home} testimonials={testimonials.testimonials} />
      <Faq content={home} />
      <VisitStrip content={home} settings={settings} />
      <CtaBand heading={home.ctaHeading} buttonLabel={home.ctaButtonLabel} buttonHref={ctaHref} />
    </>
  );
}
