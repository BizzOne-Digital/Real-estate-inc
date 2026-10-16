import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { CondoForm } from "@/components/admin/CondoForm";
import { connectDB, plain } from "@/lib/db";
import { Condo } from "@/lib/models";
import type { CondoT } from "@/lib/types";

export const metadata = { title: "Edit condo page" };

export default async function EditCondoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  await connectDB();
  const doc = await Condo.findById(id).lean();
  if (!doc) notFound();
  const c = plain<CondoT>(doc);
  return (
    <>
      <AdminPageTitle title={`Edit: ${c.name}`} />
      <CondoForm
        id={id}
        initial={{
          name: c.name,
          slug: c.slug,
          address: c.address ?? "",
          city: c.city ?? "",
          neighbourhood: c.neighbourhood ?? "",
          intersection: c.intersection ?? "",
          developer: c.developer ?? "",
          summary: c.summary ?? "",
          description: c.description ?? "",
          details: (c.details ?? []).map((d) => ({ label: d.label ?? "", value: d.value ?? "" })),
          featureGroups: (c.featureGroups ?? []).map((g) => ({ heading: g.heading ?? "", items: g.items ?? [] })),
          images: c.images ?? [],
          mapQuery: c.mapQuery ?? "",
          featured: Boolean(c.featured),
          published: Boolean(c.published),
          order: c.order ?? 0,
        }}
      />
    </>
  );
}
