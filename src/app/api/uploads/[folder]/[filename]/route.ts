import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { isUploadFolder, isValidStoredFilename, toBuffer } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STREAM_CHUNK = 256 * 1024;

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}

function safeDecode(v: string): string | null {
  try {
    return decodeURIComponent(v);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder: rawFolder, filename: rawName } = await ctx.params;
  const folder = safeDecode(rawFolder);
  const filename = safeDecode(rawName);
  if (!folder || !filename || !isUploadFolder(folder)) return notFound();
  // Strict allow-list pattern also rejects '..', '/', '\\' and any other traversal attempt.
  if (filename.includes("..") || /[\\/]/.test(filename) || !isValidStoredFilename(filename)) return notFound();

  await connectDB();
  const doc = await StoredUpload.findOne({ folder, filename }).select("+data").lean();
  if (!doc) return notFound();

  const bytes = toBuffer(doc.data);
  let offset = 0;
  // Stream the binary in slices instead of one large buffered body.
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close();
        return;
      }
      const end = Math.min(offset + STREAM_CHUNK, bytes.length);
      controller.enqueue(new Uint8Array(bytes.subarray(offset, end)));
      offset = end;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      ETag: `"${filename}"`,
    },
  });
}
