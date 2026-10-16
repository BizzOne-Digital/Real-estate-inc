/**
 * Import the original logo and founder portrait into persistent MongoDB media storage and
 * point the site at them. Existing admin choices are kept unless --force is passed.
 *
 *   npm run import-assets -- --logo ./path/to/logo.png --founder ./path/to/founder.jpg
 *   (defaults: public/brand/logo.png and public/brand/founder.jpg)
 */
import { randomBytes } from "crypto";
import { readFile } from "fs/promises";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { PageContent, SiteSettings, StoredUpload, type UploadFolder } from "../src/lib/models";
import { MIME_EXT, sniffImageMime, validateImage } from "../src/lib/image-validation";

function arg(name: string, fallback: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function store(path: string, folder: UploadFolder): Promise<string> {
  const buf = await readFile(path);
  const mime = sniffImageMime(buf);
  if (!mime) throw new Error(`${path} is not a JPEG, PNG, WebP or GIF image.`);
  validateImage(buf, mime);
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${MIME_EXT[mime]}`;
  await StoredUpload.create({ folder, filename, mimeType: mime, size: buf.length, data: buf });
  return `/api/uploads/${folder}/${filename}`;
}

/** Only replace values that are still the bundled defaults, unless forced. */
const replaceable = (current: unknown, force: boolean) =>
  force || !current || (typeof current === "string" && current.startsWith("/brand/"));

async function main() {
  const force = process.argv.includes("--force");
  const logoPath = arg("logo", "public/brand/logo.png");
  const founderPath = arg("founder", "public/brand/founder.jpg");
  await connectDB();

  const settings = await SiteSettings.findOne({ key: "site" }).lean();
  const sData = (settings?.data ?? {}) as Record<string, unknown>;
  if (replaceable(sData.logo, force)) {
    const url = await store(logoPath, "misc");
    await SiteSettings.updateOne({ key: "site" }, { $set: { "data.logo": url } }, { upsert: true });
    console.log(`Logo imported: ${url}`);
  } else {
    console.log("Logo already customised in admin, skipped (use --force to replace).");
  }

  let founderUrl: string | null = null;
  for (const key of ["home", "about"] as const) {
    const page = await PageContent.findOne({ key }).lean();
    const data = (page?.data ?? {}) as Record<string, unknown>;
    if (replaceable(data.founderImage, force)) {
      founderUrl ??= await store(founderPath, "pages");
      await PageContent.updateOne({ key }, { $set: { "data.founderImage": founderUrl } }, { upsert: true });
      console.log(`Founder portrait set on "${key}" page: ${founderUrl}`);
    } else {
      console.log(`Founder portrait on "${key}" already customised, skipped.`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
