"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function BlogEditorPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Start writing your blog post here... Rich text editor with formatting, images, videos, embeds.</p><p>Try AI-assisted content generation (mock): Government jobs in Pakistan 2026 analysis.</p>");
  const [category, setCategory] = useState("Career Tips");
  const [tags, setTags] = useState("career, jobs, government");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  const format = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  };

  const insertImage = () => {
    const url = prompt("Image URL:");
    if (url) format("insertImage", url);
  };

  const handleSave = async () => {
    if (!title || !content) { alert("Title and content required"); return; }
    setSaving(true);
    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content: document.getElementById("editor")?.innerHTML || content,
        authorId: user?.id,
        category,
        tags: tags.split(",").map(t => t.trim()),
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || title.slice(0, 150),
        language,
        coverImage,
        status,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      alert(`Blog saved as ${status} — ${status === "published" ? "Now live!" : "Goes to review queue."}`);
      window.location.href = `/blogs/${data.blog.slug}`;
    } else alert(data.error);
  };

  const aiGenerate = () => {
    const mockAI = `
      <h2>How to Get Government Job in Pakistan 2026 - Complete Guide</h2>
      <p>This comprehensive guide covers FPSC, PPSC, SPSC, KPPSC, BPSC latest jobs.</p>
      <h3>Eligibility Criteria</h3>
      <ul>
        <li>Pakistani Nationality</li>
        <li>Age 18-35 varies by department</li>
        <li>Graduation required</li>
      </ul>
      <p><strong>Pro Tip:</strong> Apply early, keep documents ready, prepare for NTS.</p>
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" alt="office" />
      <p>Multi-country support now allows same platform to search US federal jobs, UAE government jobs, India SSC jobs.</p>
    `;
    const editor = document.getElementById("editor");
    if (editor) editor.innerHTML = mockAI;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Rich Text / WYSIWYG Editor — TipTap / CKEditor-like</h1>
            <Link href="/blogs" className="text-sm text-teal-700 hover:underline">← Blogs</Link>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Blog title..." className="w-full text-xl font-bold bg-transparent outline-none placeholder:text-slate-400" />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
              <button onClick={() => format("bold")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs font-bold">B</button>
              <button onClick={() => format("italic")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs italic">I</button>
              <button onClick={() => format("underline")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs underline">U</button>
              <button onClick={() => format("formatBlock", "<h2>")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">H2</button>
              <button onClick={() => format("formatBlock", "<h3>")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">H3</button>
              <button onClick={() => format("insertUnorderedList")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">• List</button>
              <button onClick={() => format("insertOrderedList")} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">1. List</button>
              <button onClick={insertImage} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">🖼️ Image</button>
              <button onClick={() => { const url = prompt("Video embed URL:"); if (url) document.execCommand("insertHTML", false, `<iframe src="${url}" class="w-full h-64 rounded-xl my-4" frameborder="0" allowfullscreen></iframe>`); }} className="rounded-lg bg-white border px-2.5 py-1.5 text-xs">📹 Video</button>
              <button onClick={aiGenerate} className="ml-auto rounded-full bg-amber-700 px-3 py-1.5 text-xs font-bold text-white">✨ AI Generate Content (API)</button>
            </div>
            <div id="editor" contentEditable suppressContentEditableWarning className="min-h-[400px] p-6 outline-none prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving} className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : `Save as ${status}`}</button>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold text-sm">Post Settings</h3>
            <div className="mt-4 space-y-3">
              <div><label className="text-xs font-semibold">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm"><option>Career Tips</option><option>Government Jobs</option><option>Private Jobs</option><option>Interview</option><option>General</option></select></div>
              <div><label className="text-xs font-semibold">Tags (comma)</label><input value={tags} onChange={e => setTags(e.target.value)} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-semibold">Language (multi-lang)</label><select value={language} onChange={e => setLanguage(e.target.value)} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm"><option value="en">English</option><option value="ur">Urdu</option><option value="hi">Hindi</option><option value="ar">Arabic</option><option value="es">Spanish</option><option value="fr">French</option></select></div>
              <div><label className="text-xs font-semibold">Cover Image URL</label><input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm" /></div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold text-sm">SEO Fields</h3>
            <div className="mt-3 space-y-3">
              <div><label className="text-xs font-semibold">Meta Title</label><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="SEO title..." className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-semibold">Meta Description</label><textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm" /></div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">SEO optimized per Next.js best practices.</div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="font-bold text-xs text-violet-800">Workflow: Editor → Review → Publish</div>
            <div className="mt-1 text-[11px] text-amber-800">Editor role writes, Publisher role publishes. Admin oversees. API can generate content via AI API integration.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
