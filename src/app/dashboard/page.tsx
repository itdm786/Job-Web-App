import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, Bookmark, Bell, User, FileText, Settings, TrendingUp,
  CheckCircle2, Clock, XCircle, Plus, ChevronRight,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import {
  jobApplications, jobs, companies, categories, countries, cities, savedJobs, profiles,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // User's applications
  const applications = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      job: { id: jobs.id, title: jobs.title, slug: jobs.slug },
      company: { name: companies.name, logo: companies.logo },
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobApplications.userId, user.id))
    .orderBy(desc(jobApplications.appliedAt))
    .limit(5);

  // Saved jobs
  const saved = await db
    .select({
      id: savedJobs.id,
      savedAt: savedJobs.createdAt,
      job: {
        id: jobs.id, title: jobs.title, slug: jobs.slug,
        salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
      },
      company: { name: companies.name, logo: companies.logo },
      country: { name: countries.name },
      city: { name: cities.name },
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(savedJobs.userId, user.id))
    .orderBy(desc(savedJobs.createdAt))
    .limit(5);

  // Recommended jobs (based on category or just recent featured)
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const recommended = await db
    .select({
      id: jobs.id, title: jobs.title, slug: jobs.slug,
      salaryMin: jobs.salaryMin, salaryMax: jobs.salaryMax, salaryCurrency: jobs.salaryCurrency,
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
      company: { name: companies.name, logo: companies.logo },
      category: { name: categories.name },
    })
    .from(jobs)
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(categories, eq(jobs.categoryId, categories.id))
    .where(eq(jobs.status, "published"))
    .orderBy(desc(jobs.publishedAt))
    .limit(6);

  const appCounts = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    reviewing: applications.filter((a) => a.status === "under_review" || a.status === "shortlisted").length,
  };

  // Profile completion score
  const profileFields = ["headline", "about", "phone"];
  const filledFields = profileFields.filter((f) => (profile as any)?.[f]);
  const completionPct = Math.round((filledFields.length / profileFields.length) * 100);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-slate-600 mt-1">Here's what's happening with your job search</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Applications" value={applications.length} color="blue" />
          <StatCard icon={Bookmark} label="Saved Jobs" value={saved.length} color="amber" />
          <StatCard icon={CheckCircle2} label="Under Review" value={appCounts.reviewing} color="emerald" />
          <StatCard icon={Bell} label="Job Alerts" value={0} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent applications */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
                <Link href="/dashboard/applications" className="text-sm text-emerald-700 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 mb-3">No applications yet</p>
                  <Link href="/jobs">
                    <Button size="sm">Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <Link key={app.id} href={`/jobs/${app.job.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-lg shrink-0">
                        {app.company?.logo || "🏢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{app.job.title}</div>
                        <div className="text-xs text-slate-500">{app.company?.name} • {timeAgo(app.appliedAt)}</div>
                      </div>
                      <StatusBadge status={app.status} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Saved jobs */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Saved Jobs</h2>
                <Link href="/dashboard/saved" className="text-sm text-emerald-700 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {saved.length === 0 ? (
                <p className="text-center py-8 text-slate-600">No saved jobs yet. Browse jobs and save the ones you like.</p>
              ) : (
                <div className="space-y-3">
                  {saved.map((s) => (
                    <Link key={s.id} href={`/jobs/${s.job.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-lg shrink-0">
                        {s.company?.logo || "🏢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{s.job.title}</div>
                        <div className="text-xs text-slate-500">
                          {s.company?.name} • {[s.city?.name, s.country?.name].filter(Boolean).join(", ")}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 font-medium">
                        {formatSalary(s.job.salaryMin, s.job.salaryMax, s.job.salaryCurrency)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Recommended jobs */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended for you</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {recommended.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.slug}`} className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-sm shrink-0">
                        {job.company?.logo || "🏢"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 text-sm line-clamp-1">{job.title}</div>
                        <div className="text-xs text-slate-500 truncate">{job.company?.name}</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span className="truncate">{job.country?.flag} {[job.city?.name, job.country?.name].filter(Boolean).join(", ")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-xl font-semibold">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{profile?.headline || "Complete your profile"}</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Profile completion</span>
                  <span className="font-medium text-slate-900">{completionPct}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </Card>

            {/* Quick links */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
              <div className="space-y-1">
                <QuickLink icon={FileText} href="/dashboard/applications" label="My Applications" count={applications.length} />
                <QuickLink icon={Bookmark} href="/dashboard/saved" label="Saved Jobs" count={saved.length} />
                <QuickLink icon={Bell} href="/dashboard/notifications" label="Notifications" />
                <QuickLink icon={User} href="/dashboard/profile" label="My Profile" />
                <QuickLink icon={Settings} href="/dashboard/settings" label="Settings" />
              </div>
            </Card>

            {/* Employer CTA */}
            {user.roles.includes("Employer") && (
              <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <Briefcase className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-slate-900 mb-1">Employer Portal</h3>
                <p className="text-sm text-slate-600 mb-3">Post jobs and manage applicants</p>
                <Link href="/employer">
                  <Button className="w-full">Go to Employer Portal</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Card className="p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
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
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function QuickLink({ icon: Icon, href, label, count }: { icon: any; href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50">
      <span className="flex items-center gap-3 text-sm text-slate-700">
        <Icon className="w-4 h-4 text-slate-400" />
        {label}
      </span>
      {count !== undefined && count > 0 && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>}
    </Link>
  );
}
