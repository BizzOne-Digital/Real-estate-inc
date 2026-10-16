import { AdminPageTitle } from "@/components/admin/AdminShell";
import { CondoForm } from "@/components/admin/CondoForm";

export const metadata = { title: "New condo page" };

export default function NewCondoPage() {
  return (
    <>
      <AdminPageTitle title="New condo page" description="Create a page for a condominium building." />
      <CondoForm
        id={null}
        initial={{
          name: "",
          slug: "",
          address: "",
          city: "Mississauga",
          neighbourhood: "",
          intersection: "",
          developer: "",
          summary: "",
          description: "",
          details: [],
          featureGroups: [{ heading: "Amenities", items: [] }],
          images: [],
          mapQuery: "",
          featured: false,
          published: true,
          order: 0,
        }}
      />
    </>
  );
}
