import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, MapPin, Briefcase, Trash2, ExternalLink } from "lucide-react";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { savedJobs, jobs, companies, countries, cities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SavedJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/saved");

  const saved = await db
    .select({
      id: savedJobs.id,
      savedAt: savedJobs.createdAt,
      job: {
        id: jobs.id, title: jobs.title, slug: jobs.slug,
        salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
        workModes: jobs.workModes, isGovernmentJob: jobs.isGovernmentJob,
        publishedAt: jobs.publishedAt,
      },
      company: { id: companies.id, name: companies.name, logo: companies.logo, verificationLevel: companies.verificationLevel },
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
    } as any)
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(savedJobs.userId, user.id))
    .orderBy(desc(savedJobs.createdAt)) as any;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-sm text-slate-600">{saved.length} jobs saved</p>
        </div>
      </div>

      <div className="mt-6">
        {saved.length === 0 ? (
          <Card>
            <EmptyState
              icon={Bookmark}
              title="No saved jobs"
              description="Browse jobs and save the ones you're interested in"
              action={
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {saved.map((s: any) => (
              <Card key={s.id} className="p-5 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl shrink-0">
                    {s.company?.logo || "🏢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <Link href={`/jobs/${s.job.slug}`} className="font-semibold text-slate-900 hover:text-emerald-700 line-clamp-1">
                          {s.job.title}
                        </Link>
                        <div className="text-sm text-slate-600">{s.company?.name}</div>
                      </div>
                      <Bookmark className="w-5 h-5 text-amber-500 fill-current shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {s.job.isGovernmentJob && <Badge variant="government">Government</Badge>}
                      {s.job.workModes?.slice(0, 2).map((m: string) => <Badge key={m} variant="default">{m}</Badge>)}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.country?.flag} {[s.city?.name, s.country?.name].filter(Boolean).join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {formatSalary(s.job.salaryMin, s.job.salaryMax, s.job.salaryCurrency)}
                      </span>
                      <span>Saved {timeAgo(s.savedAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
