import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobs, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, error, parseBody, unauthorized, forbidden } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  const body = await parseBody<{ jobId: string; action: "approve" | "reject"; reason?: string }>(req);
  if (!body?.jobId || !body.action) return error("Missing jobId or action");

  const [job] = await db.select().from(jobs).where(eq(jobs.id, body.jobId)).limit(1);
  if (!job) return error("Job not found", 404);

  const previousStatus = job.status;
  const newStatus = body.action === "approve" ? "published" : "rejected";
  const publishedAt = body.action === "approve" ? new Date() : null;

  await db.update(jobs).set({
    status: newStatus,
    reviewedBy: user.id,
    reviewNotes: body.reason || null,
    rejectionReason: body.action === "reject" ? body.reason : null,
    publishedAt,
  }).where(eq(jobs.id, body.jobId));

  // Notify job owner (company admins)
  const { companyUsers } = await import("@/db/schema");
  const { notifyUsers } = await import("@/lib/notifications");
  const admins = await db
    .select({ userId: companyUsers.userId })
    .from(companyUsers)
    .where(eq(companyUsers.companyId, job.companyId));

  const adminIds = admins.map((a) => a.userId);
  if (adminIds.length > 0) {
    if (body.action === "approve") {
      await notifyUsers(adminIds, {
        type: "job_approved",
        title: "✅ Your job was approved!",
        message: `"${job.title}" is now live and visible to candidates.`,
        link: `/jobs/${job.slug}`,
      });
    } else {
      await notifyUsers(adminIds, {
        type: "job_rejected",
        title: "❌ Your job needs changes",
        message: `"${job.title}" was not approved.${body.reason ? ` Reason: ${body.reason}` : ""}`,
        link: "/employer",
      });
    }
  }

  // Audit log
  await db.insert(auditLogs).values({
    id: randomUUID(),
    userId: user.id,
    action: `job_${body.action}`,
    entityType: "job",
    entityId: body.jobId,
    previousValue: { status: previousStatus },
    newValue: { status: newStatus, reason: body.reason },
  });

  return success({ jobId: body.jobId, status: newStatus });
}
