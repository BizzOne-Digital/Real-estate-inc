/**
 * One-off conversion of an existing database from the earlier furniture build to the real estate site.
 * - Drops the furniture collections (products, categories, gallery items).
 * - Replaces page content with the real estate defaults.
 * - Keeps contact details, social links, logo and sharing image from Settings.
 * - Then runs the normal idempotent seed (condos, articles).
 *
 *   npm run convert-to-real-estate -- --confirm
 */
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { PAGE_KEYS, PageContent, SiteSettings } from "../src/lib/models";
import { DEFAULT_SETTINGS, withDefaults } from "../src/lib/content-types";
import { PAGE_DEFAULTS } from "../src/lib/page-defaults";
import { seed } from "./seed";

const KEEP_SETTINGS = ["contactEmail", "contactPhone", "extraPhones", "contactAddress", "contactHours", "social", "logo", "ogImage"] as const;

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error("This replaces page content and removes furniture data. Re-run with --confirm to proceed.");
    process.exit(1);
  }
  await connectDB();
  const db = mongoose.connection.db!;
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  for (const name of ["products", "categories", "galleryitems"]) {
    if (existing.has(name)) {
      await db.dropCollection(name);
      console.log(`Dropped collection: ${name}`);
    }
  }

  const removed = await PageContent.deleteMany({ key: { $nin: [...PAGE_KEYS] } });
  console.log(`Removed ${removed.deletedCount} obsolete page document(s).`);
  for (const key of PAGE_KEYS) {
    await PageContent.updateOne({ key }, { $set: { data: PAGE_DEFAULTS[key] } }, { upsert: true });
    console.log(`Page "${key}" set to real estate content.`);
  }

  const current = (await SiteSettings.findOne({ key: "site" }).lean())?.data ?? {};
  const kept: Record<string, unknown> = {};
  for (const k of KEEP_SETTINGS) if (k in current) kept[k] = (current as Record<string, unknown>)[k];
  const data = withDefaults(DEFAULT_SETTINGS, kept);
  await SiteSettings.updateOne({ key: "site" }, { $set: { data } }, { upsert: true });
  console.log(`Settings updated (kept: ${Object.keys(kept).join(", ") || "none"}).`);

  await seed();
}

main()
  .then(() => console.log("Conversion complete."))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
