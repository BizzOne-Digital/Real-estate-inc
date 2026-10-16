import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { connectDB, plain } from "@/lib/db";
import { Inquiry } from "@/lib/models";
import type { InquiryT } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inquiries" };
const PER_PAGE = 20;
const FILTERS = ["", "new", "read", "resolved"] as const;

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? (sp.status ?? "") : "";
  await connectDB();
  const filter = status ? { status } : {};
  const [total, counts] = await Promise.all([
    Inquiry.countDocuments(filter),
    Inquiry.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1), pages);
  const items = plain<InquiryT[]>(
    await Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).lean(),
  );
  const countOf = (s: string) => (s ? (counts.find((c) => c._id === s)?.n ?? 0) : counts.reduce((a, c) => a + c.n, 0));

  return (
    <>
      <AdminPageTitle title="Inquiries" description="Messages submitted through the contact page." />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f || "all"}
            href={f ? `/admin/inquiries?status=${f}` : "/admin/inquiries"}
            className={cn(
              "rounded-full border px-3 py-1 text-sm capitalize",
              status === f ? "border-navy bg-navy text-white" : "border-gray-300 bg-white text-gray-700 hover:border-navy",
            )}
          >
            {f || "all"} <span className="opacity-70">({countOf(f)})</span>
          </Link>
        ))}
      </div>
      <div className="admin-card divide-y divide-gray-100">
        {items.length === 0 && <p className="px-5 py-10 text-center text-sm text-gray-500">No inquiries here.</p>}
        {items.map((i) => (
          <Link key={i._id} href={`/admin/inquiries/${i._id}`} className={cn("block px-5 py-4 hover:bg-gray-50", i.status === "new" && "bg-amber-50/40")}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={cn("truncate text-sm", i.status === "new" ? "font-semibold" : "font-medium")}>
                  {i.name} <span className="font-normal text-gray-500">&lt;{i.email}&gt;</span>
                </p>
                <p className="truncate text-sm text-gray-700">{i.subject}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {i.productName && <span className="mr-2 rounded bg-mist px-1.5 py-0.5 text-navy">{i.productName}</span>}
                  {i.message}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={i.status} />
                <span className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Pagination variant="admin" page={page} pages={pages} basePath="/admin/inquiries" params={{ status: status || undefined }} />
      </div>
    </>
  );
}
