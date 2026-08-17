"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchBlogs();
  }, [category]);

  const fetchBlogs = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "All") params.set("category", category);
    const res = await fetch(`/api/blogs?${params.toString()}`);
    const data = await res.json();
    setBlogs(data.blogs || []);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Blog — Rich Editor, SEO, Multi-lang</h1>
            <p className="text-sm text-slate-500 mt-1">WordPress Gutenberg / TipTap-like editor demo • Draft → Review → Publish workflow</p>
          </div>
          <Link href="/blogs/editor" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Open Rich Text Editor</Link>
        </div>

        <div className="mt-6 flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchBlogs()} placeholder="Search blogs..." className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm">
            <option value="All">All Categories</option>
            <option>Career Tips</option><option>Government Jobs</option><option>Private Jobs</option><option>Interview</option>
          </select>
          <button onClick={fetchBlogs} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white">Search</button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {blogs.length === 0 ? (
            <div className="md:col-span-3 rounded-2xl border border-dashed bg-white p-12 text-center">
              <div className="text-4xl">📝</div>
              <div className="mt-3 font-bold">No blogs yet</div>
              <div className="text-sm text-slate-500">Use rich editor to create first blog with images, videos, embeds</div>
            </div>
          ) : blogs.map((b: any) => (
            <Link key={b.id} href={`/blogs/${b.slug}`} className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition">
              <div className="h-40 bg-gradient-to-br from-teal-100 to-violet-100 grid place-items-center text-3xl">{b.coverImage ? <img src={b.coverImage} className="h-40 w-full object-cover" alt="" /> : "📰"}</div>
              <div className="p-5">
                <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{b.category}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{b.status}</span><span className="text-[10px] text-slate-500">{b.language?.toUpperCase()}</span></div>
                <h3 className="mt-3 font-bold text-[15px] leading-tight group-hover:text-teal-700">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">{b.excerpt}</p>
                <div className="mt-3 text-[11px] text-slate-500">SEO: {b.seoTitle?.slice(0,40)} • {b.views} views</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
