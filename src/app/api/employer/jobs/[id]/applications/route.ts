import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobs, jobApplications, users, companyUsers, companies, countries, cities, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { success, error, unauthorized, forbidden, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all applications for a job (employer only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id: jobId } = await params;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!job) return error("Job not found", 404);

  // Check if user is admin of the company
  const [membership] = await db
    .select()
    .from(companyUsers)
    .where(and(eq(companyUsers.companyId, job.companyId), eq(companyUsers.userId, user.id)))
    .limit(1);
  if (!membership && !user.roles.includes("Super Admin")) return forbidden("Not authorized");

  const applications = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      appliedAt: jobApplications.appliedAt,
      coverLetter: jobApplications.coverLetter,
      resumeUrl: jobApplications.resumeUrl,
      portfolioUrl: jobApplications.portfolioUrl,
      applicant: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      profile: {
        headline: profiles.headline,
        phone: profiles.phone,
        city: { name: cities.name },
        country: { name: countries.name, flag: countries.flag },
      },
    } as any)
    .from(jobApplications)
    .innerJoin(users, eq(jobApplications.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(cities, eq(profiles.cityId, cities.id))
    .leftJoin(countries, eq(profiles.countryId, countries.id))
    .where(eq(jobApplications.jobId, jobId))
    .orderBy(desc(jobApplications.appliedAt));

  return success(applications as any);
}

// PUT update application status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id: jobId } = await params;

  const body = await parseBody<{ applicationId: string; status: string; notes?: string }>(req);
  if (!body?.applicationId || !body.status) return error("Missing fields");

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!job) return error("Job not found", 404);

  const [membership] = await db
    .select()
    .from(companyUsers)
    .where(and(eq(companyUsers.companyId, job.companyId), eq(companyUsers.userId, user.id)))
    .limit(1);
  if (!membership && !user.roles.includes("Super Admin")) return forbidden();

  const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, body.applicationId)).limit(1);
  if (!application) return error("Application not found", 404);

  await db
    .update(jobApplications)
    .set({ status: body.status, notes: body.notes, updatedAt: new Date() })
    .where(eq(jobApplications.id, body.applicationId));

  // Notify applicant
  const { notifyUser } = await import("@/lib/notifications");
  const statusMessages: Record<string, { title: string; message: string }> = {
    under_review: { title: "Your application is under review", message: `The employer has started reviewing your application for "${job.title}".` },
    shortlisted: { title: "🎉 You've been shortlisted!", message: `Great news! You've been shortlisted for "${job.title}".` },
    interview: { title: "📞 Interview scheduled", message: `You've been selected for an interview for "${job.title}". Check your email for details.` },
    hired: { title: "🎊 Congratulations! You got the job!", message: `You've been hired for "${job.title}". Congratulations!` },
    rejected: { title: "Application update", message: `Unfortunately, your application for "${job.title}" was not successful this time. Don't give up!` },
  };
  const msg = statusMessages[body.status];
  if (msg) {
    await notifyUser({
      userId: application.userId,
      type: "application_update",
      title: msg.title,
      message: msg.message,
      link: `/dashboard/applications`,
    });
  }

  return success({ message: "Status updated" });
}
