import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/collections", "/gallery", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
  try {
    const { products, categories } = await getSitemapEntries();
    return [
      ...staticRoutes,
      ...categories.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
      ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
