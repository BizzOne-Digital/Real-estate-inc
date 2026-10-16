import { AdminPageTitle } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SETTINGS, withDefaults } from "@/lib/content-types";
import { connectDB, plain } from "@/lib/db";
import { SiteSettings } from "@/lib/models";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "site" }).lean();
  const settings = withDefaults(DEFAULT_SETTINGS, plain(doc?.data ?? null));
  return (
    <>
      <AdminPageTitle title="Settings" description="Logo, contact details, social links, footer and default SEO." />
      <SettingsForm initial={settings} />
    </>
  );
}
