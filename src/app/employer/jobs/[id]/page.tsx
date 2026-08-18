import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { jobs, companies, companyUsers } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ApplicantsClient } from "./ApplicantsClient";

export const dynamic = "force-dynamic";

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      companyId: jobs.companyId,
      company: { name: companies.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job) notFound();

  const [membership] = await db
    .select()
    .from(companyUsers)
    .where(and(eq(companyUsers.companyId, job.companyId), eq(companyUsers.userId, user.id)))
    .limit(1);
  if (!membership && !user.roles.includes("Super Admin")) redirect("/employer");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/employer" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{job.title}</h1>
        <p className="text-slate-600">Manage applicants for this job</p>
      </div>

      <ApplicantsClient jobId={job.id} />
    </div>
  );
}
