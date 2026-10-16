/**
 * Idempotent seed: inserts sample categories, products, gallery items, page content and
 * settings ONLY where they do not already exist. It never overwrites admin edits and is
 * never run automatically when the app starts.
 *
 *   npm run seed
 */
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import {
  AdminSession,
  AdminUser,
  Category,
  GalleryItem,
  Inquiry,
  PageContent,
  Product,
  SiteSettings,
  StoredUpload,
  UploadChunk,
  UploadSession,
} from "../src/lib/models";
import {
  DEFAULT_ABOUT,
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_HOME,
  DEFAULT_SETTINGS,
} from "../src/lib/content-types";
import { SAMPLE_CATEGORIES, SAMPLE_GALLERY, SAMPLE_PRODUCTS } from "./seed-data";

export async function seed(log = console.log) {
  await connectDB();
  // Make sure all indexes (unique slugs, TTLs) exist.
  for (const m of [AdminUser, AdminSession, Category, Product, GalleryItem, PageContent, SiteSettings, Inquiry, StoredUpload, UploadSession, UploadChunk]) {
    await (m as mongoose.Model<unknown>).createIndexes();
  }

  let created = 0;
  for (const c of SAMPLE_CATEGORIES) {
    const res = await Category.updateOne({ slug: c.slug }, { $setOnInsert: { ...c, showOnHome: true } }, { upsert: true });
    created += res.upsertedCount;
  }
  log(`Categories: ${created} created, ${SAMPLE_CATEGORIES.length - created} already present.`);

  const cats = await Category.find({ slug: { $in: SAMPLE_CATEGORIES.map((c) => c.slug) } }, { slug: 1 }).lean();
  const catId = new Map(cats.map((c) => [c.slug, c._id]));

  created = 0;
  for (const p of SAMPLE_PRODUCTS) {
    const category = catId.get(p.category);
    if (!category) continue;
    const res = await Product.updateOne(
      { slug: p.slug },
      { $setOnInsert: { ...p, category, price: null, featured: Boolean(p.featured), published: true } },
      { upsert: true },
    );
    created += res.upsertedCount;
  }
  log(`Products: ${created} created, ${SAMPLE_PRODUCTS.length - created} already present.`);

  if ((await GalleryItem.estimatedDocumentCount()) === 0) {
    await GalleryItem.insertMany(
      SAMPLE_GALLERY.map((g, order) => ({ ...g, category: g.category ? (catId.get(g.category) ?? null) : null, order })),
    );
    log(`Gallery: ${SAMPLE_GALLERY.length} items created.`);
  } else {
    log("Gallery: already has items, skipped.");
  }

  for (const [key, data] of [
    ["home", DEFAULT_HOME],
    ["about", DEFAULT_ABOUT],
    ["contact", DEFAULT_CONTACT],
    ["collections", DEFAULT_COLLECTIONS],
    ["gallery", DEFAULT_GALLERY],
  ] as const) {
    const res = await PageContent.updateOne({ key }, { $setOnInsert: { key, data } }, { upsert: true });
    log(`Page "${key}": ${res.upsertedCount ? "created" : "already present, left unchanged"}.`);
  }
  const s = await SiteSettings.updateOne({ key: "site" }, { $setOnInsert: { key: "site", data: DEFAULT_SETTINGS } }, { upsert: true });
  log(`Settings: ${s.upsertedCount ? "created" : "already present, left unchanged"}.`);
}

if (process.argv[1] && /seed\.ts$/.test(process.argv[1])) {
  seed()
    .then(() => console.log("Seed complete."))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
