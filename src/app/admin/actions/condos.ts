"use server";

import { connectDB } from "@/lib/db";
import { Condo } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { condoSchema, type CondoInput } from "@/lib/validation";

export async function saveCondo(id: string | null, input: CondoInput) {
  return guarded<{ id: string }>(async () => {
    const data = condoSchema.parse(input);
    await connectDB();
    if (id) {
      assertObjectId(id);
      const before = await Condo.findById(id, { images: 1 }).lean();
      if (!before) throw new ActionError("This condo page no longer exists.");
      await Condo.updateOne({ _id: id }, { $set: data }, { runValidators: true });
      // Old images are removed only after the new references are safely saved.
      await cleanupReplacedUploads(before.images, data.images);
      revalidateContent();
      return { ok: true, data: { id }, message: "Condo page saved." };
    }
    const created = await Condo.create(data);
    revalidateContent();
    return { ok: true, data: { id: String(created._id) }, message: "Condo page created." };
  });
}

export async function setCondoPublished(id: string, published: boolean) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const res = await Condo.updateOne({ _id: id }, { $set: { published: Boolean(published) } });
    if (res.matchedCount === 0) throw new ActionError("Condo page not found.");
    revalidateContent();
    return { ok: true, message: published ? "Condo page published." : "Condo page unpublished." };
  });
}

export async function deleteCondo(id: string) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const before = await Condo.findByIdAndDelete(id).lean();
    if (!before) throw new ActionError("Condo page not found.");
    await cleanupReplacedUploads(before.images, []);
    revalidateContent();
    return { ok: true, message: "Condo page deleted." };
  });
}
