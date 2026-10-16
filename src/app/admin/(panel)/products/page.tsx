import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Pagination } from "@/components/ui/Pagination";
import { SafeImage } from "@/components/ui/SafeImage";
import { connectDB, plain } from "@/lib/db";
import { Product } from "@/lib/models";
import type { ProductT } from "@/lib/types";
import { escapeRegex } from "@/lib/utils";

export const metadata = { title: "Products" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 15;

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = String(Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "")).trim().slice(0, 80);
  const status = String(Array.isArray(sp.status) ? sp.status[0] : (sp.status ?? ""));
  const requestedPage = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (q) filter.name = new RegExp(escapeRegex(q), "i");
  if (status === "published") filter.published = true;
  if (status === "draft") filter.published = false;
  const total = await Product.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(requestedPage, pages);
  const items = plain<ProductT[]>(
    await Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .populate("category", "name slug")
      .lean(),
  );

  return (
    <>
      <AdminPageTitle
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/products/new" className="admin-btn">
            <Plus aria-hidden className="h-4 w-4" /> New product
          </Link>
        }
      />

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <label htmlFor="q" className="sr-only">
            Search products
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by name" className="field-input pl-9" />
        </div>
        <label htmlFor="status" className="sr-only">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className="field-input sm:w-44">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Unpublished</option>
        </select>
        <button type="submit" className="admin-btn-ghost">
          Filter
        </button>
      </form>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                      <SafeImage src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p._id}`} className="font-medium text-gray-900 hover:underline">
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-gray-500">
                        /{p.slug}
                        {p.featured && <span className="ml-2 rounded bg-mist px-1.5 py-0.5 text-navy">Featured</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.published
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                    }
                  >
                    {p.published ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductRowActions id={p._id} name={p.name} slug={p.slug} published={p.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Pagination variant="admin" page={page} pages={pages} basePath="/admin/products" params={{ q: q || undefined, status: status || undefined }} />
      </div>
    </>
  );
}
