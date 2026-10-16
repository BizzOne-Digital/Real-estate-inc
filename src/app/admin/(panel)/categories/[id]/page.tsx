import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { connectDB, plain } from "@/lib/db";
import { Category } from "@/lib/models";
import type { CategoryT } from "@/lib/types";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  await connectDB();
  const doc = await Category.findById(id).lean();
  if (!doc) notFound();
  const c = plain<CategoryT>(doc);
  return (
    <>
      <AdminPageTitle title={`Edit: ${c.name}`} />
      <CategoryForm
        id={id}
        initial={{
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          image: c.image ?? "",
          order: c.order ?? 0,
          showOnHome: Boolean(c.showOnHome),
        }}
      />
    </>
  );
}
