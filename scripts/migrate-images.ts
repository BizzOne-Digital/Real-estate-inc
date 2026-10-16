/**
 * Replace the original sample Unsplash URLs stored in MongoDB with the bundled images in
 * public/images. Admin uploads (/api/uploads/...) and any other custom URLs are left as-is.
 *
 *   npm run migrate-images
 */
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { resolveBundledImages, resolveImageSrc } from "../src/lib/generated-images";
import { Category, GalleryItem, PageContent, Product, SiteSettings } from "../src/lib/models";

async function main() {
  await connectDB();
  let changed = 0;

  for (const p of await Product.find({}, { images: 1 }).lean()) {
    const images = (p.images ?? []).map(resolveImageSrc);
    if (JSON.stringify(images) !== JSON.stringify(p.images)) {
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      changed++;
    }
  }
  for (const c of await Category.find({}, { image: 1 }).lean()) {
    const image = resolveImageSrc(c.image ?? "");
    if (image !== c.image) {
      await Category.updateOne({ _id: c._id }, { $set: { image } });
      changed++;
    }
  }
  for (const g of await GalleryItem.find({}, { image: 1 }).lean()) {
    const image = resolveImageSrc(g.image);
    if (image !== g.image) {
      await GalleryItem.updateOne({ _id: g._id }, { $set: { image } });
      changed++;
    }
  }
  for (const Model of [PageContent, SiteSettings] as const) {
    for (const d of await (Model as typeof PageContent).find({}, { data: 1 }).lean()) {
      const data = resolveBundledImages(d.data);
      if (JSON.stringify(data) !== JSON.stringify(d.data)) {
        await (Model as typeof PageContent).updateOne({ _id: d._id }, { $set: { data } });
        changed++;
      }
    }
  }
  console.log(`Updated ${changed} document(s) to use bundled images.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
