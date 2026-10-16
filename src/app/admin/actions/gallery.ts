"use server";

import { connectDB } from "@/lib/db";
import { Category, GalleryItem } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { galleryItemSchema, type GalleryItemInput } from "@/lib/validation";

async function checkCategory(category: string | null) {
  if (category && !(await Category.exists({ _id: category }))) throw new ActionError("Choose a valid category.");
}

export async function createGalleryItem(input: GalleryItemInput) {
  return guarded<{ id: string }>(async () => {
    const data = galleryItemSchema.parse(input);
    await connectDB();
    await checkCategory(data.category);
    const last = await GalleryItem.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
    const created = await GalleryItem.create({ ...data, order: (last?.order ?? -1) + 1 });
    revalidateContent();
    return { ok: true, data: { id: String(created._id) }, message: "Image added to gallery." };
  });
}

export async function updateGalleryItem(id: string, input: GalleryItemInput) {
  return guarded(async () => {
    assertObjectId(id);
    const data = galleryItemSchema.parse(input);
    await connectDB();
    await checkCategory(data.category);
    const before = await GalleryItem.findById(id, { image: 1 }).lean();
    if (!before) throw new ActionError("Gallery item not found.");
    await GalleryItem.updateOne({ _id: id }, { $set: data }, { runValidators: true });
    await cleanupReplacedUploads(before.image, data.image);
    revalidateContent();
    return { ok: true, message: "Gallery item saved." };
  });
}

export async function deleteGalleryItem(id: string) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const before = await GalleryItem.findByIdAndDelete(id).lean();
    if (!before) throw new ActionError("Gallery item not found.");
    await cleanupReplacedUploads(before.image, "");
    revalidateContent();
    return { ok: true, message: "Gallery item removed." };
  });
}

/** Persist a full ordering (array of ids, first = top). */
export async function reorderGallery(ids: string[]) {
  return guarded(async () => {
    if (!Array.isArray(ids) || ids.length > 1000) throw new ActionError("Invalid order.");
    ids.forEach(assertObjectId);
    await connectDB();
    const count = await GalleryItem.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) throw new ActionError("The gallery changed. Refresh and try again.");
    await GalleryItem.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
    revalidateContent();
    return { ok: true, message: "Order saved." };
  });
}
