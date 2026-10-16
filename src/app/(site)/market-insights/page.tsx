import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/realestate/Cards";
import { Pagination } from "@/components/ui/Pagination";
import { POST_CATEGORIES } from "@/lib/constants";
import { listPosts } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Market Insights",
  description: "GTA real estate market commentary, local statistics and practical advice for home buyers and sellers.",
  alternates: { canonical: "/market-insights" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function InsightsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const requested = one(sp.category);
  const category = (POST_CATEGORIES as readonly string[]).includes(requested) ? requested : "";
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);
  const result = await listPosts({ category: category || undefined, page, perPage: 9 });

  return (
    <>
      <PageHeader
        eyebrow="Market Insights"
        title={category || "News, statistics & advice"}
        text="Market commentary, local transaction statistics and practical advice for buyers and sellers across Mississauga, Toronto and the GTA."
      />
      <section className="container-site py-12 lg:py-16">
        <nav aria-label="Filter by topic" className="mb-10 flex flex-wrap gap-2">
          {["", ...POST_CATEGORIES].map((c) => (
            <Link
              key={c || "all"}
              href={c ? `/market-insights?category=${encodeURIComponent(c)}` : "/market-insights"}
              aria-current={category === c ? "true" : undefined}
              className={cn(
                "border px-4 py-2 font-sans text-[13px] tracking-wide transition-colors",
                category === c ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy",
              )}
            >
              {c || "All topics"}
            </Link>
          ))}
        </nav>
        {result.items.length === 0 ? (
          <p className="border border-line bg-white px-6 py-16 text-center text-ink/75">
            No articles in this topic yet. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        )}
        <div className="mt-14">
          <Pagination page={result.page} pages={result.pages} basePath="/market-insights" params={{ category: category || undefined }} />
        </div>
      </section>
    </>
  );
}
