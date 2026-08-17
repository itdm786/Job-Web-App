"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function BlogDetail() {
  const { slug } = useParams() as { slug: string };
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`).then(r => r.json()).then(d => setBlog(d.blog));
  }, [slug]);

  if (!blog) return <div className="min-h-screen grid place-items-center">Loading blog...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-8">
        <Link href="/blogs" className="text-sm text-slate-600 hover:underline">← Back to blogs</Link>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {blog.coverImage && <img src={blog.coverImage} className="w-full h-64 object-cover" alt="" />}
          <div className="p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{blog.category}</span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">{blog.tags?.join(", ")}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{blog.status}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{blog.language?.toUpperCase()} • {blog.views} views</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight">{blog.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{blog.excerpt}</p>
            <div className="mt-2 text-xs text-slate-400">SEO Title: {blog.seoTitle} • Description: {blog.seoDescription?.slice(0,100)}</div>
            <div className="mt-6 prose prose-slate max-w-none text-[15px] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            <div className="mt-8 rounded-xl bg-slate-50 p-4">
              <div className="font-bold text-sm">Workflow</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${blog.status === "draft" ? "bg-slate-900 text-white" : "bg-white border"}`}>Draft</span>
                <span>→</span>
                <span className={`rounded-full px-2 py-1 ${blog.status === "review" ? "bg-amber-500 text-white" : "bg-white border"}`}>Review</span>
                <span>→</span>
                <span className={`rounded-full px-2 py-1 ${blog.status === "published" ? "bg-emerald-600 text-white" : "bg-white border"}`}>Published</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">Editor writes, Publisher publishes. Rich text supports images/videos/embeds.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
