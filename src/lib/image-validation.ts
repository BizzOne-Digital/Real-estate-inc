// Pure image validation helpers (no server-only imports) shared by API routes and CLI scripts.
import { UPLOAD_FOLDERS, type UploadFolder } from "./models/StoredUpload";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const UPLOAD_URL_PREFIX = "/api/uploads/";

export const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const FILENAME_RE = /^\d{10,16}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;

export class UploadError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function isUploadFolder(v: unknown): v is UploadFolder {
  return typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);
}

export function isValidStoredFilename(name: string): boolean {
  return FILENAME_RE.test(name);
}

/** Identify an image by its magic bytes. Returns null when the bytes are not a supported image. */
export function sniffImageMime(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  )
    return "image/png";
  const ascii = (s: number, e: number) => String.fromCharCode(...buf.subarray(s, e));
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

/** Validate declared MIME + actual signature + size. Returns the trusted MIME type. */
export function validateImage(buf: Uint8Array, declaredMime: string): string {
  if (buf.length === 0) throw new UploadError("The file is empty.");
  if (buf.length > MAX_UPLOAD_BYTES) throw new UploadError("The file exceeds the 8 MB limit.", 413);
  const declared = declaredMime.toLowerCase();
  if (!MIME_EXT[declared]) throw new UploadError("Only JPEG, PNG, WebP and GIF images are allowed.", 415);
  const actual = sniffImageMime(buf);
  if (!actual) throw new UploadError("The file is not a valid image.", 415);
  if (actual !== declared) throw new UploadError("The file contents do not match its declared type.", 415);
  return actual;
}
