import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminShell";
import { PostForm } from "@/components/admin/PostForm";
import type { PostCategory } from "@/lib/constants";
import { connectDB, plain } from "@/lib/db";
import { Post } from "@/lib/models";
import type { PostT } from "@/lib/types";

export const metadata = { title: "Edit article" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  await connectDB();
  const doc = await Post.findById(id).lean();
  if (!doc) notFound();
  const p = plain<PostT>(doc);
  return (
    <>
      <AdminPageTitle title={`Edit: ${p.title}`} />
      <PostForm
        id={id}
        initial={{
          title: p.title,
          slug: p.slug,
          category: p.category as PostCategory,
          excerpt: p.excerpt ?? "",
          body: p.body ?? "",
          coverImage: p.coverImage ?? "",
          publishedAt: new Date(p.publishedAt).toLocaleDateString("en-CA", { timeZone: "America/Toronto" }),
          published: Boolean(p.published),
        }}
      />
    </>
  );
}
