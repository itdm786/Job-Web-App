import { db } from "@/db";
import { savedJobs, jobs, companies, countries, cities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { success, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const saved = await db
    .select({
      id: savedJobs.id,
      savedAt: savedJobs.createdAt,
      job: {
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        workModes: jobs.workModes,
        isGovernmentJob: jobs.isGovernmentJob,
        publishedAt: jobs.publishedAt,
        country: { name: countries.name, flag: countries.flag } as any,
        city: { name: cities.name } as any,
      },
      company: {
        id: companies.id,
        name: companies.name,
        logo: companies.logo,
        verificationLevel: companies.verificationLevel,
      },
    } as any)
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(savedJobs.userId, user.id))
    .orderBy(desc(savedJobs.createdAt));

  return success(saved as any);
}
