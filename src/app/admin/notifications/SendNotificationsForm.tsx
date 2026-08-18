"use client";

import { useState } from "react";
import { Card, Input, Select, Textarea, Button, Alert } from "@/components/ui";
import { Send, Users, Briefcase, Shield, User, Megaphone, CheckCircle2, Loader2 } from "lucide-react";

export function SendNotificationsForm() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "admin",
    link: "",
    target: "all",
    userId: "",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; sent?: number } | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setResult({ success: false, message: "Title and message are required" });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({
        success: true,
        message: `Notification sent to ${data.data.recipients} users`,
        sent: data.data.recipients,
      });
      setForm({ title: "", message: "", type: "admin", link: "", target: "all", userId: "" });
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  const targets = [
    { value: "all", label: "All Users", icon: Users, desc: "Everyone on the platform" },
    { value: "seekers", label: "Job Seekers", icon: Briefcase, desc: "Users with Job Seeker role" },
    { value: "employers", label: "Employers", icon: Briefcase, desc: "Users with Employer role" },
    { value: "admins", label: "Admins", icon: Shield, desc: "All admin users" },
    { value: "user", label: "Specific User", icon: User, desc: "Send to one user by ID" },
  ];

  return (
    <form onSubmit={submit} className="space-y-5">
      {result && (
        <Alert variant={result.success ? "success" : "error"}>
          {result.success && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
          {result.message}
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          Target Audience
        </h2>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {targets.map((t) => {
            const Icon = t.icon;
            const active = form.target === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => update("target", t.value)}
                className={`p-3 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                  active
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <div>
                  <div className={`text-sm font-medium ${active ? "text-indigo-900" : "text-slate-900"}`}>
                    {t.label}
                  </div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {form.target === "user" && (
          <Input
            label="User ID"
            value={form.userId}
            onChange={(e) => update("userId", e.target.value)}
            placeholder="User UUID"
            required
          />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Message</h2>
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. New feature available!"
            required
          />
          <Textarea
            label="Message *"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Write your notification message..."
            rows={5}
            required
          />
          <Select label="Type" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="admin">Admin Announcement</option>
            <option value="system">System Update</option>
            <option value="welcome">Welcome</option>
            <option value="job_approved">Job Approval</option>
            <option value="application_update">Application Update</option>
          </Select>
          <Input
            label="Link URL (optional)"
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            placeholder="/jobs or https://example.com"
            hint="Users will be taken here when they click the notification"
          />
        </div>
      </Card>

      <div className="flex justify-end sticky bottom-4 bg-slate-50 p-4 -mx-4">
        <Button type="submit" loading={sending} size="lg">
          <Send className="w-4 h-4" />
          Send Notification
        </Button>
      </div>
    </form>
  );
}
