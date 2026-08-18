import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Clock, CheckCircle2, XCircle, FileText, Calendar } from "lucide-react";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications, jobs, companies, countries, cities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/applications");

  const applications = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      coverLetter: jobApplications.coverLetter,
      job: {
        id: jobs.id, title: jobs.title, slug: jobs.slug,
        salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
        workModes: jobs.workModes, isGovernmentJob: jobs.isGovernmentJob,
      },
      company: { id: companies.id, name: companies.name, logo: companies.logo },
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
    } as any)
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(jobApplications.userId, user.id))
    .orderBy(desc(jobApplications.appliedAt)) as any;

  const counts = {
    total: applications.length,
    submitted: applications.filter((a: any) => a.status === "submitted").length,
    reviewing: applications.filter((a: any) => ["under_review", "shortlisted"].includes(a.status)).length,
    interview: applications.filter((a: any) => a.status === "interview").length,
    hired: applications.filter((a: any) => a.status === "hired").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
      <p className="text-slate-600 mb-6">Track all your job applications in one place</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <MiniStat label="Total" value={counts.total} />
        <MiniStat label="Submitted" value={counts.submitted} color="blue" />
        <MiniStat label="Reviewing" value={counts.reviewing} color="amber" />
        <MiniStat label="Interview" value={counts.interview} color="purple" />
        <MiniStat label="Hired" value={counts.hired} color="emerald" />
      </div>

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to jobs to see them here"
            action={
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id} className="p-5 card-hover">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl shrink-0">
                  {app.company?.logo || "🏢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <Link href={`/jobs/${app.job.slug}`} className="font-semibold text-slate-900 hover:text-emerald-700 line-clamp-1">
                        {app.job.title}
                      </Link>
                      <div className="text-sm text-slate-600">{app.company?.name}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      {app.country?.flag} {[app.city?.name, app.country?.name].filter(Boolean).join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Applied {timeAgo(app.appliedAt)}
                    </span>
                    <span>{formatSalary(app.job.salaryMin, app.job.salaryMax, app.job.salaryCurrency)}</span>
                  </div>
                  {app.coverLetter && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">"{app.coverLetter}"</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color = "slate" }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <Card className={`p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any; icon: any }> = {
    submitted: { label: "Submitted", variant: "info", icon: Clock },
    under_review: { label: "Under Review", variant: "warning", icon: Clock },
    shortlisted: { label: "Shortlisted", variant: "success", icon: CheckCircle2 },
    interview: { label: "Interview", variant: "success", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "danger", icon: XCircle },
    hired: { label: "Hired", variant: "success", icon: CheckCircle2 },
  };
  const s = map[status] || map.submitted;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="shrink-0">
      <Icon className="w-3 h-3" />
      {s.label}
    </Badge>
  );
}
