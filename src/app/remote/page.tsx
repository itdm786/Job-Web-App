import Link from "next/link";
import { Globe2, MapPin, Briefcase } from "lucide-react";
import { db } from "@/db";
import { jobs, companies, countries, cities } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RemoteJobsPage() {
  // Use SQL to filter jobs where workModes jsonb contains "remote"
  const remoteJobs = await db
    .select({
      id: jobs.id, title: jobs.title, slug: jobs.slug,
      salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
      workModes: jobs.workModes,
      publishedAt: jobs.publishedAt,
      company: { name: companies.name, logo: companies.logo },
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(sql`${jobs.workModes}::jsonb @> '["remote"]'::jsonb AND ${jobs.status} = 'published'`)
    .orderBy(desc(jobs.publishedAt))
    .limit(50);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Remote Jobs</h1>
              <p className="text-slate-600">Work from anywhere in the world</p>
            </div>
          </div>
          <div className="text-sm text-slate-700">{remoteJobs.length} remote positions available</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-3">
          {remoteJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <Card className="p-5 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-2xl shrink-0">
                    {job.company?.logo || "🏢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{job.title}</h3>
                        <div className="text-sm text-slate-600">{job.company?.name}</div>
                      </div>
                      <Badge variant="success">Remote</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      {job.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.country.flag} {job.country.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                      <span className="text-slate-500">{timeAgo(job.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {remoteJobs.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No remote jobs available right now</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
