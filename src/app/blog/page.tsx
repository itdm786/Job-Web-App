import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { blogs, users, blogCategories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui";
import { timeAgo, stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      content: blogs.content,
      featuredImage: blogs.featuredImage,
      publishedAt: blogs.publishedAt,
      views: blogs.views,
      author: { name: users.name },
      category: { name: blogCategories.name, slug: blogCategories.slug },
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .where(eq(blogs.status, "published"))
    .orderBy(desc(blogs.publishedAt));

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Career Resources</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Expert advice, industry insights, and career guidance to help you succeed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full card-hover overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-4xl">
                  📚
                </div>
                <div className="p-5">
                  {post.category && (
                    <div className="text-xs font-medium text-emerald-700 mb-2">{post.category.name}</div>
                  )}
                  <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">{post.title}</h2>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {post.excerpt || (post.content ? stripHtml(post.content).slice(0, 150) : "")}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No blog posts yet. Check back soon!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
