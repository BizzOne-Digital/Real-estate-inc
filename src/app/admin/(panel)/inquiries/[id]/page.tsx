import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { connectDB, plain } from "@/lib/db";
import { Inquiry } from "@/lib/models";
import type { InquiryT } from "@/lib/types";

export const metadata = { title: "Inquiry" };

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  await connectDB();
  const doc = await Inquiry.findById(id).populate("product", "name slug published").lean();
  if (!doc) notFound();
  const inq = plain<InquiryT & { product: { _id: string; name: string; slug: string; published: boolean } | null }>(doc);

  return (
    <>
      <Link href="/admin/inquiries" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy">
        <ArrowLeft aria-hidden className="h-4 w-4" /> All inquiries
      </Link>
      <AdminPageTitle title={inq.subject} actions={<StatusBadge status={inq.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <article className="admin-card p-5">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{inq.message}</p>
          <div className="mt-6 border-t border-gray-100 pt-4">
            <InquiryActions id={inq._id} status={inq.status} />
          </div>
        </article>
        <aside className="admin-card space-y-3 p-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">From</p>
            <p className="font-medium">{inq.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
            <a href={`mailto:${inq.email}?subject=${encodeURIComponent(`Re: ${inq.subject}`)}`} className="text-navy hover:underline">
              {inq.email}
            </a>
          </div>
          {inq.phone && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
              <a href={`tel:${inq.phone.replace(/[^\d+]/g, "")}`} className="text-navy hover:underline">
                {inq.phone}
              </a>
            </div>
          )}
          {(inq.product || inq.productName) && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Product</p>
              {inq.product ? (
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${inq.product._id}`} className="text-navy hover:underline">
                    {inq.product.name}
                  </Link>
                  {inq.product.published && (
                    <Link href={`/products/${inq.product.slug}`} target="_blank" aria-label="View product on website" className="text-gray-500 hover:text-navy">
                      <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ) : (
                <p>{inq.productName} <span className="text-gray-500">(deleted)</span></p>
              )}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Received</p>
            <p>{new Date(inq.createdAt).toLocaleString()}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
