"use server";

import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { postSchema, type PostInput } from "@/lib/validation";

export async function savePost(id: string | null, input: PostInput) {
  return guarded<{ id: string }>(async () => {
    const data = postSchema.parse(input);
    await connectDB();
    if (id) {
      assertObjectId(id);
      const before = await Post.findById(id, { coverImage: 1 }).lean();
      if (!before) throw new ActionError("This article no longer exists.");
      await Post.updateOne({ _id: id }, { $set: data }, { runValidators: true });
      await cleanupReplacedUploads(before.coverImage, data.coverImage);
      revalidateContent();
      return { ok: true, data: { id }, message: "Article saved." };
    }
    const created = await Post.create(data);
    revalidateContent();
    return { ok: true, data: { id: String(created._id) }, message: "Article created." };
  });
}

export async function setPostPublished(id: string, published: boolean) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const res = await Post.updateOne({ _id: id }, { $set: { published: Boolean(published) } });
    if (res.matchedCount === 0) throw new ActionError("Article not found.");
    revalidateContent();
    return { ok: true, message: published ? "Article published." : "Article unpublished." };
  });
}

export async function deletePost(id: string) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const before = await Post.findByIdAndDelete(id).lean();
    if (!before) throw new ActionError("Article not found.");
    await cleanupReplacedUploads(before.coverImage, "");
    revalidateContent();
    return { ok: true, message: "Article deleted." };
  });
}
