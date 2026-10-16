import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB, plain } from "./db";
import { Condo, PageContent, Post, SiteSettings, type PageKey } from "./models";
import { DEFAULT_SETTINGS, withDefaults, type SiteSettingsData } from "./content-types";
import { PAGE_DEFAULTS, type PageMap } from "./page-defaults";
import type { CondoT, PostT } from "./types";
import { escapeRegex } from "./utils";

/** Every admin mutation expires CONTENT_TAG so public pages pick up changes. */
export const CONTENT_TAG = "site-content";
const opts = { tags: [CONTENT_TAG], revalidate: 600 };

export const getSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: "site" }).lean();
    return withDefaults(DEFAULT_SETTINGS, doc?.data);
  },
  ["settings-re-v1"],
  opts,
);

export { PAGE_DEFAULTS, type PageMap } from "./page-defaults";

const getPageRaw = unstable_cache(
  async (key: PageKey) => {
    await connectDB();
    const doc = await PageContent.findOne({ key }).lean();
    return plain<Record<string, unknown> | null>(doc?.data ?? null);
  },
  ["page-re-v1"],
  opts,
);

export async function getPage<K extends PageKey>(key: K): Promise<PageMap[K]> {
  return withDefaults(PAGE_DEFAULTS[key], await getPageRaw(key)) as PageMap[K];
}

// ---------- Condominiums ----------

export const getCondos = unstable_cache(
  async (opt: { featuredOnly?: boolean; limit?: number; city?: string } = {}): Promise<CondoT[]> => {
    await connectDB();
    const filter: Record<string, unknown> = { published: true };
    if (opt.featuredOnly) filter.featured = true;
    if (opt.city) filter.city = opt.city;
    let q = Condo.find(filter).sort({ featured: -1, order: 1, name: 1 });
    if (opt.limit) q = q.limit(opt.limit);
    return plain(await q.lean());
  },
  ["condos"],
  opts,
);

export const getCondoCities = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB();
    const cities = await Condo.distinct("city", { published: true });
    return (cities as string[]).filter(Boolean).sort();
  },
  ["condo-cities"],
  opts,
);

export const getCondoBySlug = unstable_cache(
  async (slug: string): Promise<CondoT | null> => {
    await connectDB();
    return plain(await Condo.findOne({ slug, published: true }).lean());
  },
  ["condo-by-slug"],
  opts,
);

// ---------- Market Insights ----------

export interface PostPage {
  items: PostT[];
  total: number;
  page: number;
  pages: number;
}

export const listPosts = unstable_cache(
  async (query: { category?: string; q?: string; page?: number; perPage?: number }): Promise<PostPage> => {
    await connectDB();
    const perPage = Math.min(Math.max(query.perPage ?? 9, 1), 48);
    const filter: Record<string, unknown> = { published: true, publishedAt: { $lte: new Date() } };
    if (query.category) filter.category = query.category;
    const q = query.q?.trim().slice(0, 80);
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { excerpt: rx }, { body: rx }];
    }
    const total = await Post.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(query.page ?? 1, 1), pages);
    const items = await Post.find(filter, { body: 0 })
      .sort({ publishedAt: -1, _id: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
    return { items: plain(items), total, page, pages };
  },
  ["posts-list"],
  opts,
);

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<PostT | null> => {
    await connectDB();
    return plain(await Post.findOne({ slug, published: true, publishedAt: { $lte: new Date() } }).lean());
  },
  ["post-by-slug"],
  opts,
);

export const getRelatedPosts = unstable_cache(
  async (category: string, excludeId: string, limit = 3): Promise<PostT[]> => {
    await connectDB();
    const base = { published: true, publishedAt: { $lte: new Date() }, _id: { $ne: excludeId } };
    let items = await Post.find({ ...base, category }, { body: 0 }).sort({ publishedAt: -1 }).limit(limit).lean();
    if (items.length < limit) {
      const more = await Post.find({ ...base, _id: { $nin: [excludeId, ...items.map((i) => i._id)] } }, { body: 0 })
        .sort({ publishedAt: -1 })
        .limit(limit - items.length)
        .lean();
      items = [...items, ...more];
    }
    return plain(items);
  },
  ["related-posts"],
  opts,
);

// ---------- Misc ----------

export const getSitemapEntries = unstable_cache(
  async () => {
    await connectDB();
    const [condos, posts] = await Promise.all([
      Condo.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
      Post.find({ published: true, publishedAt: { $lte: new Date() } }, { slug: 1, updatedAt: 1 }).lean(),
    ]);
    return plain<{ condos: { slug: string; updatedAt: string }[]; posts: { slug: string; updatedAt: string }[] }>({
      condos,
      posts,
    });
  },
  ["sitemap-re"],
  opts,
);

/** Condo buildings available for the contact form reference select. */
export const getCondoOptions = unstable_cache(
  async (): Promise<{ _id: string; name: string; slug: string }[]> => {
    await connectDB();
    return plain(await Condo.find({ published: true }, { name: 1, slug: 1 }).sort({ name: 1 }).lean());
  },
  ["condo-options"],
  opts,
);
