import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  await connectDB();
  const newInquiries = await Inquiry.countDocuments({ status: "new" });
  return (
    <AdminShell adminEmail={admin.email} newInquiries={newInquiries}>
      {children}
    </AdminShell>
  );
}
