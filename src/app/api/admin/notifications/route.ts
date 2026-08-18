import { db } from "@/db";
import { notifications, users, userRoles, roles } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { success, error, parseBody, unauthorized, forbidden } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(2000),
  type: z.string().default("admin"),
  link: z.string().optional(),
  target: z.enum(["all", "seekers", "employers", "admins", "user"]),
  userId: z.string().optional(), // for target=user
});

// POST send notification (admin only)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden("Only admins can send notifications");

  const body = await parseBody<z.infer<typeof schema>>(req);
  if (!body) return error("Invalid request");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const data = parsed.data;

  // Determine recipient user IDs
  let recipientIds: string[] = [];

  if (data.target === "all") {
    const all = await db.select({ id: users.id }).from(users).where(eq(users.active, true));
    recipientIds = all.map((u) => u.id);
  } else if (data.target === "user") {
    if (!data.userId) return error("userId required for target=user");
    recipientIds = [data.userId];
  } else {
    // seekers, employers, admins - find users with that role
    const roleName = data.target === "seekers" ? "Job Seeker" : data.target === "employers" ? "Employer" : "Admin";
    const matched = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.name, roleName));
    recipientIds = [...new Set(matched.map((m) => m.userId))];
  }

  if (recipientIds.length === 0) return error("No recipients found");

  // Insert notifications in batches
  const batchSize = 100;
  let sent = 0;
  for (let i = 0; i < recipientIds.length; i += batchSize) {
    const batch = recipientIds.slice(i, i + batchSize).map((userId) => ({
      id: randomUUID(),
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      read: false,
    }));
    await db.insert(notifications).values(batch);
    sent += batch.length;
  }

  return success({ sent, recipients: recipientIds.length });
}
