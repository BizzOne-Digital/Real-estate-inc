import { NextResponse } from "next/server";
import { AuthError, isSameOrigin, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UploadChunk, UploadSession } from "@/lib/models";
import {
  MAX_UPLOAD_BYTES,
  MIME_EXT,
  UploadError,
  deleteUploadIfUnreferenced,
  isUploadFolder,
  parseUploadUrl,
  sniffImageMime,
  storeImage,
  toBuffer,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
const MAX_CHUNKS = 16;
const UPLOAD_SESSION_TTL_MS = 60 * 60 * 1000;
const UPLOAD_ID_RE = /^[a-zA-Z0-9-]{16,64}$/;

function jsonError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function toInt(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || !/^\d{1,10}$/.test(v)) return null;
  return Number(v);
}

async function guard(req: Request) {
  if (!isSameOrigin(req)) throw new UploadError("Cross-site request rejected.", 403);
  try {
    return await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) throw new UploadError("Authentication required.", 401);
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const admin = await guard(req);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return jsonError("Expected multipart form data.", 400);
    }

    const folder = form.get("folder");
    if (!isUploadFolder(folder)) return jsonError("Invalid upload folder.", 400);
    const file = form.get("file");
    if (!(file instanceof Blob)) return jsonError("No file was provided.", 400);

    const uploadId = form.get("uploadId");
    if (uploadId === null) {
      // Standard single-request upload.
      if (file.size === 0) return jsonError("The file is empty.", 400);
      if (file.size > MAX_UPLOAD_BYTES) return jsonError("The file exceeds the 8 MB limit.", 413);
      const buf = Buffer.from(await file.arrayBuffer());
      const result = await storeImage(folder, buf, file.type);
      return NextResponse.json(result, { status: 201 });
    }

    // ---- Chunked upload ----
    if (typeof uploadId !== "string" || !UPLOAD_ID_RE.test(uploadId)) return jsonError("Invalid upload id.", 400);
    const chunkIndex = toInt(form.get("chunkIndex"));
    const totalChunks = toInt(form.get("totalChunks"));
    const totalSize = toInt(form.get("totalSize"));
    const mimeType = String(form.get("mimeType") ?? "").toLowerCase();
    if (totalChunks === null || totalChunks < 1 || totalChunks > MAX_CHUNKS)
      return jsonError("Invalid chunk count.", 400);
    if (chunkIndex === null || chunkIndex >= totalChunks) return jsonError("Invalid chunk index.", 400);
    if (totalSize === null || totalSize < 1) return jsonError("Invalid total size.", 400);
    if (totalSize > MAX_UPLOAD_BYTES) return jsonError("The file exceeds the 8 MB limit.", 413);
    if (!MIME_EXT[mimeType]) return jsonError("Only JPEG, PNG, WebP and GIF images are allowed.", 415);
    if (file.size === 0 || file.size > MAX_CHUNK_BYTES) return jsonError("Invalid chunk size.", 400);

    const data = Buffer.from(await file.arrayBuffer());
    if (chunkIndex === 0 && sniffImageMime(data) !== mimeType)
      return jsonError("The file contents do not match its declared type.", 415);

    await connectDB();
    const expiresAt = new Date(Date.now() + UPLOAD_SESSION_TTL_MS);
    let session = await UploadSession.findOne({ uploadId }).lean();
    if (!session) {
      try {
        await UploadSession.create({ uploadId, admin: admin.id, folder, mimeType, totalSize, totalChunks, expiresAt });
      } catch (err) {
        if ((err as { code?: number }).code !== 11000) throw err; // concurrent creation is fine
      }
      session = await UploadSession.findOne({ uploadId }).lean();
    }
    if (!session || String(session.admin) !== admin.id) return jsonError("Upload session not found.", 404);
    if (
      session.folder !== folder ||
      session.mimeType !== mimeType ||
      session.totalSize !== totalSize ||
      session.totalChunks !== totalChunks
    )
      return jsonError("Chunk does not match its upload session.", 409);
    if (session.status !== "uploading") return jsonError("Upload is already being finalized.", 409);

    // Upsert makes retried chunks idempotent.
    await UploadChunk.updateOne(
      { uploadId, chunkIndex },
      { $set: { data, size: data.length, expiresAt } },
      { upsert: true },
    );
    const chunkStats = await UploadChunk.aggregate<{ count: number; bytes: number }>([
      { $match: { uploadId } },
      { $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: "$size" } } },
    ]);
    const { count = 0, bytes = 0 } = chunkStats[0] ?? {};
    if (bytes > totalSize) {
      await Promise.all([UploadChunk.deleteMany({ uploadId }), UploadSession.deleteOne({ uploadId })]);
      return jsonError("Uploaded data exceeds the declared size.", 413);
    }
    if (count < totalChunks) {
      return NextResponse.json({ success: true, complete: false, received: count, totalChunks });
    }

    // All chunks present: claim finalization atomically so it only happens once.
    const claimed = await UploadSession.findOneAndUpdate(
      { uploadId, status: "uploading" },
      { $set: { status: "finalizing" } },
    );
    if (!claimed) return jsonError("Upload is already being finalized.", 409);
    try {
      const chunks = await UploadChunk.find({ uploadId }).sort({ chunkIndex: 1 }).lean();
      if (chunks.length !== totalChunks || chunks.some((c, i) => c.chunkIndex !== i))
        throw new UploadError("Upload is incomplete.", 400);
      const assembled = Buffer.concat(chunks.map((c) => toBuffer(c.data)));
      if (assembled.length !== totalSize) throw new UploadError("Assembled size does not match.", 400);
      const result = await storeImage(folder, assembled, mimeType);
      return NextResponse.json(result, { status: 201 });
    } finally {
      await Promise.all([UploadChunk.deleteMany({ uploadId }), UploadSession.deleteOne({ uploadId })]);
    }
  } catch (err) {
    if (err instanceof UploadError) return jsonError(err.message, err.status);
    console.error("[upload] failed", err);
    return jsonError("Upload failed. Please try again.", 500);
  }
}

/** Remove an upload the admin no longer needs. Only deletes when nothing references it. */
export async function DELETE(req: Request) {
  try {
    await guard(req);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Expected JSON body.", 400);
    }
    const url = (body as { url?: unknown })?.url;
    if (!parseUploadUrl(url)) return jsonError("Not an owned upload URL.", 400);
    const deleted = await deleteUploadIfUnreferenced(url as string);
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    if (err instanceof UploadError) return jsonError(err.message, err.status);
    console.error("[upload] delete failed", err);
    return jsonError("Delete failed.", 500);
  }
}

