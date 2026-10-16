import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import {
  AboutContentForm,
  ContactContentForm,
  HomeContentForm,
  InfoPageForm,
  TestimonialsForm,
} from "@/components/admin/PageContentForms";
import {
  withDefaults,
  type AboutContent,
  type ContactContent,
  type HomeContent,
  type InfoPageContent,
  type TestimonialsContent,
} from "@/lib/content-types";
import { PAGE_DEFAULTS } from "@/lib/data";
import { connectDB, plain } from "@/lib/db";
import { PageContent, type PageKey } from "@/lib/models";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page content" };

const TABS: { key: PageKey; label: string; note?: string }[] = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  {
    key: "featured",
    label: "Featured Properties",
    note: "The Search Properties and featured listings links on this page are set in Settings.",
  },
  { key: "relocation", label: "Relocation" },
  { key: "mortgage", label: "Mortgage", note: "The mortgage calculator is shown automatically between the header and the sections." },
  {
    key: "land-transfer-tax",
    label: "Land Transfer Tax",
    note: "The land transfer tax calculator is shown automatically between the header and the sections.",
  },
  { key: "testimonials", label: "Testimonials" },
  { key: "contact", label: "Contact" },
];

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const active = TABS.find((t) => t.key === rawTab) ?? TABS[0];
  const tab = active.key;
  await connectDB();
  const doc = await PageContent.findOne({ key: tab }).lean();
  const stored = plain<Record<string, unknown> | null>(doc?.data ?? null);
  const initial = withDefaults(PAGE_DEFAULTS[tab] as object, stored);

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
        {tab === "home" && <HomeContentForm key="home" initial={initial as HomeContent} />}
        {tab === "about" && <AboutContentForm key="about" initial={initial as AboutContent} />}
        {(tab === "featured" || tab === "relocation" || tab === "mortgage" || tab === "land-transfer-tax") && (
          <InfoPageForm key={tab} pageKey={tab} initial={initial as InfoPageContent} note={active.note} />
        )}
        {tab === "testimonials" && <TestimonialsForm key="testimonials" initial={initial as TestimonialsContent} />}
        {tab === "contact" && <ContactContentForm key="contact" initial={initial as ContactContent} />}
      </div>
    </>
  );
}
