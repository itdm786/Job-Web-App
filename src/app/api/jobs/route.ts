import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, users } from "@/db/schema";
import { eq, and, gte, lte, ilike, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const jobNature = searchParams.get("jobNature"); // government/private
    const department = searchParams.get("department");
    const category = searchParams.get("category");
    const employmentType = searchParams.get("employmentType");
    const organization = searchParams.get("organization");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const q = searchParams.get("q");
    const status = searchParams.get("status") || "approved";
    const companyId = searchParams.get("companyId");
    const employmentFilter = searchParams.get("employmentType");
    const postedDate = searchParams.get("postedDate"); // last 24h, week, month
    const limit = parseInt(searchParams.get("limit") || "50");

    let filters: any[] = [];

    if (status) filters.push(eq(jobs.status, status));
    if (country && country !== "All") filters.push(eq(jobs.country, country));
    if (city && city !== "All") filters.push(eq(jobs.city, city));
    if (jobNature && jobNature !== "All") filters.push(eq(jobs.jobNature, jobNature));
    if (department && department !== "All") filters.push(eq(jobs.department, department));
    if (category && category !== "All") filters.push(eq(jobs.category, category));
    if (employmentType && employmentType !== "All") filters.push(eq(jobs.employmentType, employmentType));
    if (organization) filters.push(ilike(jobs.organizationName, `%${organization}%`));
    if (companyId) filters.push(eq(jobs.companyId, companyId));
    if (salaryMin) filters.push(gte(jobs.salaryMax, parseInt(salaryMin)));
    if (salaryMax) filters.push(lte(jobs.salaryMin, parseInt(salaryMax)));
    if (q) {
      filters.push(
        sql`(${jobs.title} ILIKE ${'%' + q + '%'} OR ${jobs.description} ILIKE ${'%' + q + '%'} OR ${jobs.organizationName} ILIKE ${'%' + q + '%'} OR ${jobs.city} ILIKE ${'%' + q + '%'})`
      );
    }
    if (postedDate && postedDate !== "All") {
      const now = new Date();
      let since = new Date();
      if (postedDate === "24h") since.setDate(now.getDate() - 1);
      else if (postedDate === "week") since.setDate(now.getDate() - 7);
      else if (postedDate === "month") since.setMonth(now.getMonth() - 1);
      filters.push(gte(jobs.postedAt, since));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const result = await db.select({
      job: jobs,
      company: companies,
    }).from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(whereClause)
      .orderBy(desc(jobs.postedAt))
      .limit(limit);

    const formatted = result.map(r => ({
      ...r.job,
      company: r.company,
    }));

    return NextResponse.json({ jobs: formatted });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, title, description, department, city, country, organizationName, category, salaryMin, salaryMax, employmentType, jobNature, requirements, deadline, language, experienceLevel, industry } = body;

    if (!title || !description || !city || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // basic moderation check
    const flaggedKeywords = ["scam", "fake", "illegal"];
    const lowerDesc = (description + " " + title).toLowerCase();
    const isFlagged = flaggedKeywords.some(k => lowerDesc.includes(k));
    
    const inserted = await db.insert(jobs).values({
      companyId: companyId || null,
      title,
      description,
      department: department || null,
      city,
      country,
      organizationName: organizationName || null,
      category: category || null,
      industry: industry || category || null,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      employmentType: employmentType || "full-time",
      jobNature: jobNature || "private",
      language: language || "en",
      requirements: requirements || null,
      deadline: deadline ? new Date(deadline) : null,
      experienceLevel: experienceLevel || null,
      status: isFlagged ? "flagged" : "pending",
    }).returning();

    return NextResponse.json({ job: inserted[0] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
