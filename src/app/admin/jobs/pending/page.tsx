import { redirect } from "next/navigation";
import { db } from "@/db";
import { jobs, companies, categories, countries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { PendingJobsActions } from "./PendingJobsActions";

export const dynamic = "force-dynamic";

export default async function PendingJobsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/dashboard");

  const pendingJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      jobSector: jobs.jobSector,
      isGovernmentJob: jobs.isGovernmentJob,
      createdAt: jobs.createdAt,
      company: { name: companies.name, logo: companies.logo, verificationLevel: companies.verificationLevel },
      category: { name: categories.name },
      country: { name: countries.name, flag: countries.flag },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(categories, eq(jobs.categoryId, categories.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .where(eq(jobs.status, "pending"))
    .orderBy(desc(jobs.createdAt));

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Pending Job Reviews</h1>
          <p className="text-slate-600 mt-1">{pendingJobs.length} jobs waiting for review</p>
        </div>

        {pendingJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">All caught up!</h2>
            <p className="text-slate-600">No pending jobs to review</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Job</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Submitted</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingJobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-sm shrink-0">
                            {job.company?.logo || "🏢"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[200px]">{job.title}</div>
                            <div className="flex gap-1 mt-0.5">
                              {job.isGovernmentJob && <Badge variant="government" className="text-[10px] px-1.5 py-0">Gov</Badge>}
                              {job.jobSector === "private" && <Badge variant="default" className="text-[10px] px-1.5 py-0">Private</Badge>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{job.company?.name}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {job.country?.flag} {job.country?.name}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{job.category?.name}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/jobs/${job.slug}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <PendingJobsActions jobId={job.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
