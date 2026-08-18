"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import {
  Check, CheckCheck, Bell, Mail, Briefcase, Shield, AlertCircle, Sparkles, Info, Trash2,
} from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string | Date;
}

export function NotificationsClient({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAll: true }),
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "welcome":
      case "login":
        return <Sparkles className="w-5 h-5" />;
      case "job_approved":
      case "company_verified":
        return <Check className="w-5 h-5" />;
      case "job_rejected":
      case "company_rejected":
        return <AlertCircle className="w-5 h-5" />;
      case "application_update":
        return <Briefcase className="w-5 h-5" />;
      case "admin":
        return <Shield className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "welcome":
      case "login":
        return "bg-purple-100 text-purple-700";
      case "job_approved":
      case "company_verified":
      case "application_update":
        return "bg-emerald-100 text-emerald-700";
      case "job_rejected":
      case "company_rejected":
        return "bg-red-100 text-red-700";
      case "admin":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      {unread > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all as read ({unread})
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h2>
          <p className="text-slate-600">You'll see updates about your jobs, applications, and account here.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100">
          {items.map((n) => {
            const content = (
              <div
                className={cn(
                  "flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer",
                  !n.read && "bg-emerald-50/40"
                )}
                onClick={() => {
                  if (!n.read) markRead(n.id);
                }}
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", getColor(n.type))}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={cn("text-slate-900", !n.read ? "font-semibold" : "font-medium")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-2" />}
                  </div>
                  <p className="text-sm text-slate-600">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </Card>
      )}
    </>
  );
}
