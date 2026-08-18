import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobs, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seekerId = searchParams.get("seekerId");
  const jobId = searchParams.get("jobId");
  const companyId = searchParams.get("companyId");

  try {
    if (seekerId) {
      const result = await db.select({
        application: applications,
        job: jobs,
        company: companies,
      }).from(applications)
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .leftJoin(companies, eq(jobs.companyId, companies.id))
        .where(eq(applications.seekerId, seekerId))
        .orderBy(desc(applications.appliedAt));
      return NextResponse.json({ applications: result });
    }
    if (jobId) {
      const result = await db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.appliedAt));
      return NextResponse.json({ applications: result });
    }
    if (companyId) {
      // get applications for company's jobs
      const jobList = await db.select().from(jobs).where(eq(jobs.companyId, companyId));
      const jobIds = jobList.map(j => j.id);
      if (jobIds.length === 0) return NextResponse.json({ applications: [] });
      // naive: query each
      const allApps = await db.select({
        application: applications,
        job: jobs,
      }).from(applications).leftJoin(jobs, eq(applications.jobId, jobs.id)).orderBy(desc(applications.appliedAt));
      const filtered = allApps.filter(a => jobIds.includes(a.application.jobId));
      return NextResponse.json({ applications: filtered });
    }
    const all = await db.select().from(applications).orderBy(desc(applications.appliedAt)).limit(100);
    return NextResponse.json({ applications: all });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, seekerId, resumeUrl, coverLetter } = body;
    if (!jobId || !seekerId) return NextResponse.json({ error: "Missing" }, { status: 400 });

    // check duplicate
    const existing = await db.select().from(applications).where(eq(applications.jobId, jobId));
    const already = existing.find(a => a.seekerId === seekerId);
    if (already) return NextResponse.json({ error: "Already applied" }, { status: 400 });

    const inserted = await db.insert(applications).values({
      jobId,
      seekerId,
      resumeUrl: resumeUrl || null,
      coverLetter: coverLetter || null,
      status: "applied",
    }).returning();

    return NextResponse.json({ application: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
