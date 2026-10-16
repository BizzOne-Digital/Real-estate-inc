import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/about",
  "/featured-properties",
  "/condos",
  "/relocation",
  "/mortgage",
  "/land-transfer-tax",
  "/market-insights",
  "/testimonials",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
  try {
    const { condos, posts } = await getSitemapEntries();
    return [
      ...staticRoutes,
      ...condos.map((c) => ({ url: `${base}/condos/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
      ...posts.map((p) => ({ url: `${base}/market-insights/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
