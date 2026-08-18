import { db } from "@/db";
import { notifications } from "@/db/schema";
import { randomUUID } from "crypto";

export type NotificationType =
  | "welcome"
  | "login"
  | "job_approved"
  | "job_rejected"
  | "application_update"
  | "company_verified"
  | "company_rejected"
  | "admin"
  | "system";

interface NotifyArgs {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function notifyUser({ userId, type, title, message, link }: NotifyArgs) {
  try {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId,
      type,
      title,
      message,
      link: link || null,
      read: false,
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}

export async function notifyUsers(userIds: string[], args: Omit<NotifyArgs, "userId">) {
  try {
    const batch = userIds.map((userId) => ({
      id: randomUUID(),
      userId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link || null,
      read: false,
    }));
    await db.insert(notifications).values(batch);
  } catch (err) {
    console.error("Failed to send notifications:", err);
  }
}
