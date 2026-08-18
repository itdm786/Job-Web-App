import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, error, parseBody, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET user's notifications
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(notifications.createdAt)
    .limit(limit);

  // Reverse to get newest first
  const sorted = userNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = sorted.filter((n) => !n.read).length;

  return success({ notifications: sorted, unreadCount });
}

// POST mark as read (or all)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await parseBody<{ id?: string; markAll?: boolean }>(req);

  if (body?.markAll) {
    // Mark all as read - we need to update via raw SQL since drizzle's update with .where can't use SQL for "all unread"
    const { sql } = await import("drizzle-orm");
    await db
      .update(notifications)
      .set({ read: true })
      .where(sql`${notifications.userId} = ${user.id} AND ${notifications.read} = false`);
    return success({ marked: "all" });
  }

  if (body?.id) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, body.id));
    return success({ marked: body.id });
  }

  return error("Invalid request");
}
