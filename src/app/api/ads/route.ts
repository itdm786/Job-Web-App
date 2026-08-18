import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const zone = searchParams.get("zone");
  const status = searchParams.get("status") || "approved";

  try {
    let filters: any[] = [];
    if (status !== "all") filters.push(eq(ads.status, status));
    if (country) filters.push(eq(ads.countryTarget, country));
    if (zone) filters.push(eq(ads.zone, zone));

    const whereClause = filters.length ? and(...filters) : undefined;
    const result = await db.select().from(ads).where(whereClause).orderBy(desc(ads.createdAt)).limit(20);
    return NextResponse.json({ ads: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { advertiserId, title, description, imageUrl, linkUrl, countryTarget, zone, budget, startDate, endDate } = body;
    if (!title || !advertiserId) return NextResponse.json({ error: "Missing" }, { status: 400 });

    const inserted = await db.insert(ads).values({
      advertiserId,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      linkUrl: linkUrl || null,
      countryTarget: countryTarget || null,
      zone: zone || "homepage_banner",
      budget: budget ? parseInt(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: "pending",
    }).returning();

    return NextResponse.json({ ad: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
