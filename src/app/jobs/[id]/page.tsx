"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function JobDetailPage() {
  const { id } = useParams() as { id: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [reportReason, setReportReason] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(d => {
      setJob(d.job);
      setLoading(false);
    });
    if (user) {
      fetch(`/api/saved?seekerId=${user.id}`).then(r => r.json()).then(d => {
        setSaved(d.saved?.some((s: any) => s.job?.id === id));
      });
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { router.push("/auth"); return; }
    if (user.role !== "seeker") { alert("Only seekers can apply. Login as seeker."); return; }
    setApplying(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: id, seekerId: user.id, coverLetter }),
    });
    const data = await res.json();
    setApplying(false);
    if (res.ok) alert("Applied successfully! Track in dashboard.");
    else alert(data.error || "Failed");
  };

  const toggleSave = async () => {
    if (!user) { router.push("/auth"); return; }
    await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seekerId: user.id, jobId: id }) });
    setSaved(!saved);
  };

  const handleReport = async () => {
    if (!user) { alert("Login to report"); return; }
    if (!reportReason) return;
    await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reporterId: user.id, targetType: "job", targetId: id, reason: reportReason }) } as any);
    alert("Reported. Admin will review per Privacy Policy.");
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!job) return <div className="min-h-screen grid place-items-center">Job not found</div>;

  const isGov = job.jobNature === "government";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Link href="/jobs" className="text-sm text-slate-600 hover:underline">← Back to jobs</Link>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 font-bold text-lg">{job.company?.name?.[0] || job.organizationName?.[0] || "J"}</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight">{job.title}</h1>
                <div className="mt-1 text-sm text-slate-600">{job.organizationName || job.company?.name} • {job.city}, {job.country} • {job.company?.industry || job.category}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isGov ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"}`}>{isGov ? "🏛️ Government" : "🏢 Private"} • {job.country}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{job.employmentType}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800">{job.department || job.category}</span>
                </div>
              </div>
              <button onClick={toggleSave} className={`rounded-full border px-4 py-2 text-sm ${saved ? "bg-slate-900 text-white" : "bg-white"}`}>{saved ? "♥ Saved" : "♡ Save"}</button>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Salary</div><div className="font-semibold">{job.salaryMin ? `${job.salaryMin} - ${job.salaryMax} ${job.currency}` : "Not disclosed"}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Posted</div><div className="font-semibold">{new Date(job.postedAt).toLocaleDateString()}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Deadline</div><div className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open"}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Views</div><div className="font-semibold">{job.views}</div></div>
            </div>

            <div className="mt-8">
              <h3 className="font-bold">Job Description</h3>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{job.description}</div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold">Requirements</h3>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{job.requirements || "No specific requirements listed."}</div>
            </div>

            {isGov && (
              <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="text-sm font-bold text-emerald-800">🏛️ Government Job Notice</div>
                <div className="mt-1 text-xs text-emerald-700">This is a {job.country} government position in {job.department || "general department"}. Ensure you meet eligibility per official notification. This platform verifies via admin approval queue.</div>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <h4 className="text-sm font-bold">Report this job</h4>
              <div className="mt-2 flex gap-2">
                <input value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Reason (e.g. scam, fake, policy violation)" className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm" />
                <button onClick={handleReport} className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Report</button>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">All reports reviewed per Privacy Policy. Auto-flag keywords: scam, fake, illegal.</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold">Apply for this job</h3>
            <p className="mt-1 text-xs text-slate-500">Your profile + resume will be shared. Employer sees in dashboard.</p>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Cover letter (optional)" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm" rows={4} />
            <button onClick={handleApply} disabled={applying} className="mt-3 w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50">{applying ? "Applying..." : "Apply Now"}</button>
            <div className="mt-3 text-[11px] text-slate-500 text-center">By applying, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold">Company</h3>
            <div className="mt-3 flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-100 grid place-items-center font-bold">{job.company?.name?.[0] || "C"}</div>
              <div>
                <div className="font-semibold text-sm">{job.company?.name || job.organizationName}</div>
                <div className="text-xs text-slate-500">{job.company?.industry} • {job.company?.location}</div>
                {job.company?.website && <a href={job.company.website} className="text-xs text-teal-700 hover:underline">{job.company.website}</a>}
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600">{job.company?.description || "Verified employer on GlobalJobs portal."}</div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="text-xs font-bold text-amber-800">📢 Sidebar Ad Zone (Country-targeted)</div>
            <div className="mt-1 text-[11px] text-amber-700">Advertisers apply, admin approves, then shown to matching country users.</div>
            <button className="mt-3 w-full rounded-full bg-amber-500 py-2 text-xs font-bold text-white">Advertise Here</button>
          </div>
        </div>
      </div>
    </div>
  );
}
