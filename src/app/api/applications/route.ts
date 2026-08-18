import { db } from "@/db";
import { jobApplications, jobs, companies, countries, cities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { success, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const applications = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      coverLetter: jobApplications.coverLetter,
      job: {
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        country: { name: countries.name, flag: countries.flag } as any,
        city: { name: cities.name } as any,
      },
      company: {
        id: companies.id,
        name: companies.name,
        logo: companies.logo,
      },
    } as any)
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(jobApplications.userId, user.id))
    .orderBy(desc(jobApplications.appliedAt));

  return success(applications as any);
}
