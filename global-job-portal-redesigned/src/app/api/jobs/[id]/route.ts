import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, applications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await db.select({
      job: jobs,
      company: companies,
    }).from(jobs).leftJoin(companies, eq(jobs.companyId, companies.id)).where(eq(jobs.id, id)).limit(1);
    
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    // increment views
    await db.update(jobs).set({ views: sql`${jobs.views} + 1` }).where(eq(jobs.id, id));

    return NextResponse.json({ job: { ...result[0].job, company: result[0].company } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const allowed = ["status", "title", "description", "department", "city", "country", "organizationName", "category", "salaryMin", "salaryMax", "employmentType", "jobNature", "requirements", "deadline"];
    const updateData: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);
    
    const updated = await db.update(jobs).set(updateData).where(eq(jobs.id, id)).returning();
    return NextResponse.json({ job: updated[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.delete(jobs).where(eq(jobs.id, id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
