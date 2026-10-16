import { AdminPageTitle } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { connectDB, plain } from "@/lib/db";
import { Category } from "@/lib/models";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await connectDB();
  const categories = plain<{ _id: string; name: string }[]>(await Category.find({}, { name: 1 }).sort({ order: 1, name: 1 }).lean());
  return (
    <>
      <AdminPageTitle title="New product" />
      <ProductForm
        id={null}
        categories={categories}
        initial={{
          name: "",
          slug: "",
          category: categories[0]?._id ?? "",
          description: "",
          price: "",
          materials: "",
          dimensions: "",
          finishes: "",
          images: [],
          featured: false,
          published: true,
        }}
      />
    </>
  );
}
