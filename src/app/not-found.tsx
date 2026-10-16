import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NotFoundView } from "@/components/site/NotFoundView";
import { DEFAULT_SETTINGS, type SiteSettingsData } from "@/lib/content-types";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Handles URLs that match no route, so it renders the public chrome itself. */
export default async function RootNotFound() {
  let settings: SiteSettingsData = DEFAULT_SETTINGS;
  try {
    settings = await getSettings();
  } catch {
    // Fall back to defaults if the database is unreachable.
  }
  return (
    <>
      <Header logo={settings.logo} logoAlt={settings.logoAlt} searchUrl={settings.propertySearchUrl} />
      <main id="main">
        <NotFoundView />
      </main>
      <Footer settings={settings} />
    </>
  );
}
