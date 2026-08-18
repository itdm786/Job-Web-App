import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobApplications, jobs, savedJobs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error, parseBody, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Apply to job
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await parseBody<{ jobId: string; coverLetter?: string; resumeUrl?: string; portfolioUrl?: string }>(req);
  if (!body?.jobId) return error("Job ID required");

  const [job] = await db.select().from(jobs).where(eq(jobs.id, body.jobId)).limit(1);
  if (!job) return error("Job not found", 404);
  if (job.status !== "published") return error("Job is not accepting applications");

  // Check if already applied
  const [existing] = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.jobId, body.jobId), eq(jobApplications.userId, user.id)))
    .limit(1);
  if (existing) return error("You have already applied to this job", 409);

  const id = randomUUID();
  await db.insert(jobApplications).values({
    id,
    jobId: body.jobId,
    userId: user.id,
    coverLetter: body.coverLetter,
    resumeUrl: body.resumeUrl,
    portfolioUrl: body.portfolioUrl,
    status: "submitted",
  });

  // Increment count
  await db.update(jobs).set({ applications: (job.applications || 0) + 1 }).where(eq(jobs.id, body.jobId));

  return success({ id, message: "Application submitted" }, 201);
}

// Save/unsave job
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await parseBody<{ jobId: string }>(req);
  if (!body?.jobId) return error("Job ID required");

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.jobId, body.jobId), eq(savedJobs.userId, user.id)))
    .limit(1);

  if (existing) {
    await db.delete(savedJobs).where(eq(savedJobs.id, existing.id));
    return success({ saved: false });
  } else {
    await db.insert(savedJobs).values({
      id: randomUUID(),
      userId: user.id,
      jobId: body.jobId,
    });
    return success({ saved: true });
  }
}
