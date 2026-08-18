import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Plus, Users, Eye, CheckCircle2, Clock, XCircle, BarChart3 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { jobs, companies, companyUsers, jobApplications } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/employer");
  if (!hasRole(user, "Employer") && !user.roles.includes("Super Admin")) {
    redirect("/dashboard");
  }

  // Get user's companies with designation
  const userCompanies = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      logo: companies.logo,
      verificationStatus: companies.verificationStatus,
      verificationLevel: companies.verificationLevel,
      industry: companies.industry,
      designation: companyUsers.designation,
      companyRole: companyUsers.role,
    })
    .from(companyUsers)
    .innerJoin(companies, eq(companyUsers.companyId, companies.id))
    .where(eq(companyUsers.userId, user.id));

  const company = userCompanies[0];

  let companyJobs: any[] = [];
  let stats = { total: 0, published: 0, pending: 0, draft: 0, applications: 0 };

  if (company) {
    companyJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, company.id))
      .orderBy(desc(jobs.createdAt))
      .limit(10);

    const [countStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where status = 'published')::int`,
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        draft: sql<number>`count(*) filter (where status = 'draft')::int`,
      })
      .from(jobs)
      .where(eq(jobs.companyId, company.id));

    const [appStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobs.companyId, company.id));

    stats = {
      ...countStats,
      applications: appStats?.count || 0,
    };
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your jobs and applicants</p>
          </div>
          <Link href="/employer/post">
            <Button>
              <Plus className="w-4 h-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        {company ? (
          <>
            {/* Company info */}
            <Card className="p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl shrink-0">
                  {company.logo || "🏢"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900">{company.name}</h2>
                  {company.designation && (
                    <div className="text-sm text-slate-600 mt-0.5">
                      {user.name} · <span className="font-medium text-slate-900">{company.designation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {company.verificationLevel === "verified" && (
                      <Badge variant="verified">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Employer
                      </Badge>
                    )}
                    {company.verificationStatus === "pending" && (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3" />
                        Verification Pending
                      </Badge>
                    )}
                    {company.industry && (
                      <Badge variant="default">{company.industry}</Badge>
                    )}
                    {company.companyRole && (
                      <Badge variant="info">Role: {company.companyRole}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <MiniStat icon={Briefcase} label="Total Jobs" value={stats.total} />
              <MiniStat icon={CheckCircle2} label="Published" value={stats.published} color="emerald" />
              <MiniStat icon={Clock} label="Pending" value={stats.pending} color="amber" />
              <MiniStat icon={BarChart3} label="Drafts" value={stats.draft} />
              <MiniStat icon={Users} label="Applications" value={stats.applications} color="blue" />
            </div>

            {/* Jobs list */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Jobs</h2>
              {companyJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 mb-3">No jobs posted yet</p>
                  <Link href="/employer/post">
                    <Button size="sm">Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200">
                        <th className="pb-2 font-medium text-slate-600">Job Title</th>
                        <th className="pb-2 font-medium text-slate-600">Status</th>
                        <th className="pb-2 font-medium text-slate-600">Applications</th>
                        <th className="pb-2 font-medium text-slate-600">Views</th>
                        <th className="pb-2 font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyJobs.map((job) => (
                        <tr key={job.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 pr-4">
                            <Link href={job.status === "published" ? `/jobs/${job.slug}` : "#"} className="font-medium text-slate-900 hover:text-emerald-700">
                              {job.title}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="py-3 pr-4 text-slate-700">{job.applications || 0}</td>
                          <td className="py-3 pr-4 text-slate-700">{job.views || 0}</td>
                          <td className="py-3">
                            <Link href={`/employer/jobs/${job.id}`} className="text-emerald-700 hover:underline text-xs font-medium">
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Set up your company</h2>
            <p className="text-slate-600 mb-4">Create a company account to start posting jobs. Our team will verify your company within 1-2 business days.</p>
            <Link href="/employer/signup">
              <Button>
                <Plus className="w-4 h-4" />
                Create Company Account
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color = "slate" }: { icon: any; label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card className="p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-600">{label}</div>
    </Card>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any; icon: any }> = {
    draft: { label: "Draft", variant: "default", icon: BarChart3 },
    pending: { label: "Pending Review", variant: "warning", icon: Clock },
    published: { label: "Published", variant: "success", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "danger", icon: XCircle },
    suspended: { label: "Suspended", variant: "danger", icon: XCircle },
  };
  const s = map[status] || map.draft;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
