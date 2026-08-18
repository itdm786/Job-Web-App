import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Card, Badge, Button } from "@/components/ui";
import { Bell, Check, CheckCheck, Mail, Briefcase, Shield, AlertCircle, Sparkles, Info } from "lucide-react";
import { NotificationsClient } from "./NotificationsClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/notifications");

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-600">
              {unreadCount > 0 ? `${unreadCount} unread of ${items.length} total` : `${items.length} notifications`}
            </p>
          </div>
        </div>
      </div>

      <NotificationsClient initial={items} />
    </div>
  );
}
