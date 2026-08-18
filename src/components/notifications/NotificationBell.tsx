"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, CheckCheck, Mail, MailOpen, Sparkles, Briefcase, Shield, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
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

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.notifications);
        setUnread(data.data.unreadCount);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchNotifications();
    const interval = setInterval(() => {
      if (user && !open) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, open]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAll: true }),
    });
  };

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "welcome":
      case "login":
        return <Sparkles className="w-4 h-4" />;
      case "job_approved":
      case "company_verified":
        return <Check className="w-4 h-4" />;
      case "job_rejected":
      case "company_rejected":
        return <AlertCircle className="w-4 h-4" />;
      case "application_update":
        return <Briefcase className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse-slow">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unread > 0 ? `${unread} unread` : "All caught up!"}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">You'll be notified about important updates here</p>
              </div>
            ) : (
              <div>
                {items.map((n) => {
                  const content = (
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0",
                        !n.read && "bg-emerald-50/40"
                      )}
                      onClick={() => {
                        if (!n.read) markRead(n.id);
                        if (n.link) setOpen(false);
                      }}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", getColor(n.type))}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm text-slate-900", !n.read ? "font-semibold" : "font-medium")}>
                            {n.title}
                          </p>
                          {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  );
                  return n.link ? (
                    <Link key={n.id} href={n.link}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-emerald-700 hover:underline flex items-center justify-center gap-1 py-1"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
