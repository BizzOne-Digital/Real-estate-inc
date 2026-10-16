import "server-only";
import { randomBytes } from "crypto";
import { connectDB } from "./db";
import {
  Condo,
  PageContent,
  Post,
  SiteSettings,
  StoredUpload,
  type UploadFolder,
} from "./models";

export {
  MAX_UPLOAD_BYTES,
  UPLOAD_URL_PREFIX,
  MIME_EXT,
  UploadError,
  isUploadFolder,
  isValidStoredFilename,
  sniffImageMime,
  validateImage,
} from "./image-validation";
import { MIME_EXT, UPLOAD_URL_PREFIX, UploadError, isUploadFolder, isValidStoredFilename, validateImage } from "./image-validation";

export interface StoredUploadResult {
  success: true;
  url: string;
  filename: string;
  size: number;
  folder: UploadFolder;
}

export async function storeImage(folder: UploadFolder, buf: Buffer, declaredMime: string): Promise<StoredUploadResult> {
  const mime = validateImage(buf, declaredMime);
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${MIME_EXT[mime]}`;
  await connectDB();
  await StoredUpload.create({ folder, filename, mimeType: mime, size: buf.length, data: buf });
  return { success: true, url: `${UPLOAD_URL_PREFIX}${folder}/${filename}`, filename, size: buf.length, folder };
}

/** Parse an owned upload URL. Returns null for anything that is not a well-formed /api/uploads/ path. */
export function parseUploadUrl(url: unknown): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith(UPLOAD_URL_PREFIX)) return null;
  const rest = url.slice(UPLOAD_URL_PREFIX.length);
  const parts = rest.split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isUploadFolder(folder) || !isValidStoredFilename(filename)) return null;
  return { folder, filename };
}

/** Collect every owned upload URL found anywhere within a value. */
export function collectUploadUrls(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (parseUploadUrl(value)) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploadUrls(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectUploadUrls(v, out));
  }
  return out;
}

/** All upload URLs currently referenced by any content document. */
export async function referencedUploadUrls(): Promise<Set<string>> {
  await connectDB();
  const refs = new Set<string>();
  const [condos, posts, pages, settings] = await Promise.all([
    Condo.find({}, { images: 1 }).lean(),
    Post.find({}, { coverImage: 1 }).lean(),
    PageContent.find({}, { data: 1 }).lean(),
    SiteSettings.find({}, { data: 1 }).lean(),
  ]);
  condos.forEach((c) => collectUploadUrls(c.images, refs));
  posts.forEach((p) => collectUploadUrls(p.coverImage, refs));
  pages.forEach((p) => collectUploadUrls(p.data, refs));
  settings.forEach((s) => collectUploadUrls(s.data, refs));
  return refs;
}

export async function isUploadReferenced(url: string): Promise<boolean> {
  await connectDB();
  const [condo, post] = await Promise.all([Condo.exists({ images: url }), Post.exists({ coverImage: url })]);
  if (condo || post) return true;
  const [pages, settings] = await Promise.all([
    PageContent.find({}, { data: 1 }).lean(),
    SiteSettings.find({}, { data: 1 }).lean(),
  ]);
  return [...pages, ...settings].some((d) => collectUploadUrls(d.data).has(url));
}

/** Delete an owned upload, but only when no document references it anymore. External URLs are ignored. */
export async function deleteUploadIfUnreferenced(url: string): Promise<boolean> {
  const parsed = parseUploadUrl(url);
  if (!parsed) return false;
  if (await isUploadReferenced(url)) return false;
  const res = await StoredUpload.deleteOne({ folder: parsed.folder, filename: parsed.filename });
  return res.deletedCount === 1;
}

/**
 * Call after the owning document has been saved: removes uploads that were in the old
 * version but not in the new one (and are not used elsewhere). Failures never break the save.
 */
export async function cleanupReplacedUploads(before: unknown, after: unknown): Promise<void> {
  const oldUrls = collectUploadUrls(before);
  const newUrls = collectUploadUrls(after);
  for (const url of oldUrls) {
    if (newUrls.has(url)) continue;
    try {
      await deleteUploadIfUnreferenced(url);
    } catch (err) {
      console.error("[uploads] cleanup failed for", url, err);
    }
  }
}

/** Remove uploads that are not referenced anywhere and are older than the grace period. */
export async function cleanupOrphanUploads(graceMs = 24 * 60 * 60 * 1000): Promise<number> {
  await connectDB();
  const refs = await referencedUploadUrls();
  const cutoff = new Date(Date.now() - graceMs);
  const candidates = await StoredUpload.find({ createdAt: { $lt: cutoff } }, { folder: 1, filename: 1 }).lean();
  const orphanIds = candidates
    .filter((u) => !refs.has(`${UPLOAD_URL_PREFIX}${u.folder}/${u.filename}`))
    .map((u) => u._id);
  if (orphanIds.length === 0) return 0;
  const res = await StoredUpload.deleteMany({ _id: { $in: orphanIds } });
  return res.deletedCount ?? 0;
}

/** Normalise Mongoose/BSON binary values (Buffer or Binary) into a Node Buffer. */
export function toBuffer(v: unknown): Buffer {
  if (Buffer.isBuffer(v)) return v;
  const b = v as { buffer?: ArrayBufferLike | Uint8Array } | null;
  if (b?.buffer instanceof Uint8Array) return Buffer.from(b.buffer.buffer, b.buffer.byteOffset, b.buffer.byteLength);
  if (b?.buffer) return Buffer.from(b.buffer as ArrayBuffer);
  if (v instanceof Uint8Array) return Buffer.from(v.buffer, v.byteOffset, v.byteLength);
  throw new UploadError('Corrupt binary data.', 500);
}
