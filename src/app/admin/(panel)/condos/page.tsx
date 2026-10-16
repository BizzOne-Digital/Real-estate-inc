import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { RowActions } from "@/components/admin/RowActions";
import { Pagination } from "@/components/ui/Pagination";
import { SafeImage } from "@/components/ui/SafeImage";
import { connectDB, plain } from "@/lib/db";
import { Condo } from "@/lib/models";
import type { CondoT } from "@/lib/types";
import { escapeRegex } from "@/lib/utils";

export const metadata = { title: "Condos" };

const PER_PAGE = 15;

export default async function AdminCondosPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  await connectDB();
  const rx = new RegExp(escapeRegex(q), "i");
  const filter = q ? { $or: [{ name: rx }, { address: rx }] } : {};
  const total = await Condo.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1), pages);
  const items = plain<CondoT[]>(
    await Condo.find(filter, { description: 0 })
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .lean(),
  );

  return (
    <>
      <AdminPageTitle
        title="Condos"
        description={`${total} condo page${total === 1 ? "" : "s"}. Each building gets its own page on the website.`}
        actions={
          <Link href="/admin/condos/new" className="admin-btn">
            <Plus aria-hidden className="h-4 w-4" /> New condo page
          </Link>
        }
      />
      <form className="mb-4 flex gap-2" role="search">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <label htmlFor="q" className="sr-only">
            Search condos
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by name or address" className="field-input pl-9" />
        </div>
        <button type="submit" className="admin-btn-ghost">
          Search
        </button>
      </form>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Building</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No condo pages yet.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                      <SafeImage src={c.images[0]} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/condos/${c._id}`} className="font-medium text-gray-900 hover:underline">
                        {c.name}
                      </Link>
                      <p className="truncate text-xs text-gray-500">
                        {c.address || `/${c.slug}`}
                        {c.featured && <span className="ml-2 rounded bg-mist px-1.5 py-0.5 text-navy">Featured</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.city || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      c.published
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                    }
                  >
                    {c.published ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RowActions kind="condo" id={c._id} name={c.name} slug={c.slug} published={c.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Pagination variant="admin" page={page} pages={pages} basePath="/admin/condos" params={{ q: q || undefined }} />
      </div>
    </>
  );
}
