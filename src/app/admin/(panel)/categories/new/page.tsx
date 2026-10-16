import { AdminPageTitle } from "@/components/admin/AdminShell";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageTitle title="New category" />
      <CategoryForm id={null} initial={{ name: "", slug: "", description: "", image: "", order: 0, showOnHome: true }} />
    </>
  );
}
