import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/data";

// Pages read MongoDB at request time; the data layer caches queries and admin saves revalidate them.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seoTitle || s.siteTitle, template: `%s | ${s.siteTitle}` },
    description: s.seoDescription,
    openGraph: {
      type: "website",
      siteName: s.siteTitle,
      title: s.seoTitle || s.siteTitle,
      description: s.seoDescription,
      images: s.ogImage ? [s.ogImage] : undefined,
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-navy"
      >
        Skip to content
      </a>
      <Header logo={settings.logo} logoAlt={settings.logoAlt} />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
