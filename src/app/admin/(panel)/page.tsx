import Link from "next/link";
import { Building2, FileText, Mail, Newspaper } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { connectDB, plain } from "@/lib/db";
import { Condo, Inquiry, Post } from "@/lib/models";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await connectDB();
  const [condos, publishedCondos, posts, publishedPosts, newInquiries, totalInquiries, recent] = await Promise.all([
    Condo.countDocuments(),
    Condo.countDocuments({ published: true }),
    Post.countDocuments(),
    Post.countDocuments({ published: true }),
    Inquiry.countDocuments({ status: "new" }),
    Inquiry.countDocuments(),
    Inquiry.find({}, "name subject interest status createdAt").sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  const recentInquiries = plain<{ _id: string; name: string; subject: string; interest: string; status: string; createdAt: string }[]>(recent);

  const cards = [
    { label: "New inquiries", value: newInquiries, note: `${totalInquiries} in total`, href: "/admin/inquiries?status=new", Icon: Mail, alert: newInquiries > 0 },
    { label: "Condo pages", value: condos, note: `${publishedCondos} published`, href: "/admin/condos", Icon: Building2 },
    { label: "Market Insights", value: posts, note: `${publishedPosts} published`, href: "/admin/insights", Icon: Newspaper },
    { label: "Page content", value: 8, note: "Editable pages", href: "/admin/pages", Icon: FileText },
  ];

  return (
    <>
      <AdminPageTitle title="Dashboard" description="An overview of your website content and client inquiries." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, href, Icon, alert }) => (
          <Link key={label} href={href} className="admin-card flex items-start justify-between p-5 transition-shadow hover:shadow-md">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
              <p className={alert ? "mt-1 text-xs font-medium text-amber-700" : "mt-1 text-xs text-gray-500"}>{note}</p>
            </div>
            <span className="rounded-md bg-mist p-2 text-navy">
              <Icon aria-hidden className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="admin-card">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-navy hover:underline">
              View all
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">No inquiries yet. Messages from the contact page will appear here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentInquiries.map((i) => (
                <li key={i._id}>
                  <Link href={`/admin/inquiries/${i._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{i.name}</p>
                      <p className="truncate text-xs text-gray-500">{i.subject || i.interest}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={i.status} />
                      <span className="hidden text-xs text-gray-400 sm:inline">{new Date(i.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="admin-card p-5">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/admin/insights/new" className="admin-btn justify-start">
              <Newspaper aria-hidden className="h-4 w-4" /> Write a Market Insights article
            </Link>
            <Link href="/admin/condos/new" className="admin-btn-ghost justify-start">
              <Building2 aria-hidden className="h-4 w-4" /> Add a condo building page
            </Link>
            <Link href="/admin/pages?tab=testimonials" className="admin-btn-ghost justify-start">
              <FileText aria-hidden className="h-4 w-4" /> Add a client review
            </Link>
            <Link href="/admin/settings" className="admin-btn-ghost justify-start">
              <FileText aria-hidden className="h-4 w-4" /> Update contact details
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
