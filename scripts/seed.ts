/**
 * Idempotent seed: inserts starter condo pages, Market Insights articles, page content and
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
  Condo,
  Inquiry,
  PageContent,
  Post,
  SiteSettings,
  StoredUpload,
  UploadChunk,
  UploadSession,
  type PageKey,
} from "../src/lib/models";
import { DEFAULT_SETTINGS } from "../src/lib/content-types";
import { PAGE_DEFAULTS } from "../src/lib/page-defaults";
import { SAMPLE_CONDOS, SAMPLE_POSTS } from "./seed-data";

export async function seed(log = console.log) {
  await connectDB();
  // Make sure all indexes (unique slugs, TTLs) exist.
  for (const m of [AdminUser, AdminSession, Condo, Post, PageContent, SiteSettings, Inquiry, StoredUpload, UploadSession, UploadChunk]) {
    await (m as mongoose.Model<unknown>).createIndexes();
  }

  let created = 0;
  for (const c of SAMPLE_CONDOS) {
    const res = await Condo.updateOne({ slug: c.slug }, { $setOnInsert: { ...c, published: true } }, { upsert: true });
    created += res.upsertedCount;
  }
  log(`Condos: ${created} created, ${SAMPLE_CONDOS.length - created} already present.`);

  created = 0;
  const now = Date.now();
  for (const [i, p] of SAMPLE_POSTS.entries()) {
    const res = await Post.updateOne(
      { slug: p.slug },
      { $setOnInsert: { ...p, published: true, publishedAt: new Date(now - i * 86_400_000) } },
      { upsert: true },
    );
    created += res.upsertedCount;
  }
  log(`Market Insights: ${created} created, ${SAMPLE_POSTS.length - created} already present.`);

  for (const [key, data] of Object.entries(PAGE_DEFAULTS) as [PageKey, object][]) {
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
