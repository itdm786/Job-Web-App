"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JobCard from "@/components/JobCard";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [edit, setEdit] = useState({ headline: "", bio: "", skills: "", city: "", country: "", phone: "", resumeUrl: "" });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "seeker" && user.role !== "admin") {
      // allow admin to view
    }
    fetch(`/api/companies?employerId=${user.id}`).then(()=>{}); // dummy
    // load applications and saved
    fetch(`/api/applications?seekerId=${user.id}`).then(r => r.json()).then(d => setApplications(d.applications || []));
    fetch(`/api/saved?seekerId=${user.id}`).then(r => r.json()).then(d => setSaved(d.saved || []));

    // Mock profile fetch - we don't have endpoint, create local state
    setEdit({
      headline: "Software Engineer | Open to remote",
      bio: "Experienced developer looking for gov & private opportunities",
      skills: "React, Next.js, Node, Python",
      city: "Islamabad",
      country: "Pakistan",
      phone: "+92 300 1234567",
      resumeUrl: "",
    });
  }, [user]);

  if (!user) return <div className="min-h-screen grid place-items-center"><Link href="/auth" className="rounded-full bg-slate-900 px-5 py-2 text-white">Login as seeker</Link></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Seeker Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/jobs" className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm">Browse Jobs</Link>
            <Link href="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">Home</Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="h-12 w-12 rounded-full" alt="" />
                <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                  <div className="mt-1 inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">{user.role}</div>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                {[
                  { id: "profile", label: "👤 Profile (Indeed-like)", count: null },
                  { id: "applications", label: "📨 My Applications", count: applications.length },
                  { id: "saved", label: "♥ Saved Jobs", count: saved.length },
                  { id: "alerts", label: "🔔 Job Alerts", count: 2 },
                  { id: "preferences", label: "⚙️ Job Preferences", count: null },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-left ${activeTab === item.id ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                    <span>{item.label}</span>
                    {item.count !== null && <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === item.id ? "bg-white/20" : "bg-slate-100"}`}>{item.count}</span>}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <div className="text-xs font-bold text-amber-800">📄 Resume Upload (S3/Cloudinary)</div>
                <div className="text-[11px] text-amber-700 mt-1">In production store on AWS S3 via presigned URL. Mock for demo.</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-lg">Complete your profile — Indeed/LinkedIn style</h2>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Headline</label>
                    <input value={edit.headline} onChange={e => setEdit({ ...edit, headline: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Phone</label>
                    <input value={edit.phone} onChange={e => setEdit({ ...edit, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">City</label>
                    <input value={edit.city} onChange={e => setEdit({ ...edit, city: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Country</label>
                    <input value={edit.country} onChange={e => setEdit({ ...edit, country: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold">Bio</label>
                    <textarea value={edit.bio} onChange={e => setEdit({ ...edit, bio: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold">Skills (comma separated)</label>
                    <input value={edit.skills} onChange={e => setEdit({ ...edit, skills: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold">Resume URL (S3/Cloudinary mock)</label>
                    <input value={edit.resumeUrl} onChange={e => setEdit({ ...edit, resumeUrl: e.target.value })} placeholder="https://..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="font-bold text-sm">🎓 Education</div>
                    <div className="mt-2 text-xs text-slate-600">Add multiple degrees — e.g. BS Computer Science, Islamabad University, 2020-2024</div>
                    <button className="mt-3 rounded-full bg-white border px-3 py-1 text-xs">+ Add Education</button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="font-bold text-sm">💼 Experience</div>
                    <div className="mt-2 text-xs text-slate-600">Add work experience with company, role, duration</div>
                    <button className="mt-3 rounded-full bg-white border px-3 py-1 text-xs">+ Add Experience</button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="font-bold text-sm">🎯 Preferences</div>
                    <div className="mt-2 text-xs text-slate-600">Desired city, industry, job type, salary expectation</div>
                    <button className="mt-3 rounded-full bg-white border px-3 py-1 text-xs">Edit Preferences</button>
                  </div>
                </div>

                <button className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white">Save Profile</button>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg">Application Tracking / History</h2>
                {applications.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">No applications yet. Apply to jobs to see tracking history (applied → reviewed → shortlisted → hired)</div> :
                  applications.map((a: any) => (
                    <div key={a.application.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{a.job?.title || "Job"}</div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{a.application.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{a.job?.city}, {a.job?.country} • Applied {new Date(a.application.appliedAt).toLocaleDateString()}</div>
                      <div className="mt-3 flex gap-1">
                        {["applied", "reviewed", "shortlisted", "hired"].map(s => (
                          <div key={s} className={`h-1 flex-1 rounded-full ${["applied", "reviewed", "shortlisted", "hired"].indexOf(a.application.status) >= ["applied", "reviewed", "shortlisted", "hired"].indexOf(s) ? "bg-teal-700" : "bg-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab === "saved" && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg">Saved Jobs</h2>
                {saved.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">No saved jobs</div> :
                  saved.map((s: any) => s.job && <JobCard key={s.saved.id} job={{ ...s.job, company: s.company }} />)
                }
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">Job Alerts / Notifications</h2>
                <p className="text-xs text-slate-500 mt-1">Email based on saved filters (SendGrid/Mailgun in production)</p>
                <div className="mt-4 space-y-3">
                  {[
                    { title: "Pakistan Government Jobs", filters: "Pakistan + Government + Islamabad" },
                    { title: "Remote Software Jobs", filters: "Remote + IT + $3000+" },
                  ].map((al, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-4 flex items-center justify-between">
                      <div><div className="font-medium text-sm">{al.title}</div><div className="text-xs text-slate-500">{al.filters}</div></div>
                      <div className="text-xs font-bold text-emerald-600">Active • Email daily</div>
                    </div>
                  ))}
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">+ Create Alert from current filters</button>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">Job Preferences (Indeed-like)</h2>
                <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div><div className="font-medium">Desired City</div><div className="text-slate-500">Islamabad, Lahore, Remote</div></div>
                  <div><div className="font-medium">Industry</div><div className="text-slate-500">IT, Government</div></div>
                  <div><div className="font-medium">Job Type</div><div className="text-slate-500">Full-time, Contract</div></div>
                  <div><div className="font-medium">Salary Expectation</div><div className="text-slate-500">$2000 - $5000</div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
