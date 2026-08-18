"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function PendingJobsActions({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [status, setStatus] = useState<string>("");

  const action = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId, action, reason: "" }),
      });
      if (res.ok) {
        setStatus(action === "approve" ? "approved" : "rejected");
      }
    } catch {}
    setLoading(null);
  };

  if (status === "approved") {
    return <Badge success label="Approved" />;
  }
  if (status === "rejected") {
    return <Badge success={false} label="Rejected" />;
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => action("reject")} disabled={!!loading}>
        {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        Reject
      </Button>
      <Button size="sm" onClick={() => action("approve")} disabled={!!loading}>
        {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
        Approve
      </Button>
    </>
  );
}

function Badge({ success, label }: { success: boolean; label: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
      {label}
    </span>
  );
}
