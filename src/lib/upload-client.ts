// Browser-side upload helper used by admin image fields.

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Stay well under Vercel's ~4.5 MB request body limit; larger files are sent in chunks. */
const DIRECT_UPLOAD_LIMIT = 3.5 * 1024 * 1024;
const CHUNK_SIZE = 1024 * 1024;

export type UploadFolder = "condos" | "posts" | "pages" | "misc";

export interface UploadResult {
  success: true;
  url: string;
  filename: string;
  size: number;
  folder: UploadFolder;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP and GIF images are allowed.";
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "Images must be 8 MB or smaller.";
  return null;
}

/** Reads a response safely: JSON when possible, a readable message otherwise (e.g. a proxy's HTML error page). */
async function readResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    if (res.status === 413) return { success: false, error: "The file is too large for the server to accept." };
    if (res.status === 401) return { success: false, error: "Your session has expired. Please sign in again." };
    return { success: false, error: `Upload failed (HTTP ${res.status}).` };
  }
}

async function post(form: FormData): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: form, credentials: "same-origin" });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }
  const body = await readResponse(res);
  if (!res.ok || body.success !== true) throw new Error(String(body.error ?? `Upload failed (HTTP ${res.status}).`));
  return body;
}

function newUploadId() {
  const c = globalThis.crypto;
  // randomUUID is only available in secure contexts; getRandomValues works everywhere.
  if (typeof c.randomUUID === "function") return c.randomUUID();
  return Array.from(c.getRandomValues(new Uint8Array(16)), (b: number) => b.toString(16).padStart(2, "0")).join("");
}

export async function uploadImage(
  file: File,
  folder: UploadFolder,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  if (file.size <= DIRECT_UPLOAD_LIMIT) {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    onProgress?.(0.2);
    const body = await post(form);
    onProgress?.(1);
    return body as unknown as UploadResult;
  }

  // Chunked fallback for larger files.
  const uploadId = newUploadId();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let last: Record<string, unknown> = {};
  for (let i = 0; i < totalChunks; i++) {
    const blob = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
    const form = new FormData();
    form.append("file", blob, `chunk-${i}`);
    form.append("folder", folder);
    form.append("uploadId", uploadId);
    form.append("chunkIndex", String(i));
    form.append("totalChunks", String(totalChunks));
    form.append("totalSize", String(file.size));
    form.append("mimeType", file.type);
    try {
      last = await post(form);
    } catch (err) {
      // One retry per chunk; repeated chunks are handled idempotently on the server.
      last = await post(form).catch(() => {
        throw err;
      });
    }
    onProgress?.((i + 1) / totalChunks);
  }
  if (typeof last.url !== "string") throw new Error("Upload did not complete. Please try again.");
  return last as unknown as UploadResult;
}

/** Ask the server to discard an upload that was never saved. The server keeps it if anything references it. */
export function discardUpload(url: string) {
  if (!url.startsWith("/api/uploads/")) return;
  fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    credentials: "same-origin",
  }).catch(() => {
    /* orphan cleanup in Settings handles anything left behind */
  });
}
