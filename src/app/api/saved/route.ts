import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedJobs, jobs, companies } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seekerId = searchParams.get("seekerId");
  if (!seekerId) return NextResponse.json({ error: "Missing seekerId" }, { status: 400 });
  try {
    const result = await db.select({
      saved: savedJobs,
      job: jobs,
      company: companies,
    }).from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(savedJobs.seekerId, seekerId))
      .orderBy(desc(savedJobs.savedAt));
    return NextResponse.json({ saved: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { seekerId, jobId } = await req.json();
    if (!seekerId || !jobId) return NextResponse.json({ error: "Missing" }, { status: 400 });
    const existing = await db.select().from(savedJobs).where(and(eq(savedJobs.seekerId, seekerId), eq(savedJobs.jobId, jobId))).limit(1);
    if (existing.length > 0) {
      await db.delete(savedJobs).where(eq(savedJobs.id, existing[0].id));
      return NextResponse.json({ saved: false });
    }
    const inserted = await db.insert(savedJobs).values({ seekerId, jobId }).returning();
    return NextResponse.json({ saved: true, data: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
