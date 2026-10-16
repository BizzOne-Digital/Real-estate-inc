import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { RowActions } from "@/components/admin/RowActions";
import { Pagination } from "@/components/ui/Pagination";
import { connectDB, plain } from "@/lib/db";
import { Post } from "@/lib/models";
import type { PostT } from "@/lib/types";
import { escapeRegex, formatDate } from "@/lib/utils";

export const metadata = { title: "Market Insights" };

const PER_PAGE = 20;

/** Published articles with a future date are scheduled and stay hidden until that day. */
function isScheduled(p: PostT) {
  return p.published && new Date(p.publishedAt).getTime() > Date.now();
}

export default async function AdminInsightsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  await connectDB();
  const filter = q ? { title: new RegExp(escapeRegex(q), "i") } : {};
  const total = await Post.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1), pages);
  const items = plain<PostT[]>(
    await Post.find(filter, { body: 0 })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .lean(),
  );

  return (
    <>
      <AdminPageTitle
        title="Market Insights"
        description="Blog articles: market commentary, statistics and advice for buyers and sellers."
        actions={
          <Link href="/admin/insights/new" className="admin-btn">
            <Plus aria-hidden className="h-4 w-4" /> New article
          </Link>
        }
      />
      <form className="mb-4 flex gap-2" role="search">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <label htmlFor="q" className="sr-only">
            Search articles
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by title" className="field-input pl-9" />
        </div>
        <button type="submit" className="admin-btn-ghost">
          Search
        </button>
      </form>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No articles yet.
                </td>
              </tr>
            )}
            {items.map((p) => {
              const scheduled = isScheduled(p);
              return (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/insights/${p._id}`} className="font-medium text-gray-900 hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDate(p.publishedAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        scheduled
                          ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                          : p.published
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                      }
                    >
                      {scheduled ? "Scheduled" : p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions kind="post" id={p._id} name={p.title} slug={p.slug} published={p.published} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Pagination variant="admin" page={page} pages={pages} basePath="/admin/insights" params={{ q: q || undefined }} />
      </div>
    </>
  );
}
