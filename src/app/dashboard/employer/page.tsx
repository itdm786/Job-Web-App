"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { COUNTRIES, CITIES_BY_COUNTRY, CATEGORIES, DEPARTMENTS, EMPLOYMENT_TYPES, LANGUAGES } from "@/lib/constants";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("post");
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "Islamabad",
    country: "Pakistan",
    department: "",
    category: "Information Technology",
    employmentType: "full-time",
    jobNature: "private",
    organizationName: "",
    salaryMin: "",
    salaryMax: "",
    requirements: "",
    deadline: "",
    language: "en",
    experienceLevel: "mid",
  });

  useEffect(() => {
    if (!user) return;
    fetch(`/api/companies?employerId=${user.id}`).then(r => r.json()).then(d => setCompany(d.company));
    fetch(`/api/jobs?companyId=${company?.id || ""}&status=all`).then(r => r.json()).then(d => {}).catch(()=>{});
    // get jobs via API filtering by company? We'll fetch all and filter client side via second call after company loaded
  }, [user]);

  useEffect(() => {
    if (company?.id) {
      fetch(`/api/jobs?companyId=${company.id}&status=all&limit=100`).then(r => r.json()).then(d => setJobs(d.jobs || []));
      fetch(`/api/applications?companyId=${company.id}`).then(r => r.json()).then(d => setApplications(d.applications || []));
    }
  }, [company]);

  const handleCompanySave = async () => {
    if (!user) return;
    await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employerId: user.id, name: company?.name || `${user.name}'s Company`, industry: company?.industry || "IT", location: company?.location || "Islamabad", country: company?.country || "Pakistan", description: company?.description, website: company?.website, logo: company?.logo }) });
    alert("Company profile saved");
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) { alert("Create company first"); return; }
    const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: company.id, ...form }) });
    const data = await res.json();
    if (res.ok) {
      alert(`Job posted! Status: ${data.job.status} — Will go live after Admin/Manager approval.`);
      setForm({ ...form, title: "", description: "" });
      fetch(`/api/jobs?companyId=${company.id}&status=all&limit=100`).then(r => r.json()).then(d => setJobs(d.jobs || []));
    } else alert(data.error);
  };

  if (!user) return <div className="min-h-screen grid place-items-center"><Link href="/auth?role=employer" className="rounded-full bg-slate-900 px-5 py-2 text-white">Login as Employer</Link></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employer / Recruiter Portal</h1>
          <div className="text-xs text-slate-500">Company page like Indeed • Jobs go to Pending Review</div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
              {[
                { id: "post", label: "📝 Post a Job (Pending)" },
                { id: "jobs", label: "💼 My Posted Jobs", count: jobs.length },
                { id: "applicants", label: "👥 Applicants", count: applications.length },
                { id: "company", label: "🏢 Company Profile" },
                { id: "analytics", label: "📊 Analytics" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium flex justify-between ${activeTab === tab.id ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                  <span>{tab.label}</span>{tab.count !== undefined && <span className="text-xs">{tab.count}</span>}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-amber-700 p-4 text-white text-xs">
              <div className="font-bold">Approval Workflow</div>
              <div className="mt-2 space-y-1 opacity-90">
                <div>1. Employer posts job</div>
                <div>2. Status = Pending Review</div>
                <div>3. Admin/Manager approves</div>
                <div>4. Job goes live globally</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            {activeTab === "company" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-lg">Company Profile (Indeed-like)</h2>
                <p className="text-xs text-slate-500">This is what job seekers see.</p>
                {!company ? <div className="mt-6">Loading or create company...</div> : (
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold">Company Name</label><input value={company.name || ""} onChange={e => setCompany({ ...company, name: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                    <div><label className="text-xs font-semibold">Industry</label><select value={company.industry || "IT"} onChange={e => setCompany({ ...company, industry: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="text-xs font-semibold">Location</label><input value={company.location || ""} onChange={e => setCompany({ ...company, location: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                    <div><label className="text-xs font-semibold">Country</label><select value={company.country || "Pakistan"} onChange={e => setCompany({ ...company, country: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="md:col-span-2"><label className="text-xs font-semibold">Description</label><textarea value={company.description || ""} onChange={e => setCompany({ ...company, description: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                    <div><label className="text-xs font-semibold">Website</label><input value={company.website || ""} onChange={e => setCompany({ ...company, website: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                    <div><label className="text-xs font-semibold">Logo URL (S3 mock)</label><input value={company.logo || ""} onChange={e => setCompany({ ...company, logo: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                  </div>
                )}
                <button onClick={handleCompanySave} className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white">Save Company</button>
              </div>
            )}

            {activeTab === "post" && (
              <form onSubmit={handlePostJob} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="font-bold text-lg">Post a New Job — Goes to Pending Review</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="text-xs font-semibold">Job Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" placeholder="e.g. Assistant Director Federal Government" /></div>
                  <div><label className="text-xs font-semibold">Country *</label><select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">City *</label><select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{Object.values(CITIES_BY_COUNTRY).flat().map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">Job Nature * (Gov/Private logic)</label><select value={form.jobNature} onChange={e => setForm({ ...form, jobNature: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm"><option value="private">Private</option><option value="government">Government</option></select></div>
                  <div><label className="text-xs font-semibold">Department (if gov)</label><select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm"><option value="">Select</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">Organization Name</label><input value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} placeholder="FPSC, Ministry, Google" className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                  <div><label className="text-xs font-semibold">Category / Industry</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">Employment Type</label><select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">Salary Min</label><input type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                  <div><label className="text-xs font-semibold">Salary Max</label><input type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                  <div><label className="text-xs font-semibold">Language of Posting</label><select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
                  <div><label className="text-xs font-semibold">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                  <div className="md:col-span-2"><label className="text-xs font-semibold">Description *</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" placeholder="Full job description..." /></div>
                  <div className="md:col-span-2"><label className="text-xs font-semibold">Requirements</label><textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
                </div>
                <button type="submit" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white">Post Job → Pending Review</button>
                <div className="text-[11px] text-slate-500">Job status will be pending until Admin/Manager approves. Auto-flag if contains illegal/scam keywords.</div>
              </form>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-3">
                <h2 className="font-bold">My Posted Jobs — Status tracking</h2>
                {jobs.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">No jobs posted yet. Post first job — it will go to Pending queue.</div> :
                  jobs.map((j: any) => (
                    <div key={j.id} className="rounded-2xl border bg-white p-4 flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{j.title}</div>
                        <div className="text-xs text-slate-500">{j.city}, {j.country} • {j.jobNature} • {j.employmentType}</div>
                        <div className="mt-1 flex gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${j.status === "approved" ? "bg-emerald-50 text-emerald-700" : j.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{j.status.toUpperCase()}</span><span className="text-xs text-slate-500">Views: {j.views}</span></div>
                      </div>
                      <Link href={`/jobs/${j.id}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs">View</Link>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab === "applicants" && (
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="font-bold">Applicants List & Analytics</h2>
                {applications.length === 0 ? <div className="mt-4 text-sm text-slate-500">No applicants yet. Once seekers apply, they appear here.</div> :
                  <div className="mt-4 space-y-2">
                    {applications.map((a: any, i: number) => (
                      <div key={i} className="rounded-xl bg-slate-50 p-3 flex justify-between">
                        <div><div className="text-sm font-medium">{a.job?.title}</div><div className="text-xs text-slate-500">{a.application.status} • {new Date(a.application.appliedAt).toLocaleDateString()}</div></div>
                        <button className="rounded-full bg-white border px-3 py-1 text-xs">View Resume</button>
                      </div>
                    ))}
                  </div>
                }
                <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-teal-50 p-3"><div className="font-bold">Total Applicants</div><div className="text-lg">{applications.length}</div></div>
                  <div className="rounded-xl bg-emerald-50 p-3"><div className="font-bold">Views</div><div className="text-lg">{jobs.reduce((acc, j) => acc + (j.views || 0), 0)}</div></div>
                  <div className="rounded-xl bg-amber-50 p-3"><div className="font-bold">Pending Jobs</div><div className="text-lg">{jobs.filter((j:any)=>j.status==="pending").length}</div></div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="font-bold">Employer Analytics Dashboard</h2>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Total Jobs</div><div className="text-xl font-bold">{jobs.length}</div></div>
                  <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Active</div><div className="text-xl font-bold">{jobs.filter((j:any)=>j.status==="approved").length}</div></div>
                  <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Applicants</div><div className="text-xl font-bold">{applications.length}</div></div>
                  <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Pending</div><div className="text-xl font-bold">{jobs.filter((j:any)=>j.status==="pending").length}</div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
