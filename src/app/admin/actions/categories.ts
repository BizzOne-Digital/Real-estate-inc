"use server";

import { connectDB } from "@/lib/db";
import { Category, GalleryItem, Product } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { categorySchema, type CategoryInput } from "@/lib/validation";

export async function saveCategory(id: string | null, input: CategoryInput) {
  return guarded<{ id: string }>(async () => {
    const data = categorySchema.parse(input);
    await connectDB();
    if (id) {
      assertObjectId(id);
      const before = await Category.findById(id, { image: 1 }).lean();
      if (!before) throw new ActionError("This category no longer exists.");
      await Category.updateOne({ _id: id }, { $set: data }, { runValidators: true });
      await cleanupReplacedUploads(before.image, data.image);
      revalidateContent();
      return { ok: true, data: { id }, message: "Category saved." };
    }
    const created = await Category.create(data);
    revalidateContent();
    return { ok: true, data: { id: String(created._id) }, message: "Category created." };
  });
}

/**
 * Deleting a category that still has products requires choosing a category to move them to,
 * so products are never left without a category.
 */
export async function deleteCategory(id: string, reassignTo?: string | null) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) throw new ActionError("Category not found.");
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      if (!reassignTo) {
        throw new ActionError(
          `${productCount} product${productCount === 1 ? " uses" : "s use"} this category. Choose another category to move them to before deleting.`,
        );
      }
      assertObjectId(reassignTo);
      if (reassignTo === id) throw new ActionError("Choose a different category for reassignment.");
      if (!(await Category.exists({ _id: reassignTo }))) throw new ActionError("Reassignment category not found.");
      await Product.updateMany({ category: id }, { $set: { category: reassignTo } });
    }
    await GalleryItem.updateMany({ category: id }, { $set: { category: null } });
    await Category.deleteOne({ _id: id });
    await cleanupReplacedUploads(category.image, "");
    revalidateContent();
    return { ok: true, message: "Category deleted." };
  });
}
