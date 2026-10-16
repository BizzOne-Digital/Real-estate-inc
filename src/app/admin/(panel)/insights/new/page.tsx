import { AdminPageTitle } from "@/components/admin/AdminShell";
import { PostForm } from "@/components/admin/PostForm";

export const metadata = { title: "New article" };

export default function NewPostPage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  return (
    <>
      <AdminPageTitle title="New article" />
      <PostForm
        id={null}
        initial={{
          title: "",
          slug: "",
          category: "Market Commentary",
          excerpt: "",
          body: "",
          coverImage: "",
          publishedAt: today,
          published: true,
        }}
      />
    </>
  );
}
