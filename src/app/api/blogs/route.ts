import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "published";
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const lang = searchParams.get("lang");

  try {
    let filters: any[] = [];
    if (status !== "all") filters.push(eq(blogs.status, status));
    if (category && category !== "All") filters.push(eq(blogs.category, category));
    if (lang) filters.push(eq(blogs.language, lang));
    if (q) filters.push(ilike(blogs.title, `%${q}%`));

    const whereClause = filters.length ? and(...filters) : undefined;
    const result = await db.select().from(blogs).where(whereClause).orderBy(desc(blogs.createdAt)).limit(50);
    return NextResponse.json({ blogs: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, authorId, category, tags, excerpt, seoTitle, seoDescription, language, coverImage, status } = body;
    if (!title || !content) return NextResponse.json({ error: "Missing title/content" }, { status: 400 });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-5);

    const flagged = (content + title).toLowerCase().includes("illegal") || (content + title).toLowerCase().includes("scam");

    const inserted = await db.insert(blogs).values({
      title,
      slug,
      content,
      authorId: authorId || null,
      category: category || "General",
      tags: tags || [],
      excerpt: excerpt || content.slice(0, 150),
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || "",
      language: language || "en",
      coverImage: coverImage || null,
      status: flagged ? "draft" : (status || "draft"),
    }).returning();

    return NextResponse.json({ blog: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
