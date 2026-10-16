import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { connectDB, plain } from "@/lib/db";
import { Category, Product } from "@/lib/models";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  await connectDB();
  const [doc, cats] = await Promise.all([Product.findById(id).lean(), Category.find({}, { name: 1 }).sort({ order: 1, name: 1 }).lean()]);
  if (!doc) notFound();
  const p = plain<{
    name: string;
    slug: string;
    category: string;
    description: string;
    price: number | null;
    materials: string[];
    dimensions: string;
    finishes: string[];
    images: string[];
    featured: boolean;
    published: boolean;
  }>(doc);

  return (
    <>
      <AdminPageTitle title={`Edit: ${p.name}`} />
      <ProductForm
        id={id}
        categories={plain(cats)}
        initial={{
          name: p.name,
          slug: p.slug,
          category: String(p.category ?? ""),
          description: p.description ?? "",
          price: p.price === null || p.price === undefined ? "" : String(p.price),
          materials: (p.materials ?? []).join(", "),
          dimensions: p.dimensions ?? "",
          finishes: (p.finishes ?? []).join(", "),
          images: p.images ?? [],
          featured: Boolean(p.featured),
          published: Boolean(p.published),
        }}
      />
    </>
  );
}
