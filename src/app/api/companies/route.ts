import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId");
  try {
    if (employerId) {
      const result = await db.select().from(companies).where(eq(companies.employerId, employerId)).limit(1);
      return NextResponse.json({ company: result[0] || null });
    }
    const all = await db.select().from(companies).limit(50);
    return NextResponse.json({ companies: all });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, name, industry, location, country, description, website, logo } = body;
    if (!employerId || !name) return NextResponse.json({ error: "Missing" }, { status: 400 });
    const existing = await db.select().from(companies).where(eq(companies.employerId, employerId)).limit(1);
    if (existing.length > 0) {
      const updated = await db.update(companies).set({ name, industry, location, country, description, website, logo }).where(eq(companies.id, existing[0].id)).returning();
      return NextResponse.json({ company: updated[0] });
    }
    const inserted = await db.insert(companies).values({
      employerId,
      name,
      industry,
      location,
      country,
      description,
      website,
      logo,
    }).returning();
    return NextResponse.json({ company: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
