import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const result = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.update(blogs).set({ views: sql`${blogs.views} + 1` }).where(eq(blogs.id, result[0].id));
    return NextResponse.json({ blog: result[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const update: any = {};
    const allowed = ["title", "content", "category", "tags", "status", "excerpt", "seoTitle", "seoDescription", "coverImage"];
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    if (body.status === "published" && !body.publishedAt) update.publishedAt = new Date();
    const updated = await db.update(blogs).set(update).where(eq(blogs.slug, slug)).returning();
    return NextResponse.json({ blog: updated[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
