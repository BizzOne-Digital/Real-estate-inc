import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Link-based pagination that preserves the current query string. */
export function Pagination({
  page,
  pages,
  basePath,
  params,
  variant = "site",
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
  variant?: "site" | "admin";
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  const base =
    variant === "site"
      ? "inline-flex h-10 min-w-10 items-center justify-center border px-3 font-sans text-sm transition-colors"
      : "inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(base, "border-line bg-white text-navy hover:border-navy")} aria-label="Previous page">
          <ChevronLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      ) : (
        <span className={cn(base, "border-line text-line")} aria-hidden>
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </span>
      )}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(base, n === page ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy")}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className={cn(base, "border-line bg-white text-navy hover:border-navy")} aria-label="Next page">
          <ChevronRight aria-hidden className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      ) : (
        <span className={cn(base, "border-line text-line")} aria-hidden>
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}
