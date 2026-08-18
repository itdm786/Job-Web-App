import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { db } from "@/db";
import { blogs, users, blogCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [post] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post] = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      content: blogs.content,
      publishedAt: blogs.publishedAt,
      views: blogs.views,
      author: { name: users.name },
      category: { name: blogCategories.name },
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .where(eq(blogs.slug, slug))
    .limit(1);

  if (!post || !post.content) notFound();

  return (
    <article className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <Card className="p-8 lg:p-12">
          {post.category && (
            <div className="text-sm font-medium text-emerald-700 mb-3">{post.category.name}</div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>•</span>
            <span>By {post.author?.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.max(1, Math.ceil((post.content?.length || 0) / 1000))} min read
            </span>
          </div>
          <div
            className="rich-content text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>
      </div>
    </article>
  );
}
