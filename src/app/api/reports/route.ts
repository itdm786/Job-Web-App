import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(50);
    return NextResponse.json({ reports: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reporterId, targetType, targetId, reason, description } = await req.json();
    if (!reporterId || !targetType || !targetId || !reason) return NextResponse.json({ error: "Missing" }, { status: 400 });
    const inserted = await db.insert(reports).values({ reporterId, targetType, targetId, reason, description: description || null, status: "pending" }).returning();
    return NextResponse.json({ report: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
