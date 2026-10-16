import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { RichText } from "@/components/site/RichText";
import { PostCard } from "@/components/realestate/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { getPostBySlug, getRelatedPosts, getSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt || post.body.slice(0, 160),
    alternates: { canonical: `/market-insights/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt, images: post.coverImage ? [post.coverImage] : undefined },
  };
}

export default async function InsightPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [related, settings] = await Promise.all([getRelatedPosts(post.category, post._id, 3), getSettings()]);

  return (
    <>
      <article>
        <header className="border-b border-line bg-mist">
          <div className="container-site max-w-4xl py-14 lg:py-20">
            <nav aria-label="Breadcrumb" className="font-sans text-xs uppercase tracking-[0.18em] text-muted">
              <Link href="/market-insights" className="hover:text-navy">
                Market Insights
              </Link>
              <span aria-hidden className="mx-2">/</span>
              <Link href={`/market-insights?category=${encodeURIComponent(post.category)}`} className="hover:text-navy">
                {post.category}
              </Link>
            </nav>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,4.6vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.02em] text-navy">
              {post.title}
            </h1>
            <p className="mt-5 font-sans text-sm text-muted">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {settings.agentName && (
                <>
                  {" "}
                  <span aria-hidden>·</span> {settings.agentName}
                  {settings.agentTitle && `, ${settings.agentTitle}`}
                </>
              )}
            </p>
          </div>
        </header>
        {post.coverImage && (
          <div className="container-site max-w-5xl pt-10">
            <div className="relative aspect-[16/9] overflow-hidden bg-mist-deep">
              <SafeImage src={post.coverImage} alt="" fill priority sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container-site max-w-3xl py-12 lg:py-16">
          {post.excerpt && <p className="mb-8 font-display text-[1.55rem] leading-snug text-navy">{post.excerpt}</p>}
          <RichText text={post.body} className="text-[17.5px] leading-[1.75] text-ink/90" />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-line bg-offwhite">
          <div className="container-site py-14 lg:py-20">
            <h2 id="related-heading" className="mb-8 font-display text-[clamp(2rem,3.4vw,2.8rem)] text-navy">
              More insights
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand heading="Questions about the market?" buttonLabel="Talk to Nadeem" buttonHref="/contact" />
    </>
  );
}
