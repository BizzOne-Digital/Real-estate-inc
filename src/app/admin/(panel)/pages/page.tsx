import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { AboutContentForm, CollectionsContentForm, ContactContentForm, GalleryContentForm, HomeContentForm } from "@/components/admin/PageContentForms";
import {
  DEFAULT_ABOUT,
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_HOME,
  withDefaults,
  type AboutContent,
  type CollectionsContent,
  type ContactContent,
  type GalleryContent,
  type HomeContent,
} from "@/lib/content-types";
import { connectDB, plain } from "@/lib/db";
import { PageContent } from "@/lib/models";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page content" };

const TABS = [
  { key: "home", label: "Homepage" },
  { key: "collections", label: "Collections & Products" },
  { key: "gallery", label: "Gallery" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
] as const;

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? (rawTab as (typeof TABS)[number]["key"]) : "home";
  await connectDB();
  const doc = await PageContent.findOne({ key: tab }).lean();
  const stored = plain<Record<string, unknown> | null>(doc?.data ?? null);

  return (
    <>
      <AdminPageTitle title="Page content" description="Edit the text and images on the public pages. Changes go live as soon as you save." />
      <div role="tablist" aria-label="Pages" className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/pages?tab=${t.key}`}
            role="tab"
            aria-selected={tab === t.key}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm",
              tab === t.key ? "border-navy font-medium text-navy" : "border-transparent text-gray-500 hover:text-gray-800",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="max-w-4xl" role="tabpanel">
        {tab === "home" && <HomeContentForm key="home" initial={withDefaults<HomeContent>(DEFAULT_HOME, stored)} />}
        {tab === "about" && <AboutContentForm key="about" initial={withDefaults<AboutContent>(DEFAULT_ABOUT, stored)} />}
        {tab === "collections" && <CollectionsContentForm key="collections" initial={withDefaults<CollectionsContent>(DEFAULT_COLLECTIONS, stored)} />}
        {tab === "gallery" && <GalleryContentForm key="gallery" initial={withDefaults<GalleryContent>(DEFAULT_GALLERY, stored)} />}
        {tab === "contact" && <ContactContentForm key="contact" initial={withDefaults<ContactContent>(DEFAULT_CONTACT, stored)} />}
      </div>
    </>
  );
}
