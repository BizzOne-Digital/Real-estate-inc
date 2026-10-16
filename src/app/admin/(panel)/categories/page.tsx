import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { CategoryDeleteButton } from "@/components/admin/CategoryDeleteButton";
import { SafeImage } from "@/components/ui/SafeImage";
import { connectDB, plain } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import type { CategoryT } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await connectDB();
  const [cats, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const categories = plain<CategoryT[]>(cats);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  return (
    <>
      <AdminPageTitle
        title="Categories"
        description="Collections shown on the homepage and catalog filters."
        actions={
          <Link href="/admin/categories/new" className="admin-btn">
            <Plus aria-hidden className="h-4 w-4" /> New category
          </Link>
        }
      />
      <div className="admin-card divide-y divide-gray-100">
        {categories.length === 0 && <p className="px-5 py-10 text-center text-sm text-gray-500">No categories yet.</p>}
        {categories.map((c) => (
          <div key={c._id} className="flex items-center gap-4 px-4 py-3">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
              <SafeImage src={c.image} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/categories/${c._id}`} className="font-medium hover:underline">
                {c.name}
              </Link>
              <p className="text-xs text-gray-500">
                /{c.slug} · {countMap.get(c._id) ?? 0} products · order {c.order}
                {c.showOnHome && " · on homepage"}
              </p>
            </div>
            <Link href={`/admin/categories/${c._id}`} className="rounded p-2 text-gray-600 hover:bg-gray-100" aria-label={`Edit ${c.name}`}>
              <Pencil aria-hidden className="h-4 w-4" />
            </Link>
            <CategoryDeleteButton
              id={c._id}
              name={c.name}
              productCount={countMap.get(c._id) ?? 0}
              others={categories.filter((o) => o._id !== c._id).map((o) => ({ _id: o._id, name: o.name }))}
            />
          </div>
        ))}
      </div>
    </>
  );
}
