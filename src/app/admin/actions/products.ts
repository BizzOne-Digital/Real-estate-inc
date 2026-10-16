"use server";

import { connectDB } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { productSchema, type ProductInput } from "@/lib/validation";

export async function saveProduct(id: string | null, input: ProductInput) {
  return guarded<{ id: string }>(async () => {
    const data = productSchema.parse(input);
    await connectDB();
    if (!(await Category.exists({ _id: data.category }))) throw new ActionError("Choose a valid category.");

    if (id) {
      assertObjectId(id);
      const before = await Product.findById(id, { images: 1 }).lean();
      if (!before) throw new ActionError("This product no longer exists.");
      await Product.updateOne({ _id: id }, { $set: data }, { runValidators: true });
      // Old images are removed only after the new references are safely saved.
      await cleanupReplacedUploads(before.images, data.images);
      revalidateContent();
      return { ok: true, data: { id }, message: "Product saved." };
    }
    const created = await Product.create(data);
    revalidateContent();
    return { ok: true, data: { id: String(created._id) }, message: "Product created." };
  });
}

export async function setProductPublished(id: string, published: boolean) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const res = await Product.updateOne({ _id: id }, { $set: { published: Boolean(published) } });
    if (res.matchedCount === 0) throw new ActionError("Product not found.");
    revalidateContent();
    return { ok: true, message: published ? "Product published." : "Product unpublished." };
  });
}

export async function deleteProduct(id: string) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const before = await Product.findByIdAndDelete(id).lean();
    if (!before) throw new ActionError("Product not found.");
    await cleanupReplacedUploads(before.images, []);
    revalidateContent();
    return { ok: true, message: "Product deleted." };
  });
}
