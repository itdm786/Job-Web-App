import Link from "next/link";
import { Shield, CheckCircle2, MapPin, Briefcase } from "lucide-react";
import { db } from "@/db";
import { jobs, companies, countries, cities, governmentOrganizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GovernmentJobsPage() {
  const govJobs = await db
    .select({
      id: jobs.id, title: jobs.title, slug: jobs.slug,
      salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
      ministry: jobs.ministry, department: jobs.department,
      publishedAt: jobs.publishedAt, deadline: jobs.deadline,
      company: { name: companies.name, logo: companies.logo },
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
      govOrg: { name: governmentOrganizations.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .leftJoin(governmentOrganizations, eq(jobs.governmentOrgId, governmentOrganizations.id))
    .where(eq(jobs.isGovernmentJob, true))
    .orderBy(desc(jobs.publishedAt))
    .limit(50);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Government Jobs</h1>
              <p className="text-slate-600">Verified positions from government organizations worldwide</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> All verified</span>
            <span>{govJobs.length} open positions</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-3">
          {govJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <Card className="p-5 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl shrink-0">
                    {job.company?.logo || "🏛️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{job.title}</h3>
                        <div className="text-sm text-slate-600">{job.govOrg?.name || job.company?.name}</div>
                      </div>
                      <Badge variant="government">
                        <Shield className="w-3 h-3" />
                        Verified
                      </Badge>
                    </div>
                    {job.ministry && (
                      <div className="text-xs text-slate-500 mb-2">
                        {job.ministry}{job.department && ` • ${job.department}`}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.country?.flag} {[job.city?.name, job.country?.name].filter(Boolean).join(", ")}
                      </span>
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
          {govJobs.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No government jobs available right now</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
