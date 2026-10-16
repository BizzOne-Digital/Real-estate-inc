import { AdminPageTitle } from "@/components/admin/AdminShell";
import { GalleryManager, type GalleryRow } from "@/components/admin/GalleryManager";
import { connectDB, plain } from "@/lib/db";
import { Category, GalleryItem } from "@/lib/models";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  await connectDB();
  const [docs, cats] = await Promise.all([
    GalleryItem.find().sort({ order: 1, createdAt: 1 }).lean(),
    Category.find({}, { name: 1 }).sort({ order: 1, name: 1 }).lean(),
  ]);
  const items = plain<{ _id: string; image: string; caption: string; alt: string; category: string | null }[]>(docs).map(
    (d): GalleryRow => ({ _id: d._id, image: d.image, caption: d.caption ?? "", alt: d.alt ?? "", category: d.category ? String(d.category) : null }),
  );
  return (
    <>
      <AdminPageTitle title="Gallery" description="Inspiration images shown on the public gallery page." />
      <GalleryManager items={items} categories={plain(cats)} />
    </>
  );
}
