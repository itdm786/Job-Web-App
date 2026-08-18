"use client";

import { useState } from "react";
import { Button, Textarea, Alert } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { ExternalLink, Send } from "lucide-react";

export function ApplyButton({ jobId, applicationUrl, applicationMethod }: { jobId: string; applicationUrl?: string | null; applicationMethod?: string | null }) {
  const method = applicationMethod || "internal";
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApply = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/jobs`;
      return;
    }
    if (method === "external" && applicationUrl) {
      window.open(applicationUrl, "_blank");
      return;
    }
    setShowForm(true);
  };

  const submitApplication = async () => {
    setApplying(true);
    setMessage(null);
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId, coverLetter }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Application submitted successfully!" });
        setShowForm(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to apply" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      {message && <Alert variant={message.type === "success" ? "success" : "error"} className="mb-3">{message.text}</Alert>}

      {showForm ? (
        <div className="space-y-3">
          <Textarea
            label="Cover Letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself and explain why you're a great fit..."
            rows={5}
          />
          <Button onClick={submitApplication} loading={applying} className="w-full">
            <Send className="w-4 h-4" />
            Submit Application
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button onClick={handleApply} size="lg" className="w-full">
          {method === "external" ? (
            <>
              <ExternalLink className="w-4 h-4" />
              Apply on Company Website
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Apply Now
            </>
          )}
        </Button>
      )}
    </div>
  );
}
