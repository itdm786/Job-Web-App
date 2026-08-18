"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Select, EmptyState, Textarea } from "@/components/ui";
import { Users, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, ExternalLink, Loader2, FileText } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Applicant {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  applicant: { id: string; name: string; email: string };
  profile?: {
    headline?: string | null;
    phone?: string | null;
    city?: { name: string } | null;
    country?: { name: string; flag: string } | null;
  } | null;
}

export function ApplicantsClient({ jobId }: { jobId: string }) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Applicant | null>(null);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/applications`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setApplicants(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        setApplicants((apps) => apps.map((a) => (a.id === applicationId ? { ...a, status } : a)));
      }
    } catch {}
  };

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-3" />
        <p className="text-slate-600">Loading applicants...</p>
      </Card>
    );
  }

  if (applicants.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Applicants will appear here once they apply to this job"
        />
      </Card>
    );
  }

  const counts = {
    total: applicants.length,
    submitted: applicants.filter((a) => a.status === "submitted").length,
    reviewing: applicants.filter((a) => ["under_review", "shortlisted"].includes(a.status)).length,
    interview: applicants.filter((a) => a.status === "interview").length,
    hired: applicants.filter((a) => a.status === "hired").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <CountCard label="Total" value={counts.total} color="slate" />
        <CountCard label="Submitted" value={counts.submitted} color="blue" />
        <CountCard label="Reviewing" value={counts.reviewing} color="amber" />
        <CountCard label="Interview" value={counts.interview} color="purple" />
        <CountCard label="Hired" value={counts.hired} color="emerald" />
        <CountCard label="Rejected" value={counts.rejected} color="red" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Applicant list */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="font-semibold text-slate-900 mb-2">Applicants ({applicants.length})</h3>
          {applicants.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selected?.id === a.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {a.applicant.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{a.applicant.name}</div>
                  <div className="text-xs text-slate-500 truncate">{a.profile?.headline || "No headline"}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-slate-500">{timeAgo(a.appliedAt)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Applicant details */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card className="p-6 sticky top-24">
              <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-xl font-semibold">
                  {selected.applicant.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">{selected.applicant.name}</h2>
                  {selected.profile?.headline && (
                    <p className="text-sm text-slate-600">{selected.profile.headline}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selected.applicant.email}
                    </span>
                    {selected.profile?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selected.profile.phone}
                      </span>
                    )}
                    {selected.profile?.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selected.profile.country.flag} {[selected.profile.city?.name, selected.profile.country.name].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selected.coverLetter && (
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Cover Letter</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{selected.coverLetter}</p>
                </div>
              )}

              {(selected.resumeUrl || selected.portfolioUrl) && (
                <div className="flex gap-2 mb-4">
                  {selected.resumeUrl && (
                    <a href={selected.resumeUrl} target="_blank" rel="noopener">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4" />
                        Resume
                      </Button>
                    </a>
                  )}
                  {selected.portfolioUrl && (
                    <a href={selected.portfolioUrl} target="_blank" rel="noopener">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                        Portfolio
                      </Button>
                    </a>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton
                    label="Under Review"
                    icon={Clock}
                    onClick={() => updateStatus(selected.id, "under_review")}
                    active={selected.status === "under_review"}
                  />
                  <ActionButton
                    label="Shortlist"
                    icon={CheckCircle2}
                    onClick={() => updateStatus(selected.id, "shortlisted")}
                    active={selected.status === "shortlisted"}
                  />
                  <ActionButton
                    label="Interview"
                    icon={CheckCircle2}
                    onClick={() => updateStatus(selected.id, "interview")}
                    active={selected.status === "interview"}
                  />
                  <ActionButton
                    label="Hire"
                    icon={CheckCircle2}
                    onClick={() => updateStatus(selected.id, "hired")}
                    active={selected.status === "hired"}
                    variant="emerald"
                  />
                  <ActionButton
                    label="Reject"
                    icon={XCircle}
                    onClick={() => updateStatus(selected.id, "rejected")}
                    active={selected.status === "rejected"}
                    variant="red"
                    className="col-span-2"
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">Select an applicant to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function CountCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <Card className={`p-3 text-center ${colors[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px]">{label}</div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    submitted: { label: "New", variant: "info" },
    under_review: { label: "Reviewing", variant: "warning" },
    shortlisted: { label: "Shortlisted", variant: "success" },
    interview: { label: "Interview", variant: "success" },
    rejected: { label: "Rejected", variant: "danger" },
    hired: { label: "Hired", variant: "success" },
  };
  const s = map[status] || map.submitted;
  return <Badge variant={s.variant} className="text-[10px] px-1.5 py-0">{s.label}</Badge>;
}

function ActionButton({ label, icon: Icon, onClick, active, variant = "default", className = "" }: any) {
  const variants: Record<string, string> = {
    default: active ? "bg-slate-900 text-white" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
    emerald: active ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50",
    red: active ? "bg-red-600 text-white" : "bg-white text-red-700 border-red-300 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${variants[variant]} ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
