import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, Briefcase, Building2, FileText, Flag, Shield, TrendingUp,
  Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { db } from "@/db";
import {
  users, jobs, companies, jobApplications, advertisements, blogs, reports,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/dashboard");

  // Stats
  const [userStats, jobStats, companyStats, appStats, adStats, blogStats, reportStats] = await Promise.all([
    db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where active = true)::int`,
    }).from(users),
    db.select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where status = 'published')::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')::int`,
      government: sql<number>`count(*) filter (where is_government_job = true)::int`,
    }).from(jobs),
    db.select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where verification_status = 'verified')::int`,
      pending: sql<number>`count(*) filter (where verification_status = 'pending')::int`,
    }).from(companies),
    db.select({ total: sql<number>`count(*)::int` }).from(jobApplications),
    db.select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      active: sql<number>`count(*) filter (where status = 'active')::int`,
    }).from(advertisements),
    db.select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where status = 'published')::int`,
    }).from(blogs),
    db.select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
    }).from(reports),
  ]);

  // Recent pending jobs
  const pendingJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      status: jobs.status,
      createdAt: jobs.createdAt,
      company: { name: companies.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.status, "pending"))
    .limit(5);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-emerald-700 mb-2">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Admin Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-slate-600 mt-1">Monitor and manage all aspects of GlobalHire</p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={userStats[0]?.total || 0}
            change={`${userStats[0]?.active || 0} active`}
            color="blue"
          />
          <StatCard
            icon={Briefcase}
            label="Total Jobs"
            value={jobStats[0]?.total || 0}
            change={`${jobStats[0]?.published || 0} published`}
            color="emerald"
          />
          <StatCard
            icon={Building2}
            label="Companies"
            value={companyStats[0]?.total || 0}
            change={`${companyStats[0]?.verified || 0} verified`}
            color="purple"
          />
          <StatCard
            icon={FileText}
            label="Applications"
            value={appStats[0]?.total || 0}
            change="All time"
            color="amber"
          />
        </div>

        {/* Review queue */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <ReviewCard
            title="Pending Jobs"
            count={jobStats[0]?.pending || 0}
            href="/admin/jobs/pending"
            color="amber"
            icon={Clock}
          />
          <ReviewCard
            title="Pending Companies"
            count={companyStats[0]?.pending || 0}
            href="/admin/companies"
            color="blue"
            icon={Building2}
          />
          <ReviewCard
            title="Open Reports"
            count={reportStats[0]?.pending || 0}
            href="/admin/reports"
            color="red"
            icon={Flag}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending jobs */}
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Pending Job Reviews</h2>
              <Link href="/admin/jobs/pending" className="text-sm text-emerald-700 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                <p className="text-slate-600">No pending jobs to review</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{job.title}</div>
                      <div className="text-xs text-slate-500">{job.company?.name}</div>
                    </div>
                    <Link href={`/admin/jobs/pending?id=${job.id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick stats */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Job Distribution</h3>
              <div className="space-y-3">
                <DistRow label="Published" value={jobStats[0]?.published || 0} total={jobStats[0]?.total || 1} color="emerald" />
                <DistRow label="Pending" value={jobStats[0]?.pending || 0} total={jobStats[0]?.total || 1} color="amber" />
                <DistRow label="Rejected" value={jobStats[0]?.rejected || 0} total={jobStats[0]?.total || 1} color="red" />
                <DistRow label="Government" value={jobStats[0]?.government || 0} total={jobStats[0]?.total || 1} color="indigo" />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Content</h3>
              <div className="space-y-2">
                <NavLink href="/admin/blog" label="Blog Posts" count={blogStats[0]?.total || 0} />
                <NavLink href="/admin/advertisements" label="Advertisements" count={adStats[0]?.total || 0} />
                <NavLink href="/admin/categories" label="Categories" />
                <NavLink href="/admin/locations" label="Countries & Cities" />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Administration</h3>
              <div className="space-y-2">
                <NavLink href="/admin/users" label="Manage Users" />
                <NavLink href="/admin/notifications" label="Send Notification" />
                <NavLink href="/admin/roles" label="Roles & Permissions" />
                <NavLink href="/admin/analytics" label="Analytics" />
                <NavLink href="/admin/settings" label="Platform Settings" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, color }: { icon: any; label: string; value: number; change: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    purple: "from-purple-500 to-pink-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{change}</div>
    </Card>
  );
}

function ReviewCard({ title, count, href, color, icon: Icon }: { title: string; count: number; href: string; color: string; icon: any }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <Link href={href}>
      <Card className={`p-5 hover:shadow-md transition-shadow ${colors[color]}`}>
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-6 h-6" />
          {count > 0 && (
            <span className="text-2xl font-bold">{count}</span>
          )}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs opacity-70 mt-1">
          {count === 0 ? "All caught up!" : `Needs attention`}
        </p>
      </Card>
    </Link>
  );
}

function DistRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500",
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function NavLink({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 text-sm">
      <span className="text-slate-700">{label}</span>
      {count !== undefined && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>}
    </Link>
  );
}
