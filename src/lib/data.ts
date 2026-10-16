import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB, plain as serialize } from "./db";
import { resolveBundledImages } from "./generated-images";

function plain<T>(value: unknown): T {
  return resolveBundledImages(serialize<T>(value));
}
import { Category, GalleryItem, PageContent, Product, SiteSettings, type PageKey } from "./models";
import {
  DEFAULT_ABOUT,
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_HOME,
  DEFAULT_SETTINGS,
  withDefaults,
  type AboutContent,
  type CollectionsContent,
  type GalleryContent,
  type ContactContent,
  type HomeContent,
  type SiteSettingsData,
} from "./content-types";
import { PRODUCT_SORTS, type CategoryT, type GalleryItemT, type ProductSort, type ProductT } from "./types";
import { escapeRegex } from "./utils";

/** Every admin mutation calls revalidateTag(CONTENT_TAG) so public pages pick up changes. */
export const CONTENT_TAG = "site-content";
const opts = { tags: [CONTENT_TAG], revalidate: 600 };

export const getSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: "site" }).lean();
    return resolveBundledImages(withDefaults(DEFAULT_SETTINGS, doc?.data));
  },
  ["settings-v2"],
  opts,
);

type PageMap = {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  collections: CollectionsContent;
  gallery: GalleryContent;
};
const PAGE_DEFAULTS: PageMap = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
  collections: DEFAULT_COLLECTIONS,
  gallery: DEFAULT_GALLERY,
};

const getPageRaw = unstable_cache(
  async (key: PageKey) => {
    await connectDB();
    const doc = await PageContent.findOne({ key }).lean();
    return plain<Record<string, unknown> | null>(doc?.data ?? null);
  },
  ["page"],
  opts,
);

export async function getPage<K extends PageKey>(key: K): Promise<PageMap[K]> {
  return resolveBundledImages(withDefaults(PAGE_DEFAULTS[key], await getPageRaw(key))) as PageMap[K];
}

export const getCategories = unstable_cache(
  async (): Promise<CategoryT[]> => {
    await connectDB();
    return plain(await Category.find().sort({ order: 1, name: 1 }).lean());
  },
  ["categories"],
  opts,
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<CategoryT | null> => {
    await connectDB();
    return plain(await Category.findOne({ slug }).lean());
  },
  ["category-by-slug"],
  opts,
);

export interface ProductQuery {
  category?: string; // category slug
  q?: string;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
}

export interface ProductPage {
  items: ProductT[];
  total: number;
  page: number;
  pages: number;
}

const SORT_SPEC: Record<ProductSort, Record<string, 1 | -1>> = {
  featured: { featured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  "price-asc": { price: 1, name: 1 },
  "price-desc": { price: -1, name: 1 },
};

export function normalizeSort(v: unknown): ProductSort {
  return typeof v === "string" && v in PRODUCT_SORTS ? (v as ProductSort) : "featured";
}

export const listProducts = unstable_cache(
  async (query: ProductQuery): Promise<ProductPage> => {
    await connectDB();
    const perPage = Math.min(Math.max(query.perPage ?? 9, 1), 48);
    const filter: Record<string, unknown> = { published: true };
    if (query.category) {
      const cat = await Category.findOne({ slug: query.category }, { _id: 1 }).lean();
      if (!cat) return { items: [], total: 0, page: 1, pages: 1 };
      filter.category = cat._id;
    }
    const q = query.q?.trim().slice(0, 80);
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: rx }, { description: rx }, { materials: rx }, { finishes: rx }];
    }
    const total = await Product.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(query.page ?? 1, 1), pages);
    const items = await Product.find(filter)
      .sort({ ...SORT_SPEC[normalizeSort(query.sort)], _id: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("category", "name slug")
      .lean();
    return { items: plain(items), total, page, pages };
  },
  ["products-list"],
  opts,
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductT | null> => {
    await connectDB();
    return plain(await Product.findOne({ slug, published: true }).populate("category", "name slug").lean());
  },
  ["product-by-slug"],
  opts,
);

export const getRelatedProducts = unstable_cache(
  async (categoryId: string | null, excludeId: string | null, limit = 4): Promise<ProductT[]> => {
    await connectDB();
    const filter: Record<string, unknown> = { published: true };
    if (categoryId) filter.category = categoryId;
    if (excludeId) filter._id = { $ne: excludeId };
    const items = await Product.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .lean();
    return plain(items);
  },
  ["related-products"],
  opts,
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<ProductT[]> => {
    await connectDB();
    const items = await Product.find({ published: true })
      .sort({ featured: -1, updatedAt: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .lean();
    return plain(items);
  },
  ["featured-products"],
  opts,
);

export const getGallery = unstable_cache(
  async (): Promise<GalleryItemT[]> => {
    await connectDB();
    return plain(await GalleryItem.find().sort({ order: 1, createdAt: 1 }).populate("category", "name slug").lean());
  },
  ["gallery"],
  opts,
);

export const getSitemapEntries = unstable_cache(
  async () => {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
      Category.find({}, { slug: 1, updatedAt: 1 }).lean(),
    ]);
    return plain<{ products: { slug: string; updatedAt: string }[]; categories: { slug: string; updatedAt: string }[] }>({
      products,
      categories,
    });
  },
  ["sitemap"],
  opts,
);

/** Products available for the contact form's product reference select. */
export const getProductOptions = unstable_cache(
  async (): Promise<{ _id: string; name: string; slug: string }[]> => {
    await connectDB();
    return plain(await Product.find({ published: true }, { name: 1, slug: 1 }).sort({ name: 1 }).lean());
  },
  ["product-options"],
  opts,
);
