import Link from "next/link";
import { FolderTree, Images, Mail, Package } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { connectDB, plain } from "@/lib/db";
import { Category, GalleryItem, Inquiry, Product } from "@/lib/models";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await connectDB();
  const [products, published, categories, gallery, newInquiries, recent] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ published: true }),
    Category.countDocuments(),
    GalleryItem.countDocuments(),
    Inquiry.countDocuments({ status: "new" }),
    Inquiry.find({}, "name subject status createdAt productName").sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const recentInquiries = plain<{ _id: string; name: string; subject: string; status: string; createdAt: string; productName: string }[]>(recent);

  const cards = [
    { label: "Products", value: products, note: `${published} published`, href: "/admin/products", Icon: Package },
    { label: "Categories", value: categories, note: "Collections", href: "/admin/categories", Icon: FolderTree },
    { label: "Gallery images", value: gallery, note: "Inspiration", href: "/admin/gallery", Icon: Images },
    { label: "New inquiries", value: newInquiries, note: "Awaiting reply", href: "/admin/inquiries?status=new", Icon: Mail, alert: newInquiries > 0 },
  ];

  return (
    <>
      <AdminPageTitle title="Dashboard" description="An overview of your website content and customer inquiries." />
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

      <section className="admin-card mt-6">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold">Latest inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm text-navy hover:underline">
            View all
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No inquiries yet. Submissions from the contact page will appear here.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentInquiries.map((i) => (
              <li key={i._id}>
                <Link href={`/admin/inquiries/${i._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {i.name} <span className="font-normal text-gray-500">— {i.subject}</span>
                    </p>
                    {i.productName && <p className="truncate text-xs text-gray-500">Product: {i.productName}</p>}
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
    </>
  );
}

